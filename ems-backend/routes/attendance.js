const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../middleware/auth");

const { checkIn, checkOut, getTodayStatus, getHistory, getMonthlySummary, getAllAttendance } = 
    require("../controllers/attendanceController");



router.post("/check-in", auth, checkIn);
router.post("/check-out", auth, checkOut);
router.get("/status-today", auth, getTodayStatus);
router.get("/history", auth, getHistory);
router.get("/summary", auth, getMonthlySummary);
router.get("/all", auth, adminOnly, getAllAttendance);




module.exports = router;
