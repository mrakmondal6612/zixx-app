const cloudinary = require('cloudinary').v2;
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET
});
const express = require("express");
const cookieParser = require('cookie-parser');
const { connection } = require("./config/db");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const ClientsRouters = require('./routes/clients.routes');
const AdminsRouters = require('./routes/admins.routes');

const app = express();
require("dotenv").config();

// Allow frontend and admin client origins for credentialed requests
// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
const FRONTEND_URL = process.env.Frontend_URL;
const ADMIN_CLIENT_URL = process.env.ADMIN_CLIENT_URL;
// include common local dev origins so admin client running on :8000 or :8080 can call credentialed APIs
const allowedOrigins = [
  FRONTEND_URL,
  ADMIN_CLIENT_URL,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
].filter(Boolean);

// General CORS for all routes except /api/admin
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin')) return next();
  return cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })(req, res, next);
});

// CORS for /api/admin* routes: only allow http://localhost:8000
app.use('/api/admin', cors({
  origin: 'http://localhost:8000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api", ClientsRouters);
app.use("/api", AdminsRouters);

app.get("/", (req, res) => {
  res.send("WELCOME TO THE ZIXX APP BACKEND");
});

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Always return JSON for unknown API routes (prevents HTML error pages)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, msg: 'Not found' });
  }
  next();
});

// Error handler: always return JSON
app.use((err, req, res, next) => {
  console.error('API error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ ok: false, msg: err.message || 'Server error' });
  }
  next(err);
});

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("✅ Server running on PORT", process.env.PORT);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ DB Connection Error:", error);
  }
});