import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    // Image Information
    title: { type: String, required: true },
    description: { type: String },

    // Image Storage
    imageUrl: { type: String, required: true }, // Cloudinary URL
    thumbnailUrl: { type: String }, // Cloudinary thumbnail

    // Seller Information
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Pricing Information
    priceEth: {
      type: String,
      required: true, // Price in Ethereum, stored as string for precision
    },
    priceUsd: {
      type: String,
      required: true, // USD equivalent at time of listing
    },
    ethPriceAtListing: {
      type: String,
      required: true, // ETH/USD price when image was listed
    },

    // Metadata
    category: { type: String, required: true }, // e.g., 'Landscape', 'Portrait', 'Wildlife', etc.
    tags: [{ type: String }],

    // Image Statistics
    views: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },

    // Purchase History
    purchaseHistory: [
      {
        buyerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "transaction",
        },
        purchaseDate: { type: Date, default: Date.now },
        pricePaidEth: { type: String },
        pricePaidUsd: { type: String },
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "deleted", "flagged", "pending_approval"],
      default: "active",
    },

    // Admin Approval for User Uploads
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: null, // Only set if upload is pending approval
    },
    approvedAt: { type: Date },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    declinedAt: { type: Date },
    declinedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    declineReason: { type: String },
    gasFee: {
      type: String,
      default: "0", // Gas fee in Eth
    },

    // Metadata Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Usage Rights (optional)
    usageRights: {
      type: String,
      enum: ["personal_use", "commercial_use", "both"],
      default: "personal_use",
    },

    // Rights/License Info
    licenseType: { type: String }, // e.g., 'exclusive', 'non-exclusive'
  },
  { minimize: false },
);

// Update the updatedAt timestamp before saving
imageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const imageModel =
  mongoose.models.image || mongoose.model("image", imageSchema);

export default imageModel;
