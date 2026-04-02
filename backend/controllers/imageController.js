import imageModel from "../models/imageModel.js";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import notificationModel from "../models/notificationModel.js";
import transactionModel from "../models/transactionModel.js";
import { getCurrentEthPrice, formatPrice } from "../utils/ethereumUtils.js";
import cloudinary from "../config/cloudinary.js";

const DEFAULT_IMAGE_CATEGORIES = [
  "Landscape",
  "Portrait",
  "Wildlife",
  "Architecture",
  "Street",
  "Macro",
  "Abstract",
  "Nature",
  "People",
  "Product",
];

const getAllowedImageCategories = async () => {
  const categories = await categoryModel.find({ type: "image" }).sort({ name: 1 });
  if (categories.length > 0) {
    return categories.map((item) => item.name);
  }
  return DEFAULT_IMAGE_CATEGORIES;
};

/**
 * Upload a new image for sale (auto-approved if user has >= $200 balance)
 */
export const uploadImage = async (req, res) => {
  try {
    const {
      title,
      description,
      priceEth,
      category,
      tags,
      usageRights,
      licenseType,
    } = req.body;
    const userId = req.body.userId || req.userId;

    const ALLOWED_CATEGORIES = await getAllowedImageCategories();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    if (!title || !priceEth || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and category are required",
      });
    }

    // Validate category
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}`,
      });
    }

    // Validate price
    const price = parseFloat(priceEth);
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Check user's balance - minimum $200 required for gas fee
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current ETH price for balance check
    const ethPrice = await getCurrentEthPrice();

    // Balance is already stored as ETH (decimal format), no conversion needed
    const balanceEth = parseFloat(user.balance || "0");
    const balanceUsd = balanceEth * ethPrice;

    // Check if user has at least $200 for gas fee
    const minBalanceUsd = 200;
    const hassufficientBalance = balanceUsd >= minBalanceUsd;

    if (!hassufficientBalance) {
      return res.status(402).json({
        success: false,
        message: `Insufficient balance. You need at least $${minBalanceUsd.toFixed(2)} in your account to upload images. Current balance: $${balanceUsd.toFixed(2)}`,
        currentBalance: balanceUsd.toFixed(2),
        requiredBalance: minBalanceUsd,
        errorCode: "INSUFFICIENT_BALANCE",
      });
    }

    // Upload to Cloudinary using file path from multer
    let imageResult;
    if (process.env.NODE_ENV === "development" && !req.file.path) {
      // For development without actual file, create dummy response
      imageResult = {
        secure_url: `https://via.placeholder.com/400?text=${encodeURIComponent(title)}`,
        public_id: "placeholder",
      };
    } else {
      imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "photography_trading/images",
        resource_type: "auto",
      });
    }

    const priceUsd = (price * ethPrice).toFixed(2);

    // Calculate gas fee: $200 USD equivalent in ETH
    const gasFeeUsd = 200;
    const gasFeeEth = (gasFeeUsd / ethPrice).toFixed(8);

    // Create image document in pending state (awaiting admin approval)
    const image = new imageModel({
      title,
      description: description || "",
      imageUrl: imageResult.secure_url,
      thumbnailUrl: imageResult.secure_url.replace(
        "/upload/",
        "/upload/w_300,h_300,c_fill/",
      ),
      sellerId: userId,
      priceEth: price.toString(),
      priceUsd: priceUsd,
      ethPriceAtListing: ethPrice.toString(),
      category: category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      usageRights: usageRights || "personal_use",
      licenseType: licenseType || "non-exclusive",
      status: "pending_approval",
      approvalStatus: "pending",
      gasFee: gasFeeEth,
    });

    await image.save();

    // Deduct gas fee from user's balance
    // Since balance is stored as a decimal ETH string, we need to calculate it manually
    const currentBalance = parseFloat(user.balance || "0");
    const newBalance = Math.max(0, currentBalance - parseFloat(gasFeeEth));

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $push: { ownedImages: image._id },
        balance: newBalance.toString(), // Set balance to new calculated value
      },
      { new: true },
    );

    // Create transaction record for pending upload fee
    if (transactionModel) {
      const transaction = new transactionModel({
        userId: userId,
        type: "upload_pending",
        description: `Image upload pending admin approval: ${title}`,
        amountEth: gasFeeEth,
        amountUsd: gasFeeUsd.toString(),
        ethPriceAtTime: ethPrice.toString(),
        gasFeeEth: gasFeeEth,
        imageId: image._id,
        status: "pending",
      });
      await transaction.save();

      // Add transaction to user's transactions array
      await userModel.findByIdAndUpdate(userId, {
        $push: { transactions: transaction._id },
      });
    }

    // Get updated balance for response
    const updatedBalanceEth = parseFloat(updatedUser.balance || "0");
    const updatedBalanceUsd = updatedBalanceEth * ethPrice;

    res.json({
      success: true,
      message: "Image uploaded successfully and is pending admin approval.",
      image: {
        _id: image._id,
        title: image.title,
        imageUrl: image.imageUrl,
        priceEth: image.priceEth,
        priceUsd: image.priceUsd,
        status: image.status,
        approvalStatus: image.approvalStatus,
        gasFee: image.gasFee,
      },
      gasFeeDeducted: {
        amountEth: gasFeeEth,
        amountUsd: gasFeeUsd,
      },
      updatedBalance: {
        balanceEth: updatedBalanceEth.toFixed(8),
        balanceUsd: updatedBalanceUsd.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};

/**
 * Get all available images (for browsing/shopping)
 */
export const getImages = async (req, res) => {
  try {
    const { category, limit = 20, skip = 0, sortBy = "createdAt" } = req.query;
    let query = { status: "active" };

    if (category) {
      query.category = category;
    }

    const images = await imageModel
      .find(query)
      .populate("sellerId", "name profilePicture")
      .select("-purchaseHistory") // Don't send full purchase history in list
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await imageModel.countDocuments(query);

    // Add price formatting to response
    const ethPrice = await getCurrentEthPrice();
    const imageList = images.map((img) => ({
      ...img.toObject(),
      currency: {
        eth: img.priceEth,
        usd: img.priceUsd,
        formatted: `${parseFloat(img.priceEth).toFixed(8)} ETH ($${parseFloat(img.priceUsd).toFixed(2)})`,
      },
    }));

    res.json({
      success: true,
      images: imageList,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
      currentEthPrice: ethPrice,
    });
  } catch (error) {
    console.error("Error getting images:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving images",
      error: error.message,
    });
  }
};

/**
 * Get single image details
 */
export const getImageById = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId; // From auth middleware

    const image = await imageModel
      .findById(imageId)
      .populate(
        "sellerId",
        "name email profilePicture location expertiseLevel specialty bio",
      )
      .populate("purchaseHistory.buyerId", "name profilePicture");

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Increment view count
    image.views += 1;
    await image.save();

    const ethPrice = await getCurrentEthPrice();

    // Check if user has favourited this image
    const isFavourite = userId ? image.favouritedBy.includes(userId) : false;

    res.json({
      success: true,
      image: {
        ...image.toObject(),
        views: (() => {
          const totalViews = image.views + image.fakeViewsAdded;
          if (totalViews === 0) {
            return 0;
          } else if (totalViews === 1) {
            return Math.floor(Math.random() * 27) + 41; // 1 view × (41-67)
          } else {
            // First view × (41-67), remaining views × (1-6)
            const firstViewMultiplier = Math.floor(Math.random() * 27) + 41;
            const restMultiplier =
              (totalViews - 1) * (Math.floor(Math.random() * 6) + 1);
            return firstViewMultiplier + restMultiplier;
          }
        })(), // Custom multiplier: first view × 41-67, rest × 1-6
        isFavourite,
        currency: {
          eth: image.priceEth,
          usd: image.priceUsd,
          formatted: `${parseFloat(image.priceEth).toFixed(8)} ETH ($${parseFloat(image.priceUsd).toFixed(2)})`,
        },
      },
      currentEthPrice: ethPrice,
    });
  } catch (error) {
    console.error("Error getting image:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving image",
      error: error.message,
    });
  }
};

