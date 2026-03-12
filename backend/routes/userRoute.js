import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  changePassword,
  getUserBalance,
  getAccountStats,
  getAllUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  updateAdminUserProfilePicture,
  getUserTransactions,
  getUserById,
  getFeaturedPhotographers,
  getAllPhotographers,
  getAllPhotographersForAdmin,
  updateFeaturedPhotographer,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

// Authentication Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Profile Routes (require authentication) - MUST BE BEFORE /:userId
userRouter.get("/profile", auth, getUserProfile); // Get user profile
userRouter.put("/profile", auth, updateUserProfile); // Update profile
userRouter.put(
  "/profile-picture",
  auth,
  upload.single("profilePicture"),
  updateProfilePicture,
); // Update profile picture
userRouter.put("/change-password", auth, changePassword); // Change password
userRouter.get("/balance", auth, getUserBalance); // Get account balance
userRouter.get("/stats", auth, getAccountStats); // Get account statistics
userRouter.get("/transactions", auth, getUserTransactions); // Get transactions

// Admin Routes - MUST BE BEFORE /:userId
userRouter.get("/admin/all-users", auth, getAllUsers); // Get all users (must be first)
userRouter.get("/admin/photographers", auth, getAllPhotographersForAdmin); // Get all photographers for admin management
userRouter.post("/admin/create", auth, createAdminUser); // Create user
userRouter.put(
  "/admin/:userId/profile-picture",
  auth,
  upload.single("profilePicture"),
  updateAdminUserProfilePicture,
); // Update user profile picture (must come before /:userId routes)
userRouter.put("/admin/:userId/featured", auth, updateFeaturedPhotographer); // Toggle photographer featured status
userRouter.get("/admin/:userId", auth, getAdminUser); // Get single user
userRouter.put("/admin/:userId", auth, updateAdminUser); // Update user
userRouter.delete("/admin/:userId", auth, deleteAdminUser); // Delete user

// Public Routes - Featured Photographers
userRouter.get("/featured", getFeaturedPhotographers); // Get featured photographers for frontend (no auth)
userRouter.get("/all", getAllPhotographers); // Get all photographers for frontend (no auth)

// Generic Route - MUST BE LAST
userRouter.get("/:userId", getUserById); // Get public user profile by ID

export default userRouter;

// import express from 'express';
// import { loginUser,registerUser,adminLogin } from '../controllers/userController.js';

// const userRouter = express.Router();

// userRouter.post('/register',registerUser)
// userRouter.post('/login',loginUser)
// userRouter.post('/admin',adminLogin)

// export default userRouter;
