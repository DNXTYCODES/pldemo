import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";
import withdrawalCodeModel from "../models/withdrawalCodeModel.js";
import notificationModel from "../models/notificationModel.js";
import { getCurrentEthPrice, formatPrice } from "../utils/ethereumUtils.js";
import crypto from "crypto";
import mongoose from "mongoose";

const PLATFORM_WITHDRAWAL_FEE_ADDRESS =
  process.env.WITHDRAWAL_FEE_ADDRESS ||
  process.env.ETHEREUM_ADDRESS ||
  "0xf0fcD09899d0D1D417A40c910f425CF104aE16dB";

function generateCode(len = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[crypto.randomInt(0, chars.length)];
  }
  return out;
}

export const initiateWithdrawal = async (req, res) => {
  try {
    const { amountEth } = req.body;
    const userId = req.body.userId || req.userId;

    if (!amountEth || parseFloat(amountEth) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid withdrawal amount" });
    }

    const ethPrice = await getCurrentEthPrice();
    const fee = (parseFloat(amountEth) * 0.1).toFixed(18); // 10%
    const feeUsd = (parseFloat(fee) * ethPrice).toFixed(2);

    const transaction = new transactionModel({
      userId,
      type: "withdrawal_fee",
      amountEth: fee,
      amountUsd: feeUsd,
      ethPriceAtTime: ethPrice.toString(),
      ethereumAddress: PLATFORM_WITHDRAWAL_FEE_ADDRESS,
      status: "pending",
      description: `Withdrawal request for ${amountEth} ETH (fee ${fee} ETH)`,
      withdrawAmountEth: amountEth,
    });

    await transaction.save();

    await userModel.findByIdAndUpdate(
      userId,
      { $push: { transactions: transaction._id } },
      { new: true },
    );

    // Optional notification
    const notification = new notificationModel({
      userId,
      type: "withdrawal_fee_initiated",
      title: "Withdrawal Requested",
      message: `You requested to withdraw ${amountEth} ETH. Please pay the fee of ${fee} ETH to the address provided.`,
      actionUrl: "/withdraw",
      relatedTransactionId: transaction._id,
    });
    await notification.save();
    await userModel.findByIdAndUpdate(userId, {
      $push: { notifications: notification._id },
    });

    res.json({
      success: true,
      message:
        "Withdrawal initiated. Send the 10% fee to the platform address.",
      transaction: {
        _id: transaction._id,
        feeEth: fee,
        feeUsd,
        withdrawAmountEth: amountEth,
        depositAddress: PLATFORM_WITHDRAWAL_FEE_ADDRESS,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error initiating withdrawal",
        error: error.message,
      });
  }
};

export const getPendingWithdrawalFees = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const fees = await transactionModel
      .find({ type: "withdrawal_fee", status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await transactionModel.countDocuments({
      type: "withdrawal_fee",
      status: "pending",
    });

    res.json({
      success: true,
      fees,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving pending withdrawal fees",
        error: error.message,
      });
  }
};

export const confirmWithdrawalFee = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const transaction = await transactionModel.findById(transactionId);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    if (transaction.type !== "withdrawal_fee") {
      return res
        .status(400)
        .json({
          success: false,
          message: "This transaction is not a withdrawal fee",
        });
    }
    if (transaction.status === "completed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "This fee has already been confirmed",
        });
    }

    // Generate unique code
    let code = generateCode(10);
    let exists = await withdrawalCodeModel.findOne({ code });
    let attempts = 0;
    while (exists && attempts < 10) {
      code = generateCode(10);
      exists = await withdrawalCodeModel.findOne({ code });
      attempts++;
    }

    const withdrawalCode = new withdrawalCodeModel({
      userId: transaction.userId,
      code,
      amountWithdrawableEth:
        transaction.withdrawAmountEth || transaction.amountEth,
      amountPaidEth: transaction.amountEth,
      status: "unused",
      createdByAdmin: req.adminId || null,
      adminNotes: adminNotes || "",
    });
    await withdrawalCode.save();

    transaction.status = "completed";
    transaction.completedAt = Date.now();
    transaction.adminNotes = adminNotes || "";
    transaction.withdrawalCode = code;
    transaction.withdrawalCodeId = withdrawalCode._id;
    if (req.adminId && mongoose.isValidObjectId(req.adminId)) {
      transaction.depositConfirmedBy = req.adminId;
    } else {
      transaction.depositConfirmedBy = null;
    }
    await transaction.save();

    // Notify user
    const notification = new notificationModel({
      userId: transaction.userId,
      type: "withdrawal_code_issued",
      title: "Withdrawal Code Issued",
      message: `A withdrawal code was issued for ${withdrawalCode.amountWithdrawableEth} ETH. Use it on the Withdraw page to request the withdrawal.`,
      actionUrl: "/withdrawal-codes",
      relatedTransactionId: transaction._id,
    });
    await notification.save();
    await userModel.findByIdAndUpdate(transaction.userId, {
      $push: { notifications: notification._id },
    });

    res.json({
      success: true,
      message: "Fee confirmed and code issued",
      code: withdrawalCode.code,
      withdrawalCode,
    });
  } catch (error) {
    console.error("Error confirming withdrawal fee:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error confirming withdrawal fee",
        error: error.message,
      });
  }
};

