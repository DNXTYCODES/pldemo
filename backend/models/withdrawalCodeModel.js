import mongoose from "mongoose";

const withdrawalCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    amountWithdrawableEth: {
      type: String,
      required: true,
    },
    amountPaidEth: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unused", "reserved", "used"],
      default: "unused",
    },
    createdByAdmin: { type: String },
    adminNotes: { type: String },
    reservedAt: { type: Date },
    usedAt: { type: Date },
    reservedByTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
    },
    usedByTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false },
);

const withdrawalCodeModel =
  mongoose.models.withdrawalCode || mongoose.model("withdrawalCode", withdrawalCodeSchema);

export default withdrawalCodeModel;