/**
 * Get user's uploaded images
 */
export const getUserImages = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const images = await imageModel
      .find({ sellerId: userId })
      .select("-purchaseHistory")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await imageModel.countDocuments({ sellerId: userId });

    res.json({
      success: true,
      images,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting user images:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user images",
      error: error.message,
    });
  }
};

/**
 * Update image price
 */
export const updateImagePrice = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { priceEth } = req.body;
    const userId = req.body.userId || req.userId;

    const image = await imageModel.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only image owner can update price",
      });
    }

    const price = parseFloat(priceEth);
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    const ethPrice = await getCurrentEthPrice();
    const priceUsd = (price * ethPrice).toFixed(2);

    image.priceEth = price.toString();
    image.priceUsd = priceUsd;
    image.ethPriceAtListing = ethPrice.toString();
    await image.save();

    res.json({
      success: true,
      message: "Image price updated successfully",
      image: {
        _id: image._id,
        priceEth: image.priceEth,
        priceUsd: image.priceUsd,
      },
    });
  } catch (error) {
    console.error("Error updating image price:", error);
    res.status(500).json({
      success: false,
      message: "Error updating image price",
      error: error.message,
    });
  }
};

/**
 * Toggle image favorite status
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.body.userId || req.userId;

    const user = await userModel.findById(userId);
    const image = await imageModel.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const isFavorited = user.favorites.includes(imageId);

    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== imageId,
      );
      image.favoriteCount = Math.max(0, image.favoriteCount - 1);
    } else {
      // Add to favorites
      user.favorites.push(imageId);
      image.favoriteCount += 1;
    }

    await user.save();
    await image.save();

    res.json({
      success: true,
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
      isFavorited: !isFavorited,
      favoriteCount: image.favoriteCount,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      message: "Error updating favorite",
      error: error.message,
    });
  }
};

/**
 * Delete image (can only be done by owner or admin)
 */
