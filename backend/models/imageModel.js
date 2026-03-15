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
    fakeViewsAdded: {
      type: Number,
      default: 0, // Tracks cumulative fake views added
    },
    fakeViewsHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        change: { type: Number, default: 1 }, // Amount added
      },
    ],
    likes: {
      type: Number,
      default: () => Math.floor(Math.random() * 100) + 50, // Random initial between 50-150
      min: 0,
      max: 4024, // Maximum likes hardcoded as specified
    },
    likeHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        change: { type: Number, default: 1 }, // +1 or -1
      },
    ],
    purchaseCount: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: () => Math.floor(Math.random() * 50) + 10, // Random initial between 10-60
      min: 0,
    },
    favoriteHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        change: { type: Number, default: 1 }, // +1 or -1
      },
    ],

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

    // Featured/Trending Flag
    isTrending: {
      type: Boolean,
      default: false, // Admin can mark images as trending
    },

    // Home Page Section Assignments
    isPopular: {
      type: Boolean,
      default: false, // Popular Photos section
    },
    isEditorsChoice: {
      type: Boolean,
      default: false, // Editors Choice section
    },
    isAmbassadorsPick: {
      type: Boolean,
      default: false, // Ambassador's Pick badge on image
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

    // Favourites Tracking
    favouritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // Reports/Flags
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        reason: { type: String },
        reportedAt: { type: Date, default: Date.now },
      },
    ],

    // Buy Requests
    buyRequests: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        requestedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
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
