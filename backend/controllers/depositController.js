import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";
import notificationModel from "../models/notificationModel.js";
import { getCurrentEthPrice, formatPrice } from "../utils/ethereumUtils.js";

// Simulated deposit addresses (in production, use actual blockchain addresses or Ethereum service)
const PLATFORM_DEPOSIT_ADDRESS =
  process.env.ETHEREUM_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc238e8eA63c53";

/**
 * Initiate a deposit - User requests to deposit Ethereum
 * Creates a pending transaction and returns the platform address
 */
export const initiateDeposit = async (req, res) => {
  try {
    const { amountEth } = req.body;
    const userId = req.body.userId || req.userId;

    // Validate amount
    if (!amountEth || parseFloat(amountEth) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit amount",
      });
    }

    // Get current ETH price
    const ethPrice = await getCurrentEthPrice();
    const amountUsd = (parseFloat(amountEth) * ethPrice).toFixed(2);

    // Create transaction record
    const transaction = new transactionModel({
      userId,
      type: "deposit",
      amountEth: amountEth,
      amountUsd: amountUsd,
      ethPriceAtTime: ethPrice.toString(),
      ethereumAddress: PLATFORM_DEPOSIT_ADDRESS,
      status: "pending",
      description: `Deposit of ${amountEth} ETH`,
    });

    await transaction.save();

    // Add transaction to user's transaction history
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { transactions: transaction._id } },
      { new: true },
    );

    // Create notification for user
    const notification = new notificationModel({
      userId,
      type: "deposit_confirmed",
      title: "Deposit Initiated",
      message: `Your deposit of ${amountEth} ETH is awaiting confirmation. Please send the Ethereum to the address below.`,
      actionUrl: "/fund-account",
      relatedTransactionId: transaction._id,
    });

    await notification.save();

    await userModel.findByIdAndUpdate(
      userId,
      { $push: { notifications: notification._id } },
      { new: true },
    );

    res.json({
      success: true,
      message: "Deposit initiated successfully",
      transaction: {
        _id: transaction._id,
        amountEth: amountEth,
        amountUsd: amountUsd,
        depositAddress: PLATFORM_DEPOSIT_ADDRESS,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error initiating deposit:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating deposit",
      error: error.message,
    });
  }
};

/**
 * Get deposit status - Check if user's deposit has been confirmed
 */
export const getDepositStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      transaction: {
        _id: transaction._id,
        status: transaction.status,
        amountEth: transaction.amountEth,
        amountUsd: transaction.amountUsd,
        description: transaction.description,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
      },
    });
  } catch (error) {
    console.error("Error getting deposit status:", error);
    res.status(500).json({
      success: false,
      message: "Error getting deposit status",
      error: error.message,
    });
  }
};

/**
 * Get all user transactions
 */
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { type, limit = 50, skip = 0 } = req.query;

    let query = { userId };
    if (type) {
      query.type = type;
    }

    const transactions = await transactionModel
      .find(query)
      .populate("imageId", "title")
      .populate("sellerId", "name email profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await transactionModel.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving transactions",
      error: error.message,
    });
  }
};

/**
 * Admin: Get all pending deposits
 */
export const getPendingDeposits = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const deposits = await transactionModel
      .find({ type: "deposit", status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await transactionModel.countDocuments({
      type: "deposit",
      status: "pending",
    });

    res.json({
      success: true,
      deposits,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting pending deposits:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving pending deposits",
      error: error.message,
    });
  }
};

/**
 * Admin: Confirm deposit and add balance to user account
 */
export const confirmDeposit = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.type !== "deposit") {
      return res.status(400).json({
        success: false,
        message: "This transaction is not a deposit",
      });
    }

    if (transaction.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This deposit has already been confirmed",
      });
    }

    // Update transaction
    transaction.status = "completed";
    transaction.completedAt = Date.now();
    transaction.depositConfirmedBy = req.adminId;
    transaction.adminNotes = adminNotes || "";
    await transaction.save();

    // Get user and update balance
    const user = await userModel.findById(transaction.userId);
    const currentBalance = parseFloat(user.balance) || 0;
    const newBalance = (
      currentBalance + parseFloat(transaction.amountEth)
    ).toFixed(18);

    user.balance = newBalance;
    await user.save();

    // Create notification for user (commented out for now - can be uncommented once notificationModel is properly configured)
    // const notification = new notificationModel({
    //   userId: transaction.userId,
    //   type: "deposit_confirmed",
    //   title: "Deposit Confirmed",
    //   message: `Your deposit of ${transaction.amountEth} ETH has been confirmed! Your balance has been updated.`,
    //   actionUrl: "/fund-account",
    //   relatedTransactionId: transaction._id,
    // });
    //
    // await notification.save();
    //
    // await userModel.findByIdAndUpdate(
    //   transaction.userId,
    //   { $push: { notifications: notification._id } },
    //   { new: true },
    // );

    res.json({
      success: true,
      message: "Deposit confirmed successfully",
      transaction: {
        _id: transaction._id,
        status: transaction.status,
        completedAt: transaction.completedAt,
      },
      userBalance: newBalance,
    });
  } catch (error) {
    console.error("Error confirming deposit:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming deposit",
      error: error.message,
    });
  }
};

/**
 * Admin: Reject deposit
 */
export const rejectDeposit = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction
    transaction.status = "cancelled";
    transaction.completedAt = Date.now();
    transaction.adminNotes = reason;
    await transaction.save();

    // Create notification for user (commented out for now - can be uncommented once notificationModel is properly configured)
    // const notification = new notificationModel({
    //   userId: transaction.userId,
    //   type: "deposit_rejected",
    //   title: "Deposit Rejected",
    //   message: `Your deposit of ${transaction.amountEth} ETH has been rejected. Reason: ${reason}. Please contact support if you have questions.`,
    //   actionUrl: "/fund-account",
    //   relatedTransactionId: transaction._id,
    // });
    //
    // await notification.save();
    //
    // await userModel.findByIdAndUpdate(
    //   transaction.userId,
    //   { $push: { notifications: notification._id } },
    //   { new: true },
    // );

    res.json({
      success: true,
      message: "Deposit rejected successfully",
      transaction: {
        _id: transaction._id,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error("Error rejecting deposit:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting deposit",
      error: error.message,
    });
  }
};

export default {
  initiateDeposit,
  getDepositStatus,
  getUserTransactions,
  getPendingDeposits,
  confirmDeposit,
  rejectDeposit,
};
