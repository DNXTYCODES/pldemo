import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null }, // Cloudinary URL

    // Financial Information
    balance: {
      type: String,
      default: "0", // Stored in Wei to preserve precision, as string
    },

    // Account References
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "notification",
      },
    ],

    // Photography Platform
    ownedImages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "image",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "image",
      },
    ],

    // Profile Information - Phase 1
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    location: {
      type: String,
      default: "", // "City, Country"
    },
    expertise_level: {
      type: String,
      enum: ["amateur", "semi-professional", "professional"],
      default: "amateur",
    },
    photography_specialty: [
      {
        type: String,
        // Predefined: landscape, portrait, wildlife, architecture, street, macro, abstract, nature, people, product
        // Custom specialties allowed
      },
    ],
    languages: [
      {
        type: String,
        // e.g., "English", "Spanish", "French", etc.
      },
    ],

    // Cart Data (kept for compatibility)
    cartData: { type: Object, default: {} },

    // Password Reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Email Verification
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    
    // Google OAuth
    googleId: { type: String },
    authProvider: { type: String, enum: ["email", "google"], default: "email" },

    // Metadata
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    accountType: {
      type: String,
      enum: ["real", "bot"],
      default: "real",
    },
  },
  { minimize: false },
);

// Update the updatedAt timestamp before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     cartData: { type: Object, default: {} },
//     resetToken: { type: String },
//     resetTokenExpiration: { type: Date },
// }, { minimize: false });

// const userModel = mongoose.models.user || mongoose.model('user',userSchema);

// export default userModel

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     cartData: { type: Object, default: {} }
// }, { minimize: false })

// const userModel = mongoose.models.user || mongoose.model('user',userSchema);

// export default userModel