export const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.body.userId || req.userId;

    const image = await imageModel.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only image owner can delete",
      });
    }

    // Delete from Cloudinary if needed
    if (image.imageUrl && image.imageUrl.includes("cloudinary")) {
      try {
        // Extract public_id from URL if needed
        // await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Could not delete from Cloudinary:", err);
      }
    }

    // Delete image and remove from user's ownedImages
    await imageModel.findByIdAndDelete(imageId);
    await userModel.findByIdAndUpdate(userId, {
      $pull: {
        ownedImages: imageId,
        favorites: imageId, // Also remove from anyone's favorites
      },
    });

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

/**
 * Search images
 */
export const searchImages = async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sellerId,
      limit = 20,
      skip = 0,
    } = req.query;

    let searchQuery = { status: "active" };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    if (sellerId) {
      searchQuery.sellerId = sellerId;
    }

    if (minPrice || maxPrice) {
      searchQuery.priceEth = {};
      if (minPrice) {
        searchQuery.priceEth.$gte = parseFloat(minPrice).toString();
      }
      if (maxPrice) {
        searchQuery.priceEth.$lte = parseFloat(maxPrice).toString();
      }
    }

    const images = await imageModel
      .find(searchQuery)
      .populate(
        "sellerId",
        "name profilePicture location expertiseLevel specialty",
      )
      .select("-purchaseHistory")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await imageModel.countDocuments(searchQuery);

    res.json({
      success: true,
      images,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching images:", error);
    res.status(500).json({
      success: false,
      message: "Error searching images",
      error: error.message,
    });
  }
};

/**
 * Admin: Upload image for a user
 */
