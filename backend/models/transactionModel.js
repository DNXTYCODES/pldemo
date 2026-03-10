import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Transaction Type
    type: {
      type: String,
      enum: [
        "deposit",
        "purchase",
        "sale",
        "withdrawal",
        "fee",
        "upload_approval",
        "upload_decline",
      ],
      required: true,
    },

    // Amount Information
    amountEth: {
      type: String,
      required: true, // Amount in Ethereum, stored as string for precision
    },
    amountUsd: {
      type: String,
      required: true, // USD equivalent at time of transaction
    },
    ethPriceAtTime: {
      type: String,
      required: true, // ETH/USD price when transaction occurred
    },

    // Gas Fees
    gasFeeEth: {
      type: String,
      default: "0", // For transactions that incur gas fees
    },

    // Image Purchase Details (for purchase/sale types)
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "image",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // Deposit Details
    ethereumAddress: { type: String }, // Address ETH was sent to/from
    depositConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },

    // Description/Notes
    description: { type: String },
    adminNotes: { type: String }, // For deposits or disputes

    // Metadata
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // Reference
    txHash: { type: String }, // Blockchain transaction hash if applicable
  },
  { minimize: false },
);

const transactionModel =
  mongoose.models.transaction ||
  mongoose.model("transaction", transactionSchema);

export default transactionModel;
