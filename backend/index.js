const express = require("express");
const { connection } = require("./config/db");
const { UserRouter } = require("./routes/user.routes");
const { ProductRouter } = require("./routes/products.routes");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Mount user router under /api
app.use("/api", UserRouter);
app.use("/api", ProductRouter)

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

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("✅ Server running on PORT", process.env.PORT);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.log("❌ DB Connection Error:", error);
  }
});