export const adminUploadImage = async (req, res) => {
  try {
    const {
      title,
      description,
      priceEth,
      category,
      tags,
      usageRights,
      licenseType,
      userId,
    } = req.body;

    const ALLOWED_CATEGORIES = await getAllowedImageCategories();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    if (!title || !priceEth || !category || !userId) {
      return res.status(400).json({
        success: false,
        message: "Title, price, category, and userId are required",
      });
    }

    // Validate category
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}`,
      });
    }

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate price
    const price = parseFloat(priceEth);
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Upload to Cloudinary
    let imageResult;
    if (process.env.NODE_ENV === "development" && !req.file.path) {
      imageResult = {
        secure_url: `https://via.placeholder.com/400?text=${encodeURIComponent(title)}`,
        public_id: "placeholder",
      };
    } else {
      imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "photography_trading/images",
        resource_type: "auto",
      });
    }

    // Get current ETH price
    const ethPrice = await getCurrentEthPrice();
    const priceUsd = (price * ethPrice).toFixed(2);

    // Create image document
    const image = new imageModel({
      title,
      description: description || "",
      imageUrl: imageResult.secure_url,
      thumbnailUrl: imageResult.secure_url.replace(
        "/upload/",
        "/upload/w_300,h_300,c_fill/",
      ),
      sellerId: userId,
      priceEth: price.toString(),
      priceUsd: priceUsd,
      ethPriceAtListing: ethPrice.toString(),
      category: category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      usageRights: usageRights || "personal_use",
      licenseType: licenseType || "non-exclusive",
      status: "active",
    });

    await image.save();

    // Add to user's ownedImages
    await userModel.findByIdAndUpdate(
      userId,
      { $push: { ownedImages: image._id } },
      { new: true },
    );

    res.json({
      success: true,
      message: "Image uploaded successfully for user",
      image: {
        _id: image._id,
        title: image.title,
        imageUrl: image.imageUrl,
        priceEth: image.priceEth,
        priceUsd: image.priceUsd,
        status: image.status,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};

/**
 * Admin: Mass upload images for users
 */
export const adminMassUploadImages = async (req, res) => {
  try {
    const files = req.files || [];
    const rawMetadata = req.body.metadata;
    const metadata = rawMetadata ? JSON.parse(rawMetadata) : [];

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    if (files.length > 10) {
      return res.status(400).json({
        success: false,
        message: "You can upload at most 10 images at once",
      });
    }

    if (!Array.isArray(metadata) || metadata.length !== files.length) {
      return res.status(400).json({
        success: false,
        message: "Metadata must be provided for every uploaded image",
      });
    }

    const ALLOWED_CATEGORIES = await getAllowedImageCategories();

    const uploadedImages = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const item = metadata[index] || {};
      const {
        title,
        description,
        priceEth,
        category,
        tags,
        usageRights,
        licenseType,
        userId,
      } = item;

      if (!title || !priceEth || !category || !userId) {
        return res.status(400).json({
          success: false,
          message: `Title, price, category, and userId are required for image ${index + 1}`,
        });
      }

      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category for image ${index + 1}. Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}`,
        });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: `User not found for image ${index + 1}`,
        });
      }

      const price = parseFloat(priceEth);
      if (Number.isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for image ${index + 1}`,
        });
      }

      let imageResult;
      if (process.env.NODE_ENV === "development" && !file.path) {
        imageResult = {
          secure_url: `https://via.placeholder.com/400?text=${encodeURIComponent(title)}`,
          public_id: "placeholder",
        };
      } else {
        imageResult = await cloudinary.uploader.upload(file.path, {
          folder: "photography_trading/images",
          resource_type: "auto",
        });
      }

      const ethPrice = await getCurrentEthPrice();
      const priceUsd = (price * ethPrice).toFixed(2);

      const image = new imageModel({
        title,
        description: description || "",
        imageUrl: imageResult.secure_url,
        thumbnailUrl: imageResult.secure_url.replace(
          "/upload/",
          "/upload/w_300,h_300,c_fill/",
        ),
        sellerId: userId,
        priceEth: price.toString(),
        priceUsd: priceUsd,
        ethPriceAtListing: ethPrice.toString(),
        category,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        usageRights: usageRights || "personal_use",
        licenseType: licenseType || "non-exclusive",
        status: "active",
      });

      await image.save();
      await userModel.findByIdAndUpdate(
        userId,
        { $push: { ownedImages: image._id } },
        { new: true },
      );

      uploadedImages.push({
        _id: image._id,
        title: image.title,
        imageUrl: image.imageUrl,
        priceEth: image.priceEth,
        priceUsd: image.priceUsd,
        sellerId: userId,
      });
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Error bulk uploading images:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
};

/**
 * Get all pending uploads (Admin only)
 */
export const getPendingUploads = async (req, res) => {
  try {
    const pending = await imageModel
      .find({ approvalStatus: "pending" })
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pending.length,
      uploads: pending,
    });
  } catch (error) {
    console.error("Error fetching pending uploads:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending uploads",
      error: error.message,
    });
  }
};

