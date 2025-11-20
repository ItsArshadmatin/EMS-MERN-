const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const departmentController = require("../controllers/departmentController");

// Create department
router.post("/", auth, adminOnly, departmentController.createDepartment);

// Get all departments
router.get("/", auth, adminOnly, departmentController.getAllDepartments);

// Get department by ID
router.get("/:id", auth, adminOnly, departmentController.getDepartmentById);

// Update department
router.put("/:id", auth, adminOnly, departmentController.updateDepartment);

// Soft delete department
router.delete("/:id", auth, adminOnly, departmentController.deleteDepartment);

module.exports = router;
