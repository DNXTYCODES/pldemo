import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // Basic Authentication
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Admin Information
    name: { type: String, required: true },
    profilePicture: { type: String, default: null }, // Cloudinary URL

    // Role and Permissions
    role: {
      type: String,
      enum: ["super_admin", "financial_admin", "content_moderator"],
      default: "content_moderator",
    },
    permissions: [{ type: String }], // e.g., 'manage_users', 'manage_deposits', 'manage_images'

    // Admin Actions Audit Trail
    adminActions: [
      {
        action: { type: String },
        targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        targetImageId: { type: mongoose.Schema.Types.ObjectId, ref: "image" },
        details: { type: String },
        changes: { type: Object },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Contact Information
    contactEmail: { type: String },

    // Account Status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },

    // Password Reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { minimize: false },
);

// Update the updatedAt timestamp before saving
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const adminModel =
  mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;
