// controllers/authController.js

console.log("AuthController LOADED");

const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.register = async (req, res) => {
  console.log("REGISTER API HIT");
  console.log("Request Body:", req.body);

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    console.log("Missing fields detected");
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    // Check existing user
    const [existing] = await pool.query("SELECT id FROM users WHERE email=?", [
      email,
    ]);

    if (existing.length > 0) {
      console.log("Email already exists");
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role || "employee"]
    );

    console.log("User inserted:", result);

    // JWT payload
    const userData = {
      id: result.insertId,
      name,
      email,
      role: role || "employee",
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: EXPIRES_IN });

    res.json({
      message: "User registered successfully",
      user: userData,
      token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  console.log("LOGIN API HIT");
  console.log("Request Body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing login fields");
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check user exists
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log("User not found");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Prepare payload
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate JWT
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: EXPIRES_IN });

    console.log("User logged in:", userData);

    res.json({
      message: "Login successful",
      user: userData,
      token,
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

