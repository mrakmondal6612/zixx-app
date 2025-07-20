// middlewares/Authentication.middleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticator = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized: No token provided" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: "Unauthorized: Invalid token" });
      }

      req.userid = decoded.userid;
      req.user = decoded; // Now you can access req.user.role
      next();
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = { authenticator };