/**
 * Get user's pending uploads
 */
export const getUserPendingUploads = async (req, res) => {
  try {
    const userId = req.userId;
    const pending = await imageModel
      .find({ sellerId: userId, approvalStatus: "pending" })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pending.length,
      uploads: pending,
    });
  } catch (error) {
    console.error("Error fetching user pending uploads:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending uploads",
      error: error.message,
    });
  }
};

/**
 * Approve image upload (Admin only)
 */
export const approveImageUpload = async (req, res) => {
  try {
    const { imageId } = req.params;
    const adminId = req.userId; // Admin user who is approving

    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Image is not pending approval",
      });
    }

    const sellerId = image.sellerId;
    const gasFee = parseFloat(image.gasFee);
    const ethPrice = await getCurrentEthPrice();
    const gasFeeUsd = (gasFee * ethPrice).toFixed(2);

    // Update image status
    image.status = "active";
    image.approvalStatus = "approved";
    image.approvedAt = new Date();
    image.approvedBy = adminId;
    await image.save();

    // Add to user's ownedImages
    await userModel.findByIdAndUpdate(
      sellerId,
      { $push: { ownedImages: image._id } },
      { new: true },
    );

    // No additional balance deduction here (fee already deducted at upload time)
    const user = await userModel.findById(sellerId);

    // Update pending transaction to approval
    let transaction = null;
    if (transactionModel) {
      transaction = await transactionModel.findOneAndUpdate(
        {
          userId: sellerId,
          imageId: image._id,
          type: "upload_pending",
          status: "pending",
        },
        {
          type: "upload_approval",
          status: "completed",
          description: `Image upload approved: ${image.title}`,
          completedAt: new Date(),
          amountEth: gasFee.toString(),
          amountUsd: gasFeeUsd.toString(),
          ethPriceAtTime: ethPrice.toString(),
          gasFeeEth: gasFee.toString(),
        },
        { new: true },
      );

      if (!transaction) {
        transaction = new transactionModel({
          userId: sellerId,
          type: "upload_approval",
          amountEth: gasFee.toString(),
          amountUsd: gasFeeUsd.toString(),
          ethPriceAtTime: ethPrice.toString(),
          gasFeeEth: gasFee.toString(),
          imageId: image._id,
          status: "completed",
          description: `Image upload approved: ${image.title}`,
          completedAt: new Date(),
        });
        await transaction.save();
        await userModel.findByIdAndUpdate(sellerId, {
          $push: { transactions: transaction._id },
        });
      }
    }

    res.json({
      success: true,
      message: "Image approved successfully",
      image: {
        _id: image._id,
        title: image.title,
        status: image.status,
        approvalStatus: image.approvalStatus,
        approvedAt: image.approvedAt,
      },
      gasFeeDeducted: {
        eth: gasFee.toString(),
        usd: gasFeeUsd,
      },
      userNewBalance: user.balance,
    });
  } catch (error) {
    console.error("Error approving image:", error);
    res.status(500).json({
      success: false,
      message: "Error approving image",
      error: error.message,
    });
  }
};

/**
 * Decline image upload (Admin only)
 */
