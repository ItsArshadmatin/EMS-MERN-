const pool = require("../db");
const bcrypt = require("bcryptjs");

// Create employee with user account
exports.createEmployeeWithUser = async (req, res) => {
  const {
    name,
    email,
    department_id,
    position,
    salary,
    hire_date
  } = req.body;

  console.log("Create Employee Request:", req.body);

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Check if user already exists
    const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Create user account with default password
    const defaultPassword = "password123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const [userResult] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'employee')",
      [name, email, hashedPassword]
    );

    // Create employee record
    const [employeeResult] = await pool.query(
      `INSERT INTO employees (user_id, department_id, designation, base_salary, date_of_joining)
       VALUES (?, ?, ?, ?, ?)`,
      [userResult.insertId, department_id || null, position || null, salary || 0, hire_date || null]
    );

    // Create leave balance entries
    const employee_id = employeeResult.insertId;
    const [types] = await pool.query("SELECT id, default_days FROM leave_types");
    
    for (let t of types) {
      await pool.query(
        `INSERT INTO leave_balance (employee_id, leave_type_id, total_days)
         VALUES (?, ?, ?)`,
        [employee_id, t.id, t.default_days]
      );
    }

    res.json({
      message: "Employee created successfully",
      employee_id: employee_id,
      user_id: userResult.insertId,
      default_password: defaultPassword,
      login_email: email
    });
  } catch (err) {
    console.error("Create Employee With User Error:", err);
    console.error("Request body:", req.body);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Create employee profile for an existing user
exports.createEmployee = async (req, res) => {
  const {
    user_id,
    department_id,
    designation,
    base_salary,
    date_of_joining
  } = req.body;

  // Validation
  if (!user_id)
    return res.status(400).json({ error: "user_id is required" });

  try {
    // Check if user exists
    const [user] = await pool.query("SELECT id FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user.length === 0)
      return res.status(400).json({ error: "User does not exist" });

    // Insert employee record
    const [result] = await pool.query(
      `INSERT INTO employees 
       (user_id, department_id, designation, base_salary, date_of_joining)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user_id,
        department_id || null,
        designation || null,
        base_salary || 0,
        date_of_joining || null
      ]
    );

    // ⭐ Create leave balance entries automatically
const employee_id = result.insertId;

// Fetch all leave types
const [types] = await pool.query("SELECT id, default_days FROM leave_types");

// Insert leave balance for every type (Casual, Sick, Paid…)
for (let t of types) {
  await pool.query(
    `INSERT INTO leave_balance (employee_id, leave_type_id, total_days)
     VALUES (?, ?, ?)`,
    [employee_id, t.id, t.default_days]
  );
}

    res.json({
      message: "Employee profile created successfully",
      employee_id: result.insertId,
    });
  } catch (err) {
    console.error("Create Employee Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
    e.id,
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    e.department_id,
    d.name AS department_name,
    d.description AS department_description,
    e.designation,
    e.base_salary,
    e.date_of_joining,
    e.is_active
FROM employees e
JOIN users u ON e.user_id = u.id
LEFT JOIN departments d ON e.department_id = d.id
WHERE e.is_active = 1
`

    );

    res.json(rows);
  } catch (err) {
    console.error("Get All Employees Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
    e.id AS employee_id,
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    e.department_id,
    d.name AS department_name,
    d.description AS department_description,
    e.designation,
    e.base_salary,
    e.date_of_joining,
    e.is_active
FROM employees e
JOIN users u ON e.user_id = u.id
LEFT JOIN departments d ON e.department_id = d.id
WHERE e.id = ? AND e.is_active = 1
`,
      [employeeId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Employee not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Get Employee By ID Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  const employeeId = req.params.id;

  const {
    department_id,
    designation,
    base_salary,
    date_of_joining
  } = req.body;

  try {
    // Check if employee exists
    const [existing] = await pool.query(
      "SELECT id FROM employees WHERE id = ?",
      [employeeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Update the employee
    await pool.query(
      `UPDATE employees 
       SET 
         department_id = ?, 
         designation = ?, 
         base_salary = ?, 
         date_of_joining = ?
       WHERE id = ?`,
      [
        department_id || null,
        designation || null,
        base_salary || 0,
        date_of_joining || null,
        employeeId
      ]
    );

    res.json({ message: "Employee updated successfully" });

  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Soft delete employee
exports.deleteEmployee = async (req, res) => {
  const employeeId = req.params.id;

  try {
    // Check if employee exists
    const [employee] = await pool.query(
      "SELECT id FROM employees WHERE id = ? AND is_active = 1",
      [employeeId]
    );

    if (employee.length === 0) {
      return res.status(404).json({ error: "Employee not found or already inactive" });
    }

    // Soft delete employee
    await pool.query(
      "UPDATE employees SET is_active = 0 WHERE id = ?",
      [employeeId]
    );

    res.json({ message: "Employee deactivated successfully (soft delete)" });
  } catch (err) {
    console.error("Delete Employee Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Search + Filters + Pagination
exports.searchEmployees = async (req, res) => {
  try {
    const {
      name,
      email,
      department_id,
      designation,
      active,
      page = 1,
      limit = 10
    } = req.query;

    let offset = (page - 1) * limit;

    let query = `
      SELECT 
        e.id AS employee_id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        e.department_id,
        e.designation,
        e.base_salary,
        e.date_of_joining,
        e.is_active
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE 1 = 1
    `;

    let params = [];

    // Name search
    if (name) {
      query += " AND u.name LIKE ?";
      params.push(`%${name}%`);
    }

    // Email search
    if (email) {
      query += " AND u.email LIKE ?";
      params.push(`%${email}%`);
    }

    // Department filter
    if (department_id) {
      query += " AND e.department_id = ?";
      params.push(department_id);
    }

    // Designation filter
    if (designation) {
      query += " AND e.designation LIKE ?";
      params.push(`%${designation}%`);
    }

    // Active filter
    if (active === "1" || active === "0") {
      query += " AND e.is_active = ?";
      params.push(active);
    }

    // Pagination
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      count: rows.length,
      results: rows
    });

  } catch (err) {
    console.error("Search Employees Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Reset employee password (Admin only)
exports.resetEmployeePassword = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const newPassword = "password123"; // Default password
    
    // Get user_id from employee
    const [emp] = await pool.query("SELECT user_id FROM employees WHERE id = ?", [employee_id]);
    if (emp.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, emp[0].user_id]);
    
    res.json({
      message: "Password reset successfully",
      new_password: newPassword
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