export const rejectWithdrawalFee = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    if (!reason)
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });

    const transaction = await transactionModel.findById(transactionId);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });

    transaction.status = "cancelled";
    transaction.completedAt = Date.now();
    transaction.adminNotes = reason;
    await transaction.save();

    res.json({
      success: true,
      message: "Withdrawal fee rejected",
      transaction: { _id: transaction._id, status: transaction.status },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error rejecting fee",
        error: error.message,
      });
  }
};

export const getUserWithdrawalCodes = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const codes = await withdrawalCodeModel
      .find({ userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, codes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching withdrawal codes",
        error: error.message,
      });
  }
};

export const redeemWithdrawalCode = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { code, targetAddress } = req.body;
    if (!code)
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    if (!targetAddress)
      return res
        .status(400)
        .json({ success: false, message: "Target address is required" });

    const codeDoc = await withdrawalCodeModel.findOne({ code });
    if (!codeDoc)
      return res
        .status(404)
        .json({ success: false, message: "Code not found" });
    if (codeDoc.userId.toString() !== userId.toString())
      return res
        .status(403)
        .json({ success: false, message: "Code does not belong to this user" });
    if (codeDoc.status !== "unused")
      return res
        .status(400)
        .json({ success: false, message: "Code already used or reserved" });

    const ethPrice = await getCurrentEthPrice();
    const amountUsd = (
      parseFloat(codeDoc.amountWithdrawableEth) * ethPrice
    ).toFixed(2);

    // Create withdrawal transaction (pending admin confirmation)
    const transaction = new transactionModel({
      userId,
      type: "withdrawal",
      amountEth: codeDoc.amountWithdrawableEth,
      amountUsd,
      ethPriceAtTime: ethPrice.toString(),
      status: "pending",
      description: `Withdrawal to ${targetAddress} using code ${code}`,
      withdrawalCodeId: codeDoc._id,
      ethereumAddress: targetAddress,
    });
    await transaction.save();

    // Reserve the code to prevent duplicate redemption
    codeDoc.status = "reserved";
    codeDoc.reservedAt = Date.now();
    codeDoc.reservedByTransaction = transaction._id;
    await codeDoc.save();

    await userModel.findByIdAndUpdate(userId, {
      $push: { transactions: transaction._id },
    });

    res.json({
      success: true,
      message: "Code redeemed, awaiting admin confirmation",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error redeeming code",
        error: error.message,
      });
  }
};

export const getPendingWithdrawals = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const withdrawals = await transactionModel
      .find({ type: "withdrawal", status: "pending" })
      .populate("userId", "name email")
      .populate("withdrawalCodeId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await transactionModel.countDocuments({
      type: "withdrawal",
      status: "pending",
    });

    res.json({
      success: true,
      withdrawals,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving pending withdrawals",
        error: error.message,
      });
  }
};