export const declineImageUpload = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId; // Admin user who is declining

    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Image is not pending approval",
      });
    }

    const sellerId = image.sellerId;
    const ethPrice = await getCurrentEthPrice();

    // Update image to declined
    image.status = "deleted";
    image.approvalStatus = "declined";
    image.declinedAt = new Date();
    image.declinedBy = adminId;
    image.declineReason = reason || "No reason provided";
    await image.save();

    // Refund pending listing fee to user
    const user = await userModel.findById(sellerId);
    const currentBalance = parseFloat(user.balance || "0");
    const refundEth = parseFloat(image.gasFee || "0");
    user.balance = (currentBalance + refundEth).toString();
    await user.save();

    // Update pending transaction to declined
    let transaction = await transactionModel.findOneAndUpdate(
      {
        userId: sellerId,
        imageId: image._id,
        type: "upload_pending",
        status: "pending",
      },
      {
        type: "upload_decline",
        status: "failed",
        description: `Image upload declined: ${image.title}. Reason: ${image.declineReason}`,
        adminNotes: image.declineReason,
        completedAt: new Date(),
        amountEth: image.gasFee,
        amountUsd: (refundEth * ethPrice).toFixed(2),
        ethPriceAtTime: ethPrice.toString(),
        gasFeeEth: image.gasFee,
      },
      { new: true },
    );

    if (!transaction) {
      transaction = new transactionModel({
        userId: sellerId,
        type: "upload_decline",
        amountEth: image.gasFee,
        amountUsd: (refundEth * ethPrice).toFixed(2),
        ethPriceAtTime: ethPrice.toString(),
        gasFeeEth: image.gasFee,
        imageId: image._id,
        status: "failed",
        description: `Image upload declined: ${image.title}. Reason: ${image.declineReason}`,
        adminNotes: image.declineReason,
        completedAt: new Date(),
      });
      await transaction.save();
      await userModel.findByIdAndUpdate(sellerId, {
        $push: { transactions: transaction._id },
      });
    }

    res.json({
      success: true,
      message: "Image declined successfully",
      image: {
        _id: image._id,
        title: image.title,
        status: image.status,
        approvalStatus: image.approvalStatus,
        declinedAt: image.declinedAt,
        declineReason: image.declineReason,
      },
    });
  } catch (error) {
    console.error("Error declining image:", error);
    res.status(500).json({
      success: false,
      message: "Error declining image",
      error: error.message,
    });
  }
};

/**
 * Toggle trending status for an image (Admin only)
 */
export const toggleTrending = async (req, res) => {
  try {
    const { imageId } = req.params;

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
        message: "Only active images can be marked as trending",
      });
    }

    // Toggle the trending status
    image.isTrending = !image.isTrending;
    await image.save();

    res.json({
      success: true,
      message: image.isTrending
        ? "Image marked as trending"
        : "Image unmarked as trending",
      image: {
        _id: image._id,
        title: image.title,
        isTrending: image.isTrending,
      },
    });
  } catch (error) {
    console.error("Error toggling trending status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling trending status",
      error: error.message,
    });
  }
};

/**
 * Add/Remove image from user's favourites
 */
export const addToFavourite = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to favourite images",
      });
    }

    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const isFavourited = image.favouritedBy.includes(userId);

    if (isFavourited) {
      // Remove from favourites
      image.favouritedBy = image.favouritedBy.filter(
        (id) => id.toString() !== userId,
      );
      image.favoriteCount = Math.max(0, image.favoriteCount - 1);
    } else {
      // Add to favourites
      image.favouritedBy.push(userId);
      image.favoriteCount += 1;
    }

    await image.save();

    res.json({
      success: true,
      message: isFavourited ? "Removed from favourites" : "Added to favourites",
      isFavourite: !isFavourited,
      favoriteCount: image.favoriteCount,
    });
  } catch (error) {
    console.error("Error updating favourite:", error);
    res.status(500).json({
      success: false,
      message: "Error updating favourite",
      error: error.message,
    });
  }
};

/**
 * Report an image
 */
export const reportImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to report images",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }

    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Check if user already reported this image
    const alreadyReported = image.reports.some(
      (r) => r.reportedBy.toString() === userId,
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this image",
      });
    }

    // Add report
    image.reports.push({
      reportedBy: userId,
      reason,
      reportedAt: new Date(),
    });

    // If reports exceed threshold, flag the image
    if (image.reports.length >= 5) {
      image.status = "flagged";
    }

    await image.save();

    res.json({
      success: true,
      message: "Image reported successfully",
    });
  } catch (error) {
    console.error("Error reporting image:", error);
    res.status(500).json({
      success: false,
      message: "Error reporting image",
      error: error.message,
    });
  }
};

/**
 * Create a purchase request for an image
 */
export const buyImageRequest = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to request purchase",
      });
    }

    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Check if user already requested to buy
    const alreadyRequested = image.buyRequests.some(
      (r) => r.requestedBy.toString() === userId && r.status === "pending",
    );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: "You have already requested to buy this image",
      });
    }

    // Add buy request
    image.buyRequests.push({
      requestedBy: userId,
      requestedAt: new Date(),
      status: "pending",
    });

    await image.save();

    // TODO: Create notification for image owner

    res.json({
      success: true,
      message: "Purchase request sent to uploader",
    });
  } catch (error) {
    console.error("Error creating buy request:", error);
    res.status(500).json({
      success: false,
      message: "Error creating purchase request",
      error: error.message,
    });
  }
};

