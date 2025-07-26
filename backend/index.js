const cloudinary = require('cloudinary').v2;
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET
});
const express = require("express");
const { connection } = require("./config/db");
const { UserRouter } = require("./routes/user.routes");
const { ProductRouter } = require("./routes/products.routes");
const { BrandRouter } = require("./routes/brands.routes");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const { CartRouter } = require("./routes/carts.routes");
const { WishlistRouter } = require("./routes/wishlist.route");
const { OrderRouter } = require("./routes/order.route");
const { ReviewRouter } = require("./routes/reviews.routes");

const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: process.env.Frontend_URL,
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
app.use("/api", ProductRouter);
app.use("/api", BrandRouter);
app.use("/api", CartRouter);
app.use("/api", WishlistRouter);
app.use("/api", OrderRouter);
app.use("/api", ReviewRouter);

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