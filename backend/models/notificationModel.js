import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        "deposit_confirmed",
        "deposit_rejected",
        "image_purchased",
        "your_image_purchased",
        "image_added_to_favorites",
        "password_reset",
        "account_suspended",
        "announcement",
        "payment_failed",
        "balance_low",
      ],
      required: true,
    },

    // Content
    title: { type: String, required: true },
    message: { type: String, required: true },

    // Related Data
    relatedTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
    },
    relatedImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "image",
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }, // For notifications from other users (e.g., someone bought your image)

    // Status
    read: {
      type: Boolean,
      default: false,
    },
    readAt: { type: Date },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // Optional: auto-delete old notifications

    // Action Link (optional)
    actionUrl: { type: String }, // URL user should be directed to
  },
  { minimize: false },
);

const notificationModel =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default notificationModel;
