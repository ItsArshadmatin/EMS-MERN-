const pool = require("../db");

// -------------------------------------
// GENERATE PAYROLL (ADMIN ONLY)
// -------------------------------------
// controllers/payrollController.js

exports.generatePayroll = async (req, res) => {
  try {
    const { employee_id, month, year } = req.body;

    if (!employee_id || !month || !year) {
      return res.status(400).json({ error: "employee_id, month, and year are required" });
    }

    // Prevent duplicates
    const [alreadyExists] = await pool.query(
      `SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?`,
      [employee_id, month, year]
    );

    if (alreadyExists.length > 0) {
      return res.status(409).json({
        message: "Payroll already generated for this employee for the selected month"
      });
    }

    // Fetch employee salary info
    const [emp] = await pool.query(
      "SELECT base_salary FROM employees WHERE id = ? AND is_active = 1",
      [employee_id]
    );

    if (emp.length === 0) {
      return res.status(404).json({ error: "Employee not found or inactive" });
    }

    const base_salary = emp[0].base_salary;

    // Example calculation (keep your logic)
    const earnings = base_salary;
    const deductions = 0;
    const net_salary = earnings - deductions;

    await pool.query(
      `INSERT INTO payroll (employee_id, month, year, base_salary, earnings, deductions, net_salary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, month, year, base_salary, earnings, deductions, net_salary]
    );

    res.json({
      message: "Payroll generated successfully",
      employee_id,
      month,
      year,
      net_salary
    });

  } catch (err) {
    console.error("Generate Payroll Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// -------------------------------------
// GET PAYROLL FOR LOGGED-IN EMPLOYEE
// -------------------------------------
exports.getPayrollForEmployee = async (req, res) => {
  try {
    const [emp] = await pool.query(
      "SELECT id FROM employees WHERE user_id = ?",
      [req.user.id]
    );

    if (emp.length === 0)
      return res.status(400).json({ error: "Employee profile not found" });

    const employee_id = emp[0].id;

    const [rows] = await pool.query(
      "SELECT * FROM payroll WHERE employee_id = ? ORDER BY generated_at DESC",
      [employee_id]
    );

    return res.json({ payroll: rows });

  } catch (error) {
    console.error("Payroll Fetch Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------------------------
// GET ALL PAYROLL RECORDS (ADMIN)
// -------------------------------------
exports.getAllPayroll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name 
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       ORDER BY generated_at DESC`
    );

    return res.json({ payroll: rows });

  } catch (error) {
    console.error("Get All Payroll Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPayrollHistory = async (req, res) => {
  try {
    const employee_id = req.params.employee_id;

    // Only admin should be allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only action" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM payroll WHERE employee_id = ? ORDER BY generated_at DESC",
      [employee_id]
    );

    return res.json({ payroll_history: rows });

  } catch (err) {
    console.error("Payroll History Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.generatePayrollForAll = async (req, res) => {
  try {
    // Admin check (you already have adminOnly middleware, but safe)
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only action" });
    }

    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    // Get all active employees
    const [emps] = await pool.query(
      "SELECT id FROM employees WHERE is_active = 1"
    );

    if (emps.length === 0) {
      return res.status(404).json({ error: "No active employees found" });
    }

    let results = [];
    let skipped = [];

    for (let emp of emps) {
      const employee_id = emp.id;

      // 🔥 Prevent duplicates
      const [exists] = await pool.query(
        `SELECT id FROM payroll
         WHERE employee_id = ? AND month = ? AND year = ?`,
        [employee_id, month, year]
      );

      if (exists.length > 0) {
        skipped.push(employee_id);
        continue;
      }

      // Fetch salary
      const [sal] = await pool.query(
        "SELECT base_salary FROM employees WHERE id = ?",
        [employee_id]
      );

      const base_salary = sal[0].base_salary;

      // Total hours worked
      const [stats] = await pool.query(
        `SELECT SUM(total_hours) AS hours
         FROM attendance
         WHERE employee_id = ?
         AND MONTH(date) = ?
         AND YEAR(date) = ?`,
        [employee_id, month, year]
      );

      const total_hours = stats[0].hours || 0;

      // Per hour rate
      const per_hour_rate = base_salary / (26 * 8);

      // Earnings calculation
      const earnings = per_hour_rate * total_hours;

      // Find unpaid approved leaves
      const [leaves] = await pool.query(
        `SELECT COUNT(*) AS unpaid
         FROM leaves
         WHERE employee_id = ?
         AND status = 'approved'
         AND MONTH(start_date) = ?
         AND YEAR(start_date) = ?`,
        [employee_id, month, year]
      );

      const unpaid_days = leaves[0].unpaid;
      const per_day_salary = base_salary / 26;
      const deductions = unpaid_days * per_day_salary;

      const net_salary = earnings - deductions;

      // Insert payroll
      const [result] = await pool.query(
        `INSERT INTO payroll
        (employee_id, month, year, base_salary, total_hours, per_hour_rate, earnings, deductions, net_salary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          month,
          year,
          base_salary,
          total_hours,
          per_hour_rate,
          earnings.toFixed(2),
          deductions.toFixed(2),
          net_salary.toFixed(2),
        ]
      );

      results.push({
        employee_id,
        payroll_id: result.insertId,
        net_salary,
      });
    }

    return res.json({
      message: "Payroll generated for all employees",
      month,
      year,
      generated: results,
      skipped
    });

  } catch (error) {
    console.error("Generate All Payroll Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
