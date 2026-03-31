import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";
import transactionModel from "../models/transactionModel.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cloudinary from "../config/cloudinary.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      bio,
      location,
      expertise_level,
      photography_specialty,
      languages,
    } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      bio: bio || "",
      location: location || "",
      expertise_level: expertise_level || "amateur",
      photography_specialty: Array.isArray(photography_specialty)
        ? photography_specialty
        : [],
      languages: Array.isArray(languages) ? languages : [],
      accountType: "real",
      emailVerified: false,
      verificationToken: verificationTokenHash,
      verificationExpires: Date.now() + 3600000, // Token valid for 1 hour
      authProvider: "email",
    });

    const user = await newUser.save();

    // Send verification email
    const clientUrl =
      process.env.CLIENT_URL ||
      req.headers.origin ||
      `${req.protocol}://${req.get("host")}`;
    const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      subject: "Verify Your PhotoTrade Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #008753;">Welcome to PhotoTrade!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #008753; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message:
        "Account created! Please check your email to verify your account.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Generate auth token for automatic login
    const authToken = createToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to verify email
const verifyEmailPage = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Generate auth token for automatic login
    const authToken = createToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    const clientUrl =
      process.env.CLIENT_URL ||
      req.headers.origin ||
      `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      subject: "Password Reset",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Password reset email sent." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    // Update the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID not found in token",
      });
    }

    const user = await userModel
      .findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        balance: user.balance,
        accountStatus: user.accountStatus,
        bio: user.bio,
        location: user.location,
        expertise_level: user.expertise_level,
        photography_specialty: user.photography_specialty,
        languages: user.languages,
        createdAt: user.createdAt,
        ownedImagesCount: user.ownedImages.length,
        favorites: user.favorites,
        favoritesCount: user.favorites.length,
        transactions: user.transactions.length,
        unreadNotifications: user.notifications.filter((n) => !n.read).length,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Update user profile (name, email, bio, location, specialty, expertise, languages)
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      email,
      bio,
      location,
      expertise_level,
      photography_specialty,
      languages,
    } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.json({ success: false, message: "Email already in use" });
      }
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Invalid email format" });
      }
      user.email = email;
    }

    // Update basic info
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (expertise_level) user.expertise_level = expertise_level;

    // Update photography specialty (array)
    if (photography_specialty && Array.isArray(photography_specialty)) {
      user.photography_specialty = photography_specialty;
    }

    // Update languages (array)
    if (languages && Array.isArray(languages)) {
      user.languages = languages;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        expertise_level: user.expertise_level,
        photography_specialty: user.photography_specialty,
        languages: user.languages,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Update profile picture
 */
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.json({ success: false, message: "No image file uploaded" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Upload to Cloudinary
    let imageResult;
    if (process.env.NODE_ENV === "development" && !req.file.path) {
      imageResult = {
        secure_url: `https://via.placeholder.com/200?text=${encodeURIComponent(user.name)}`,
      };
    } else {
      imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "photography_trading/profiles",
        resource_type: "auto",
        width: 300,
        height: 300,
        crop: "fill",
      });
    }

    user.profilePicture = imageResult.secure_url;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get user account balance
 */
const getUserBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const { includeEthPrice = false } = req.query;

    const user = await userModel.findById(userId).select("balance");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    let response = {
      success: true,
      balance: {
        eth: user.balance || "0",
      },
    };

    if (includeEthPrice === "true") {
      const { getCurrentEthPrice } = await import("../utils/ethereumUtils.js");
      const ethPrice = await getCurrentEthPrice();
      const balanceUsd = (parseFloat(user.balance || 0) * ethPrice).toFixed(2);
      response.balance.usd = balanceUsd;
      response.ethPrice = ethPrice;
    }

    res.json(response);
  } catch (error) {
    console.error("Error getting balance:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get user account statistics
 */
const getAccountStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Count transactions
    const totalTransactions = await transactionModel.countDocuments({ userId });
    const deposits = await transactionModel.countDocuments({
      userId,
      type: "deposit",
      status: "completed",
    });
    const purchases = await transactionModel.countDocuments({
      userId,
      type: "purchase",
    });
    const sales = await transactionModel.countDocuments({
      userId,
      type: "sale",
    });

    // Calculate total earned and spent
    const salesTransactions = await transactionModel.find({
      userId,
      type: "sale",
    });
    const totalEarned = salesTransactions
      .reduce((sum, tx) => sum + parseFloat(tx.amountEth || 0), 0)
      .toFixed(18);

    const purchaseTransactions = await transactionModel.find({
      userId,
      type: "purchase",
    });
    const totalSpent = purchaseTransactions
      .reduce((sum, tx) => sum + parseFloat(tx.amountEth || 0), 0)
      .toFixed(18);

    res.json({
      success: true,
      stats: {
        balance: user.balance,
        totalImages: user.ownedImages.length,
        totalFavorites: user.favorites.length,
        transactions: {
          total: totalTransactions,
          deposits,
          purchases,
          sales,
        },
        earnings: {
          totalEarned,
          totalSpent,
        },
        memberSince: user.createdAt,
        lastActive: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get all users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find()
      .select("-password -resetPasswordToken -resetPasswordExpires");

    res.json({
      success: true,
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        balance: user.balance,
        bio: user.bio,
        location: user.location,
        expertise_level: user.expertise_level,
        photography_specialty: user.photography_specialty,
        languages: user.languages,
        accountStatus: user.accountStatus,
        accountType: user.accountType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get single user
 */
const getAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel
      .findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        balance: user.balance,
        bio: user.bio,
        location: user.location,
        expertise_level: user.expertise_level,
        photography_specialty: user.photography_specialty,
        languages: user.languages,
        accountStatus: user.accountStatus,
        accountType: user.accountType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Admin: Create user
 */
const createAdminUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      bio,
      location,
      expertise_level,
      photography_specialty,
      languages,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      bio: bio || "",
      location: location || "",
      expertise_level: expertise_level || "amateur",
      photography_specialty: photography_specialty || [],
      languages: languages || [],
      accountStatus: "active",
      accountType: "bot",
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        balance: newUser.balance,
        bio: newUser.bio,
        location: newUser.location,
        expertise_level: newUser.expertise_level,
        photography_specialty: newUser.photography_specialty,
        languages: newUser.languages,
        accountStatus: newUser.accountStatus,
        accountType: newUser.accountType,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update user
 */
const updateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      bio,
      location,
      expertise_level,
      photography_specialty,
      languages,
      balance,
      accountStatus,
    } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (expertise_level) user.expertise_level = expertise_level;
    if (photography_specialty)
      user.photography_specialty = photography_specialty;
    if (languages) user.languages = languages;
    if (balance !== undefined) user.balance = balance;
    if (accountStatus) user.accountStatus = accountStatus;
    user.updatedAt = Date.now();

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        balance: user.balance,
        bio: user.bio,
        location: user.location,
        expertise_level: user.expertise_level,
        photography_specialty: user.photography_specialty,
        languages: user.languages,
        accountStatus: user.accountStatus,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Admin: Delete user
 */
const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    await userModel.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Admin: Update user profile picture
 */
const updateAdminUserProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.json({ success: false, message: "No image file uploaded" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Upload to Cloudinary
    let imageResult;
    if (process.env.NODE_ENV === "development" && !req.file.path) {
      imageResult = {
        secure_url: `https://via.placeholder.com/200?text=${encodeURIComponent(user.name)}`,
      };
    } else {
      imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "photography_trading/profiles",
        resource_type: "auto",
        width: 300,
        height: 300,
        crop: "fill",
      });
    }

    user.profilePicture = imageResult.secure_url;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId).populate("transactions");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      transactions: user.transactions || [],
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get public user profile by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel
      .findById(userId)
      .select(
        "name email bio location expertise_level photography_specialty profilePicture createdAt",
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user profile",
      error: error.message,
    });
  }
};

/**
 * Get featured photographers for frontend display
 */
const getFeaturedPhotographers = async (req, res) => {
  try {
    const photographers = await userModel
      .find({ isFeatured: true, accountStatus: "active" })
      .select(
        "name profilePicture bio location expertise_level photography_specialty ownedImages",
      )
      .populate("ownedImages", "imageUrl thumbnailUrl title")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      photographers,
    });
  } catch (error) {
    console.error("Error fetching featured photographers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured photographers",
      error: error.message,
    });
  }
};

