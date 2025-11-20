const pool = require("../db");

exports.checkIn = async (req, res) => {
  try {
    const [emp] = await pool.query(
  "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
  [req.user.id]
);

if (emp.length === 0) {
  return res.status(400).json({
    error: "No employee profile found for this user",
  });
}

const employee_id = emp[0].id;

    // Check if already checked in today
    const [existing] = await pool.query(
      "SELECT * FROM attendance WHERE employee_id = ? AND date = CURDATE()",
      [employee_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Already checked in today",
      });
    }

    // Insert new attendance record
    await pool.query(
      `INSERT INTO attendance (employee_id, check_in, date)
       VALUES (?, NOW(), CURDATE())`,
      [employee_id]
    );

    return res.json({
      message: "Check-in successful",
    });

  } catch (error) {
    console.error("Check-in Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    // Find employee linked to user
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (emp.length === 0) {
      return res.status(400).json({
        error: "No employee profile found for this user",
      });
    }

    const employee_id = emp[0].id;

    // Find today's attendance
    const [attendance] = await pool.query(
      `SELECT * FROM attendance 
       WHERE employee_id = ? AND date = CURDATE()`,
      [employee_id]
    );

    if (attendance.length === 0) {
      return res.status(400).json({
        error: "You have not checked in today",
      });
    }

    // If already checked out
    if (attendance[0].check_out !== null) {
      return res.status(400).json({
        error: "You have already checked out today",
      });
    }

    // Calculate total hours
    const checkInTime = attendance[0].check_in;
    const now = new Date();

    const diffMs = now - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60); // ms → hours
    const totalHours = parseFloat(diffHours.toFixed(2));

    // Update record
    await pool.query(
      `UPDATE attendance 
       SET check_out = NOW(), total_hours = ? 
       WHERE id = ?`,
      [totalHours, attendance[0].id]
    );

    return res.json({
      message: "Check-out successful",
      total_hours: totalHours,
    });

  } catch (error) {
    console.error("Check-out Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    // Get employee linked to logged-in user
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (emp.length === 0) {
      return res.status(400).json({ error: "No employee profile found" });
    }

    const employee_id = emp[0].id;

    // Get today's attendance
    const [rows] = await pool.query(
      `SELECT check_in, check_out, total_hours 
       FROM attendance 
       WHERE employee_id = ? AND date = CURDATE()`,
      [employee_id]
    );

    if (rows.length === 0) {
      return res.json({
        checked_in: false,
        checked_out: false,
        check_in: null,
        check_out: null,
        total_hours: 0
      });
    }

    const record = rows[0];

    return res.json({
      checked_in: true,
      checked_out: record.check_out !== null,
      check_in: record.check_in,
      check_out: record.check_out,
      total_hours: record.total_hours
    });

  } catch (error) {
    console.error("Today Status Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Get employee ID from logged-in user
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (emp.length === 0) {
      return res.status(400).json({ error: "No employee profile found" });
    }

    const employee_id = emp[0].id;

    let query = `
      SELECT date, check_in, check_out, total_hours
      FROM attendance
      WHERE employee_id = ?
    `;
    let params = [employee_id];

    // Apply filters if month & year provided
    if (month && year) {
      query += " AND MONTH(date) = ? AND YEAR(date) = ?";
      params.push(month, year);
    }

    // Order newest first
    query += " ORDER BY date DESC";

    const [rows] = await pool.query(query, params);

    return res.json({
      employee_id,
      count: rows.length,
      records: rows
    });

  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    // Get employee ID
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ? AND is_active = 1",
      [req.user.id]
    );

    if (emp.length === 0) {
      return res.status(400).json({ error: "No employee profile found" });
    }

    const employee_id = emp[0].id;

    // Fetch all attendance of the given month
    const [rows] = await pool.query(
      `SELECT date, check_in, check_out, total_hours
       FROM attendance
       WHERE employee_id = ?
       AND MONTH(date) = ?
       AND YEAR(date) = ?
       ORDER BY date ASC`,
      [employee_id, month, year]
    );

    // Calculate metrics
    const working_days = rows.length;
    const total_hours = rows.reduce((sum, r) => sum + Number(r.total_hours || 0), 0);
    const average_hours = working_days ? total_hours / working_days : 0;

    const max_hours = rows.length ? Math.max(...rows.map(r => Number(r.total_hours || 0))) : 0;
    const min_hours = rows.length ? Math.min(...rows.map(r => Number(r.total_hours || 0))) : 0;

    const missing_checkout_days = rows.filter(r => r.check_out === null).length;

    // Calculate total days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const absent_days = daysInMonth - working_days;

    return res.json({
      employee_id,
      month: Number(month),
      year: Number(year),

      working_days,
      absent_days,

      total_hours: Number(total_hours.toFixed(2)),
      average_hours: Number(average_hours.toFixed(2)),
      max_hours: Number(max_hours.toFixed(2)),
      min_hours: Number(min_hours.toFixed(2)),

      missing_checkout_days
    });

  } catch (error) {
    console.error("Monthly Summary Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

