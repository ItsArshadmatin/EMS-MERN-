const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// This middleware checks if user has a valid token
exports.auth = (req, res, next) => {
  console.log("Auth middleware hit for:", req.method, req.path);
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader);

  if (!authHeader) {
    console.log("No auth header provided");
    return res.status(401).json({ error: "No authorization header provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
  console.log("Extracted token:", token ? "Present" : "Missing");

  if (!token) {
    console.log("Token missing or invalid format");
    return res.status(401).json({ error: "Token missing or invalid format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded successfully for user:", decoded.email);
    req.user = decoded; // store user info for next middleware/route
    next(); // continue
  } catch (err) {
    console.log("Token verification failed:", err.message);
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