export const confirmWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const transaction = await transactionModel.findById(transactionId);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    if (transaction.type !== "withdrawal")
      return res
        .status(400)
        .json({
          success: false,
          message: "This transaction is not a withdrawal",
        });
    if (transaction.status === "completed")
      return res
        .status(400)
        .json({
          success: false,
          message: "This withdrawal has already been processed",
        });

    // Ensure code exists and is reserved for this transaction
    const codeDoc = await withdrawalCodeModel.findById(
      transaction.withdrawalCodeId,
    );
    if (!codeDoc)
      return res
        .status(404)
        .json({
          success: false,
          message: "Associated withdrawal code not found",
        });
    if (
      codeDoc.status !== "reserved" ||
      codeDoc.reservedByTransaction.toString() !== transaction._id.toString()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Code is not reserved for this transaction",
        });
    }

    // Deduct from user balance
    const user = await userModel.findById(transaction.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const currentBalance = parseFloat(user.balance) || 0;
    const withdrawAmount = parseFloat(transaction.amountEth);
    if (currentBalance < withdrawAmount) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Insufficient user balance to process withdrawal",
        });
    }

    const newBalance = (currentBalance - withdrawAmount).toFixed(18);
    user.balance = newBalance;
    await user.save();

    // Mark code as used
    codeDoc.status = "used";
    codeDoc.usedAt = Date.now();
    codeDoc.usedByTransaction = transaction._id;
    await codeDoc.save();

    // Complete transaction
    transaction.status = "completed";
    transaction.completedAt = Date.now();
    transaction.adminNotes = adminNotes || "";
    if (req.adminId && mongoose.isValidObjectId(req.adminId)) {
      transaction.depositConfirmedBy = req.adminId;
    } else {
      transaction.depositConfirmedBy = null;
    }
    await transaction.save();

    // Notify user
    const notification = new notificationModel({
      userId: transaction.userId,
      type: "withdrawal_processed",
      title: "Withdrawal Processed",
      message: `Your withdrawal of ${transaction.amountEth} ETH has been processed.`,
      actionUrl: "/transactions",
      relatedTransactionId: transaction._id,
    });
    await notification.save();
    await userModel.findByIdAndUpdate(transaction.userId, {
      $push: { notifications: notification._id },
    });

    res.json({
      success: true,
      message: "Withdrawal confirmed and processed",
      transaction,
      userBalance: user.balance,
    });
  } catch (error) {
    console.error("Error confirming withdrawal:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error confirming withdrawal",
        error: error.message,
      });
  }
};

export const rejectWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    if (!reason)
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });

    const transaction = await transactionModel.findById(transactionId);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });

    // If associated code exists and was reserved, unlock it
    if (transaction.withdrawalCodeId) {
      const codeDoc = await withdrawalCodeModel.findById(
        transaction.withdrawalCodeId,
      );
      if (
        codeDoc &&
        codeDoc.status === "reserved" &&
        codeDoc.reservedByTransaction.toString() === transaction._id.toString()
      ) {
        codeDoc.status = "unused";
        codeDoc.reservedAt = null;
        codeDoc.reservedByTransaction = null;
        await codeDoc.save();
      }
    }

    transaction.status = "cancelled";
    transaction.completedAt = Date.now();
    transaction.adminNotes = reason;
    await transaction.save();

    res.json({
      success: true,
      message: "Withdrawal request rejected",
      transaction: { _id: transaction._id, status: transaction.status },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error rejecting withdrawal",
        error: error.message,
      });
  }
};

export default {
  initiateWithdrawal,
  getPendingWithdrawalFees,
  confirmWithdrawalFee,
  rejectWithdrawalFee,
  getUserWithdrawalCodes,
  redeemWithdrawalCode,
  getPendingWithdrawals,
  confirmWithdrawal,
  rejectWithdrawal,
};
