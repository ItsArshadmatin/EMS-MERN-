const pool = require("../db");

// Create department
exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM departments WHERE name = ? AND is_active = 1",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Department already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO departments (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    res.json({
      message: "Department created successfully",
      department_id: result.insertId
    });

  } catch (err) {
    console.error("Create Department Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, created_at, is_active 
       FROM departments 
       WHERE is_active = 1`
    );

    res.json({
      count: rows.length,
      departments: rows
    });

  } catch (err) {
    console.error("Get Departments Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, created_at, is_active 
       FROM departments WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Get Department Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM departments WHERE id = ? AND is_active = 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    await pool.query(
      "UPDATE departments SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );

    res.json({ message: "Department updated successfully" });

  } catch (err) {
    console.error("Update Department Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Soft delete department
exports.deleteDepartment = async (req, res) => {
  const id = req.params.id;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM departments WHERE id = ? AND is_active = 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Department not found or inactive" });
    }

    await pool.query(
      "UPDATE departments SET is_active = 0 WHERE id = ?",
      [id]
    );

    res.json({ message: "Department deactivated successfully (soft delete)" });

  } catch (err) {
    console.error("Delete Department Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
