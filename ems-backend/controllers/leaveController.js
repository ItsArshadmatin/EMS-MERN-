const pool = require("../db");

exports.applyLeave = async (req, res) => {
  try {
    const { leave_type_id, start_date, end_date, reason } = req.body;

    // Validate body
    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ error: "leave_type_id, start_date, end_date are required" });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: "start_date cannot be after end_date" });
    }

    // Find employee ID from the logged in user
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (emp.length === 0) {
      return res.status(400).json({ error: "Employee profile not found" });
    }

    const employee_id = emp[0].id;

    // Check if leave type exists
    const [lt] = await pool.query(
      "SELECT * FROM leave_types WHERE id = ?",
      [leave_type_id]
    );

    if (lt.length === 0) {
      return res.status(400).json({ error: "Invalid leave_type_id" });
    }

    // Check overlap with existing leaves
    const [overlap] = await pool.query(
      `SELECT * FROM leaves
       WHERE employee_id = ?
       AND status != 'rejected'
       AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?)
       )`,
      [employee_id, start_date, start_date, end_date, end_date]
    );

    if (overlap.length > 0) {
      return res.status(400).json({ error: "Overlapping leave exists" });
    }

    // Check if employee already present (checked in) on start date
    const [present] = await pool.query(
      `SELECT * FROM attendance
       WHERE employee_id = ?
       AND date = ?`,
      [employee_id, start_date]
    );

    if (present.length > 0) {
      return res.status(400).json({ error: "Cannot apply leave on a day you were present" });
    }

    // Insert leave request
    const [result] = await pool.query(
      `INSERT INTO leaves (employee_id, leave_type_id, start_date, end_date, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, leave_type_id, start_date, end_date, reason]
    );

    return res.json({
      message: "Leave applied successfully",
      leave_id: result.insertId
    });

  } catch (error) {
    console.error("Apply Leave Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    // For employees, get only their leaves
    if (req.user.role !== "admin") {
      const [emp] = await pool.query(
        "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
        [req.user.id]
      );

      if (emp.length === 0) {
        return res.status(400).json({ error: "Employee profile not found" });
      }

      const [rows] = await pool.query(`
        SELECT l.*, lt.name AS leave_type
        FROM leaves l
        JOIN leave_types lt ON l.leave_type_id = lt.id
        WHERE l.employee_id = ?
        ORDER BY l.applied_at DESC
      `, [emp[0].id]);

      return res.json(rows);
    }

    // For admin, get all leaves
    const [rows] = await pool.query(`
      SELECT l.*, u.name AS employee_name, lt.name AS leave_type
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      JOIN leave_types lt ON l.leave_type_id = lt.id
      ORDER BY l.applied_at DESC
    `);

    return res.json(rows);

  } catch (error) {
    console.error("Get All Leaves Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.approveLeave = async (req, res) => {
  try {
    const leave_id = req.params.id;
    const { status } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    // Only admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only action" });
    }

    // Fetch leave
    const [leave] = await pool.query(
      "SELECT * FROM leaves WHERE id = ?",
      [leave_id]
    );

    if (leave.length === 0) {
      return res.status(404).json({ error: "Leave not found" });
    }

    const leaveData = leave[0];

    // If rejected → no balance update
    if (status === "rejected") {
      await pool.query(
        "UPDATE leaves SET status = 'rejected' WHERE id = ?",
        [leave_id]
      );

      return res.json({
        message: "Leave rejected successfully",
        leave_id
      });
    }

    // ⭐ APPROVAL LOGIC STARTS ⭐

    // Days count
    const start = new Date(leaveData.start_date);
    const end = new Date(leaveData.end_date);
    const diffDays = Math.ceil((end - start) / 86400000) + 1;

    // Fetch balance
    const [bal] = await pool.query(
      "SELECT * FROM leave_balance WHERE employee_id = ? AND leave_type_id = ?",
      [leaveData.employee_id, leaveData.leave_type_id]
    );

    if (bal.length === 0) {
      return res.status(400).json({ error: "Leave balance entry missing for this employee" });
    }

    const balance = bal[0];

    // Prevent exceeding balance
    if (balance.used_days + diffDays > balance.total_days) {
      return res.status(400).json({
        error: "Insufficient leave balance",
        remaining: balance.total_days - balance.used_days
      });
    }

    // UPDATE leave status
    await pool.query(
      "UPDATE leaves SET status = 'approved' WHERE id = ?",
      [leave_id]
    );

    // ⭐⭐ THIS PART WAS MISSING — UPDATE LEAVE BALANCE ⭐⭐
    await pool.query(
      `UPDATE leave_balance 
       SET used_days = used_days + ?
       WHERE employee_id = ? AND leave_type_id = ?`,
      [diffDays, leaveData.employee_id, leaveData.leave_type_id]
    );

    // ⭐ APPROVAL ENDS ⭐

    return res.json({
      message: "Leave approved successfully",
      leave_id,
      days_used: diffDays
    });

  } catch (error) {
    console.error("Approve Leave Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};





exports.rejectLeave = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can reject leaves" });
    }

    const leave_id = req.params.id;

    await pool.query(
      "UPDATE leaves SET status = 'rejected' WHERE id = ?",
      [leave_id]
    );

    return res.json({
      message: "Leave rejected successfully",
      leave_id,
    });

  } catch (error) {
    console.error("Reject Leave Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    // Find employee ID from logged-in user
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (emp.length === 0) {
      return res.status(400).json({ error: "Employee profile not found" });
    }

    const employee_id = emp[0].id;

    // Fetch leave balance
    const [rows] = await pool.query(
      `SELECT 
          lb.leave_type_id,
          lt.name AS leave_type,
          lb.total_days,
          lb.used_days,
          (lb.total_days - lb.used_days) AS remaining
       FROM leave_balance lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.employee_id = ?`,
      [employee_id]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Get Leave Balance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
