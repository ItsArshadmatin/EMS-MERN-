// routes/payroll.js

const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../middleware/auth");

const {
  generatePayroll,
  getPayrollForEmployee,
  getAllPayroll,
  getPayrollHistory,
  generatePayrollForAll
} = require("../controllers/payrollController");

// Admin: Generate for one employee
router.post("/generate", auth, adminOnly, generatePayroll);

// Admin: Generate for all employees
router.post("/generate-all", auth, adminOnly, generatePayrollForAll);

// Employee: View their own payroll
router.get("/my", auth, getPayrollForEmployee);

// Admin: View all payroll
router.get("/all", auth, adminOnly, getAllPayroll);

// Admin: View payroll history of a specific employee
router.get("/history/:employee_id", auth, adminOnly, getPayrollHistory);

module.exports = router;

