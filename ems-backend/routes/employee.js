const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const employeeController = require("../controllers/employeeController");

// Create employee with user account (Admin only)
router.post("/create-with-user", auth, adminOnly, employeeController.createEmployeeWithUser);

// Create employee (Admin only)
router.post("/", auth, adminOnly, employeeController.createEmployee);

// Get all employees (Admin only)
router.get("/", auth, adminOnly, employeeController.getAllEmployees);

router.get("/search/all", auth, adminOnly, employeeController.searchEmployees);

// Get employee by ID
router.get("/:id", auth, adminOnly, employeeController.getEmployeeById);

// Update employee
router.put("/:id", auth, adminOnly, employeeController.updateEmployee);

// Soft delete employee
router.delete("/:id", auth, adminOnly, employeeController.deleteEmployee);

// Reset employee password (Admin only)
router.post("/:employee_id/reset-password", auth, adminOnly, employeeController.resetEmployeePassword);

module.exports = router;
