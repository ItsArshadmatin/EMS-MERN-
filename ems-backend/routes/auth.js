// routes/auth.js

console.log("Auth routes file LOADED");

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Debug route to test router
router.get("/test", (req, res) => {
  console.log("Auth TEST route hit");
  res.json({ message: "Auth route working" });
});

const { auth, adminOnly } = require("../middleware/auth");

// Protected route (any logged-in user)
router.get("/protected", auth, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user
  });
});

// Admin-only route
router.get("/admin-only", auth, adminOnly, (req, res) => {
  res.json({
    message: "Admin-only route accessed!",
    user: req.user
  });
});


// REGISTER route
router.post("/register", authController.register);

router.post("/login", authController.login);


console.log("Auth router EXPORTING");

module.exports = router;