/**
 * Get all images for admin management
 */
export const getAllImagesForAdmin = async (req, res) => {
  try {
    const images = await imageModel
      .find({ status: "active" })
      .select(
        "title imageUrl isPopular isEditorsChoice isAmbassadorsPick isTrending priceEth priceUsd sellerId",
      )
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching admin images:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images",
      error: error.message,
    });
  }
};

/**
 * Update image section assignment
 */
export const updateImageSections = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { section, assigned } = req.body;

    // Validate section
    const validSections = [
      "trending",
      "popular",
      "editors-choice",
      "ambassadors-pick",
    ];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section",
      });
    }

    // Map section names to schema fields
    const sectionMap = {
      trending: "isTrending",
      popular: "isPopular",
      "editors-choice": "isEditorsChoice",
      "ambassadors-pick": "isAmbassadorsPick",
    };

    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Update the section field
    image[sectionMap[section]] = assigned;
    await image.save();

    res.json({
      success: true,
      message: `Image ${assigned ? "added to" : "removed from"} ${section}`,
      image,
    });
  } catch (error) {
    console.error("Error updating image sections:", error);
    res.status(500).json({
      success: false,
      message: "Error updating sections",
      error: error.message,
    });
  }
};

/**
 * Get images by section
 */
export const getImagesBySection = async (req, res) => {
  try {
    const { section } = req.params;

    // Validate section
    const validSections = [
      "trending",
      "popular",
      "editors-choice",
      "ambassadors-pick",
    ];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section",
      });
    }

    // Map section names to schema fields
    const sectionMap = {
      trending: "isTrending",
      popular: "isPopular",
      "editors-choice": "isEditorsChoice",
      "ambassadors-pick": "isAmbassadorsPick",
    };

    const query = {
      status: "active",
      [sectionMap[section]]: true,
    };

    const images = await imageModel
      .find(query)
      .select("title imageUrl thumbnailUrl priceEth priceUsd isAmbassadorsPick")
      .populate("sellerId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      images,
      section,
    });
  } catch (error) {
    console.error("Error fetching section images:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images",
      error: error.message,
    });
  }
};

/**
 * Add fake views to an image (for social proof)
 * Generates random increments and records them
 */
export const addFakeViews = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await imageModel.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Generate random fake views (minimum 149 total, randomize addition between 15-150)
    // First ensure image has at least 149 total views
    const currentTotal = image.views + image.fakeViewsAdded;
    let fakeViewsAmount;

    if (currentTotal < 149) {
      // Add enough to reach 149 minimum
      fakeViewsAmount = 149 - currentTotal;
    } else {
      // Already above minimum, add random amount for daily growth
      fakeViewsAmount = Math.floor(Math.random() * 135) + 15;
    }

    // Add to fake views
    image.fakeViewsAdded += fakeViewsAmount;

    // Record in history
    image.fakeViewsHistory.push({
      timestamp: new Date(),
      change: fakeViewsAmount,
    });

    // Save the image
    await image.save();

    res.json({
      success: true,
      message: "Fake views added successfully",
      fakeViewsAdded: fakeViewsAmount,
      totalViews: image.views + image.fakeViewsAdded,
      image: image,
    });
  } catch (error) {
    console.error("Error adding fake views:", error);
    res.status(500).json({
      success: false,
      message: "Error adding fake views",
      error: error.message,
    });
  }
};

export default {
  uploadImage,
  getImages,
  getImageById,
  getUserImages,
  updateImagePrice,
  toggleFavorite,
  deleteImage,
  searchImages,
  adminUploadImage,
  getPendingUploads,
  getUserPendingUploads,
  approveImageUpload,
  declineImageUpload,
  toggleTrending,
  addToFavourite,
  reportImage,
  buyImageRequest,
  getAllImagesForAdmin,
  updateImageSections,
  getImagesBySection,
  addFakeViews,
};
