const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// This middleware checks if user has a valid token
exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "No authorization header provided" });

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token)
    return res.status(401).json({ error: "Token missing or invalid format" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // store user info for next middleware/route
    next(); // continue
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Only admin can access certain routes (protect admin APIs)
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};
