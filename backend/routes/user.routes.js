const express = require("express");
const { UserModel } = require("../models/users.model");
const { OrderModel } = require("../models/order.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("../oauths/google.oauth");

const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { upload, cloudinaryUploadMiddleware } = require("../middlewares/cloudinaryUpload");
const { authenticator } = require("../middlewares/authenticator.middleware");

const UserRouter = express.Router();

UserRouter.use(passport.initialize());
UserRouter.use(passport.session());
// =====================
// ✅ Register New User
// =====================
UserRouter.post("/register", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      gender,
      dob,
      role,
      address = {},
      profile_pic,
      wishlist = [],
      orders = [],
      emailVerified = false,
      isActive = true,
    } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists", ok: false });
    }

    const newUser = new UserModel({
      first_name,
      last_name,
      email,
      password,
      phone,
      gender,
      dob,
      role: role || "user",
      address,
      profile_pic,
      wishlist,
      orders,
      emailVerified,
      isActive,
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully", ok: true });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message, ok: false });
  }
});

// =====================
// ✅ Login User
// =====================
UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist", ok: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials", ok: false });

    const token = jwt.sign({ userid: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.json({ msg: "Login successful", userid: user._id, token, refreshToken, role: user.role, ok: true });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message, ok: false });
  }
});

// ==========================
// ✅ Get Current User Info
// ==========================
UserRouter.get("/users/me", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: "No token provided", ok: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userid).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found", ok: false });

    res.json({ user, ok: true });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token", ok: false });
  }
});

// =====================
// ✅ Validate Token
// =====================
UserRouter.get("/validatetoken", (req, res) => {
  const token = req.headers.authorization;

  try {
    if (!token) return res.status(401).json({ msg: "Token not provided", ok: false });

    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ msg: "Valid token", ok: true });
  } catch (error) {
    res.status(401).json({ msg: "Invalid token", ok: false });
  }
});


// ==========================
// ✅ Update User Info & Profile Photo
// ==========================
UserRouter.patch(
  "/users/me",
  authenticator,
  upload.single("profile_pic"),
  cloudinaryUploadMiddleware,
  async (req, res) => {
    try {
      const userId = req.userid;
      const updates = req.body;
      // If phone is present, convert to number
      if (updates.phone) updates.phone = Number(updates.phone);
      // If address fields are present, nest them (including city, state, country, zip)
      if (
        updates.address_village !== undefined ||
        updates.landmark !== undefined ||
        updates.city !== undefined ||
        updates.state !== undefined ||
        updates.country !== undefined ||
        updates.zip !== undefined
      ) {
        // Fetch current user to merge address fields
        const userDoc = await UserModel.findById(userId);
        const currentAddress = userDoc?.address || {};
        updates.address = {
          ...currentAddress,
          ...(updates.address_village !== undefined ? { address_village: updates.address_village } : {}),
          ...(updates.landmark !== undefined ? { landmark: updates.landmark } : {}),
          ...(updates.city !== undefined ? { city: updates.city } : {}),
          ...(updates.state !== undefined ? { state: updates.state } : {}),
          ...(updates.country !== undefined ? { country: updates.country } : {}),
          ...(updates.zip !== undefined ? { zip: updates.zip } : {}),
        };
        delete updates.personal_address;
        delete updates.shoping_address;
        delete updates.billing_address;
        delete updates.address_village;
        delete updates.landmark;
        delete updates.city;
        delete updates.state;
        delete updates.country;
        delete updates.zip;
      }
      const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
      res.json({ msg: "User updated successfully", user: updatedUser, ok: true });
    } catch (error) {
      res.status(500).json({ msg: "Failed to update user", error: error.message, ok: false });
    }
  }
);

module.exports = { UserRouter };

// ==========================
// ✅ Get All Orders for User
// ==========================

