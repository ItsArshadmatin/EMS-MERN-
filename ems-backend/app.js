// app.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

console.log("Starting server...");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json()); // <-- Parse JSON for ALL routes

// Debug every request
app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

// DB
const pool = require("./db");

// ROUTES (order matters)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employee"));
app.use("/api/departments", require("./routes/department"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leaves", require("./routes/leave"));
app.use("/api/payroll", require("./routes/payroll"));
   // <-- Your route is here now

// Test DB (optional)
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS result");
    res.json({ db: "connected", result: rows[0].result });
  } catch (err) {
    res.status(500).json({ error: "DB connection failed" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    url: req.url,
    method: req.method,
  });
});

// START SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
