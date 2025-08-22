const express = require("express");
const passport = require("../../oauths/google.oauth");
require("dotenv").config();
const { 
  userRegister, 
  userLogin, 
  getAllUsers, 
  getUserById,
  updateUsersByAdmin,
  deleteUsersByAdmin,
  getCurrentUserInfo,
  validateToken,
  refreshAccessToken,
  logoutUser,
  updateUser
} = require("../../controllers/user.controler");
const { authenticator } = require("../../middlewares/authenticator.middleware");
const { cloudinaryUploadMiddleware, upload } = require("../../middlewares/cloudinaryUpload");

const UserRouter = express.Router();

UserRouter.use(passport.initialize());
UserRouter.use(passport.session());

UserRouter.post("/register", userRegister);

UserRouter.post("/login", userLogin);

UserRouter.get("/users/me", authenticator, getCurrentUserInfo);

UserRouter.get("/users/:id", authenticator, getUserById);

UserRouter.patch("/users/me", authenticator,
  upload.single("profile_pic"),
  cloudinaryUploadMiddleware,
  updateUser
);

UserRouter.get("/validatetoken", authenticator, validateToken);
UserRouter.post("/refresh", authenticator, refreshAccessToken);
// Allow logout to be called without authentication so clients can force cookie removal.
UserRouter.post('/logout', logoutUser);
// also support GET /logout for top-level navigation logout which can clear httpOnly cookies via redirect
UserRouter.get('/logout', logoutRedirect);


module.exports = { UserRouter };
