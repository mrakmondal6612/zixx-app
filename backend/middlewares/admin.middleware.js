const jwt = require("jsonwebtoken");
require("dotenv").config();

// Admin middleware
exports.adminMiddleware = (req, res, next) => {
  // Check for token in Authorization header or cookies
  let token;
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided or invalid format" });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
  if (decoded.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  // Optionally attach user info to request
  req.userid = decoded.userid;
  req.user = decoded;
  next();
}
