import Review from "../models/reviewModel.js";
import mongoose from "mongoose";
import Product from "../models/productModel.js";

// Add or update review
const addOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    // Use req.body.userId instead of req.user.id
    const userId = req.body.userId;

    // Check for existing review
    let review = await Review.findOne({ user: userId, product: productId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
    } else {
      // Create new review
      review = new Review({
        user: userId,
        product: productId,
        rating,
        comment
      });
    }

    await review.save();

    // Update product average rating
    await updateProductRating(productId);

    res.json({ success: true, message: "Review submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ date: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's review for a product
const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    // Use req.body.userId instead of req.user.id
    const userId = req.body.userId;
    
    const review = await Review.findOne({ 
      user: userId, 
      product: productId 
    });

    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update product average rating
const updateProductRating = async (productId) => {
  try {
    const result = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { 
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: result[0].averageRating,
        reviewCount: result[0].reviewCount
      });
    } else {
      // If no reviews, reset to default
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

export { addOrUpdateReview, getProductReviews, getUserReview };


















// import Review from "../models/reviewModel.js";
// import mongoose from "mongoose"; // Add mongoose import
// import Product from "../models/productModel.js"; // Import Product model

// // Add or update review
// const addOrUpdateReview = async (req, res) => {
//   try {
//     const { productId, rating, comment } = req.body;
//     const userId = req.user.id;

//     // Check for existing review
//     let review = await Review.findOne({ user: userId, product: productId });

//     if (review) {
//       // Update existing review
//       review.rating = rating;
//       review.comment = comment;
//     } else {
//       // Create new review
//       review = new Review({
//         user: userId,
//         product: productId,
//         rating,
//         comment
//       });
//     }

//     await review.save();

//     // Update product average rating
//     await updateProductRating(productId);

//     res.json({ success: true, message: "Review submitted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get reviews for a product
// const getProductReviews = async (req, res) => {
//   try {
//     const { productId } = req.params;
    
//     const reviews = await Review.find({ product: productId })
//       .populate('user', 'name')
//       .sort({ date: -1 });

//     res.json({ success: true, reviews });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get user's review for a product
// const getUserReview = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const userId = req.user.id;
    
//     const review = await Review.findOne({ 
//       user: userId, 
//       product: productId 
//     });

//     res.json({ success: true, review });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Helper function to update product average rating
// const updateProductRating = async (productId) => {
//   try {
//     const result = await Review.aggregate([
//       { $match: { product: new mongoose.Types.ObjectId(productId) } },
//       { 
//         $group: {
//           _id: "$product",
//           averageRating: { $avg: "$rating" },
//           reviewCount: { $sum: 1 }
//         }
//       }
//     ]);

//     if (result.length > 0) {
//       await Product.findByIdAndUpdate(productId, {
//         averageRating: result[0].averageRating,
//         reviewCount: result[0].reviewCount
//       });
//     } else {
//       // If no reviews, reset to default
//       await Product.findByIdAndUpdate(productId, {
//         averageRating: 0,
//         reviewCount: 0
//       });
//     }
//   } catch (error) {
//     console.error("Error updating product rating:", error);
//   }
// };

// export { addOrUpdateReview, getProductReviews, getUserReview };


























// import Review from "../models/reviewModel.js";

// // Add or update review
// const addOrUpdateReview = async (req, res) => {
//   try {
//     const { productId, rating, comment } = req.body;
//     const userId = req.user.id;

//     // Check for existing review
//     let review = await Review.findOne({ user: userId, product: productId });

//     if (review) {
//       // Update existing review
//       review.rating = rating;
//       review.comment = comment;
//     } else {
//       // Create new review
//       review = new Review({
//         user: userId,
//         product: productId,
//         rating,
//         comment
//       });
//     }

//     await review.save();

//     // Update product average rating
//     await updateProductRating(productId);

//     res.json({ success: true, message: "Review submitted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get reviews for a product
// const getProductReviews = async (req, res) => {
//   try {
//     const { productId } = req.params;
    
//     const reviews = await Review.find({ product: productId })
//       .populate('user', 'name')
//       .sort({ date: -1 });

//     res.json({ success: true, reviews });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get user's review for a product
// const getUserReview = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const userId = req.user.id;
    
//     const review = await Review.findOne({ 
//       user: userId, 
//       product: productId 
//     });

//     res.json({ success: true, review });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Helper function to update product average rating
// const updateProductRating = async (productId) => {
//   const result = await Review.aggregate([
//     { $match: { product: mongoose.Types.ObjectId(productId) } },
//     { 
//       $group: {
//         _id: "$product",
//         averageRating: { $avg: "$rating" },
//         reviewCount: { $sum: 1 }
//       }
//     }
//   ]);

//   if (result.length > 0) {
//     await Product.findByIdAndUpdate(productId, {
//       averageRating: result[0].averageRating,
//       reviewCount: result[0].reviewCount
//     });
//   }
// };

// export { addOrUpdateReview, getProductReviews, getUserReview };