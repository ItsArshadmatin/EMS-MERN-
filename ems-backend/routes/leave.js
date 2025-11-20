const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../middleware/auth");


const { applyLeave, approveLeave, rejectLeave, getAllLeaves, getLeaveBalance } = require("../controllers/leaveController");

router.post("/apply", auth, applyLeave);

// ADMIN ONLY ROUTES
router.put("/approve/:id", auth, approveLeave);
router.put("/reject/:id", auth, rejectLeave);

// Optional: Get all leave requests
router.get("/all", auth, getAllLeaves);

router.get("/balance", auth, getLeaveBalance);




module.exports = router;