/**
 * Get all photographers for frontend display
 */
const getAllPhotographers = async (req, res) => {
  try {
    const photographers = await userModel
      .find({ accountStatus: "active" })
      .select(
        "name profilePicture bio location expertise_level photography_specialty ownedImages isFeatured",
      )
      .populate("ownedImages", "imageUrl thumbnailUrl title")
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json({
      success: true,
      photographers,
    });
  } catch (error) {
    console.error("Error fetching photographers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching photographers",
      error: error.message,
    });
  }
};

/**
 * Admin: Get all photographers for management (featured and non-featured)
 */
const getAllPhotographersForAdmin = async (req, res) => {
  try {
    const photographers = await userModel
      .find({}) // Fetch all users regardless of status
      .select(
        "name profilePicture bio location expertise_level isFeatured ownedImages accountStatus",
      )
      .populate("ownedImages", "imageUrl thumbnailUrl")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      photographers,
    });
  } catch (error) {
    console.error("Error fetching photographers for admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching photographers",
      error: error.message,
    });
  }
};

/**
 * Admin: Update photographer featured status
 */
const updateFeaturedPhotographer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isFeatured } = req.body;

    if (typeof isFeatured !== "boolean") {
      return res.json({
        success: false,
        message: "isFeatured must be a boolean",
      });
    }

    const user = await userModel
      .findByIdAndUpdate(userId, { isFeatured }, { new: true })
      .select("name profilePicture bio location isFeatured");

    if (!user) {
      return res.json({
        success: false,
        message: "Photographer not found",
      });
    }

    res.json({
      success: true,
      message: `Photographer ${isFeatured ? "featured" : "unfeatured"} successfully`,
      photographer: user,
    });
  } catch (error) {
    console.error("Error updating photographer featured status:", error);
    res.json({
      success: false,
      message: "Error updating photographer",
      error: error.message,
    });
  }
};

export {
  loginUser,
  registerUser,
  verifyEmail,
  verifyEmailPage,
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
};

// import validator from "validator";
// import bcrypt from "bcrypt"
// import jwt from 'jsonwebtoken'
// import userModel from "../models/userModel.js";
// import crypto from 'crypto'
// import nodemailer from 'nodemailer'

// const createToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET)
// }

// // Route for user login
// const loginUser = async (req, res) => {
//     try {

//         const { email, password } = req.body;

//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "User doesn't exists" })
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (isMatch) {

//             const token = createToken(user._id)
//             res.json({ success: true, token })

//         }
//         else {
//             res.json({ success: false, message: 'Invalid credentials' })
//         }

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }

// // Route for user register
// const registerUser = async (req, res) => {
//     try {

//         const { name, email, password } = req.body;

//         // checking user already exists or not
//         const exists = await userModel.findOne({ email });
//         if (exists) {
//             return res.json({ success: false, message: "User already exists" })
//         }

//         // validating email format & strong password
//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "Please enter a valid email" })
//         }
//         if (password.length < 8) {
//             return res.json({ success: false, message: "Please enter a strong password" })
//         }

//         // hashing user password
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, salt)

//         const newUser = new userModel({
//             name,
//             email,
//             password: hashedPassword
//         })

//         const user = await newUser.save()

//         const token = createToken(user._id)

//         res.json({ success: true, token })

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }

// // Route for admin login
// const adminLogin = async (req, res) => {
//     try {

//         const {email,password} = req.body

//         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//             const token = jwt.sign(email+password,process.env.JWT_SECRET);
//             res.json({success:true,token})
//         } else {
//             res.json({success:false,message:"Invalid credentials"})
//         }

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message })
//     }
// }

// export { loginUser, registerUser, adminLogin }
