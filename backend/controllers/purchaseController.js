import userModel from "../models/userModel.js";
import imageModel from "../models/imageModel.js";
import transactionModel from "../models/transactionModel.js";
import notificationModel from "../models/notificationModel.js";
import { getCurrentEthPrice } from "../utils/ethereumUtils.js";

// Gas fee estimation (in Ethereum) - could be dynamic based on network conditions
const GAS_FEE_ETH = process.env.GAS_FEE || "0.001"; // Default 0.001 ETH

/**
 * Purchase an image
 */
export const purchaseImage = async (req, res) => {
  try {
    const { imageId } = req.body;
    const buyerId = req.body.userId || req.userId;

    // Validate image exists and is available
    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This image is no longer available for purchase",
      });
    }

    // Get buyer and verify they're not buying their own image
    const buyer = await userModel.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    if (image.sellerId.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot purchase your own image",
      });
    }

    // Calculate total cost (image price + gas fee)
    const imagePrice = parseFloat(image.priceEth);
    const gasFee = parseFloat(GAS_FEE_ETH);
    const totalCost = (imagePrice + gasFee).toFixed(18);
    const buyerBalance = parseFloat(buyer.balance) || 0;

    // Check if buyer has sufficient balance
    if (buyerBalance < parseFloat(totalCost)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        required: totalCost,
        available: buyer.balance,
        shortfall: (parseFloat(totalCost) - buyerBalance).toFixed(18),
      });
    }

    // Get current ETH price for USD conversion
    const ethPrice = await getCurrentEthPrice();
    const imagePriceUsd = (imagePrice * ethPrice).toFixed(2);
    const gasFeeUsd = (gasFee * ethPrice).toFixed(2);
    const totalCostUsd = (parseFloat(totalCost) * ethPrice).toFixed(2);

    // Create transaction record for buyer
    const buyerTransaction = new transactionModel({
      userId: buyerId,
      type: "purchase",
      amountEth: imagePrice.toString(),
      amountUsd: imagePriceUsd,
      ethPriceAtTime: ethPrice.toString(),
      gasFeeEth: gasFee,
      imageId: imageId,
      sellerId: image.sellerId,
      status: "completed",
      description: `Purchased: ${image.title}`,
    });

    await buyerTransaction.save();

    // Create transaction record for seller
    const sellerTransaction = new transactionModel({
      userId: image.sellerId,
      type: "sale",
      amountEth: imagePrice.toString(),
      amountUsd: imagePriceUsd,
      ethPriceAtTime: ethPrice.toString(),
      imageId: imageId,
      status: "completed",
      description: `Sale: ${image.title}`,
      buyerId: buyerId,
    });

    await sellerTransaction.save();

    // Deduct from buyer balance (image price + gas fee)
    const newBuyerBalance = (buyerBalance - parseFloat(totalCost)).toFixed(18);
    await userModel.findByIdAndUpdate(buyerId, {
      $set: { balance: newBuyerBalance },
      $push: { transactions: buyerTransaction._id },
    });

    // Add to seller balance
    const seller = await userModel.findById(image.sellerId);
    const sellerBalance = parseFloat(seller.balance) || 0;
    const newSellerBalance = (sellerBalance + imagePrice).toFixed(18);
    await userModel.findByIdAndUpdate(image.sellerId, {
      $set: { balance: newSellerBalance },
      $push: { transactions: sellerTransaction._id },
    });

    // Update image purchase history
    image.purchaseHistory.push({
      buyerId: buyerId,
      transactionId: buyerTransaction._id,
      pricePaidEth: imagePrice.toString(),
      pricePaidUsd: imagePriceUsd,
    });
    image.purchaseCount += 1;
    await image.save();

    // Create notifications
    // Notification for buyer
    const buyerNotification = new notificationModel({
      userId: buyerId,
      type: "image_purchased",
      title: "Purchase Successful",
      message: `You have successfully purchased "${image.title}" for ${imagePrice} ETH ($${imagePriceUsd})`,
      actionUrl: `/product/${imageId}`,
      relatedImageId: imageId,
      relatedTransactionId: buyerTransaction._id,
    });

    await buyerNotification.save();

    await userModel.findByIdAndUpdate(buyerId, {
      $push: { notifications: buyerNotification._id },
    });

    // Notification for seller
    const sellerNotification = new notificationModel({
      userId: image.sellerId,
      type: "your_image_purchased",
      title: "Image Sold",
      message: `Your image "${image.title}" has been purchased for ${imagePrice} ETH ($${imagePriceUsd})`,
      actionUrl: `/product/${imageId}`,
      relatedImageId: imageId,
      relatedTransactionId: sellerTransaction._id,
      relatedUserId: buyerId,
    });

    await sellerNotification.save();

    await userModel.findByIdAndUpdate(image.sellerId, {
      $push: { notifications: sellerNotification._id },
    });

    res.json({
      success: true,
      message: "Image purchased successfully",
      purchase: {
        buyerTransactionId: buyerTransaction._id,
        sellerTransactionId: sellerTransaction._id,
        imageId: imageId,
        imageName: image.title,
        priceEth: imagePrice.toString(),
        priceUsd: imagePriceUsd,
        gasFeeEth: gasFee,
        gasFeeUsd: gasFeeUsd,
        totalEth: totalCost,
        totalUsd: totalCostUsd,
        newBuyerBalance: newBuyerBalance,
        newSellerBalance: newSellerBalance,
        purchaseTime: new Date(),
      },
    });
  } catch (error) {
    console.error("Error purchasing image:", error);
    res.status(500).json({
      success: false,
      message: "Error processing purchase",
      error: error.message,
    });
  }
};

/**
 * Get purchase history for authenticated user
 */
export const getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { limit = 20, skip = 0 } = req.query;

    // Find all purchase transactions for the user
    const purchases = await transactionModel
      .find({
        userId: userId,
        type: "purchase",
      })
      .populate("imageId", "title imageUrl priceEth")
      .populate("sellerId", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await transactionModel.countDocuments({
      userId: userId,
      type: "purchase",
    });

    res.json({
      success: true,
      purchases,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting purchase history:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving purchase history",
      error: error.message,
    });
  }
};

/**
 * Verify/confirm purchase (can be used for additional validation if needed)
 */
export const selectiveVerifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.body.userId || req.userId;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - transaction belongs to another user",
      });
    }

    // Return transaction details for verification
    res.json({
      success: true,
      transaction: {
        _id: transaction._id,
        type: transaction.type,
        status: transaction.status,
        amountEth: transaction.amountEth,
        amountUsd: transaction.amountUsd,
        gasFeeEth: transaction.gasFeeEth,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        description: transaction.description,
      },
      verified: transaction.status === "completed",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

export default {
  purchaseImage,
  getPurchaseHistory,
  selectiveVerifyPayment,
};
