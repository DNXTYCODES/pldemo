import RestaurantReview from "../models/restaurantReviewModel.js";
import mongoose from "mongoose";

// Add or update restaurant review
const addOrUpdateRestaurantReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.body.userId;

    let review = await RestaurantReview.findOne({ user: userId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
    } else {
      review = new RestaurantReview({
        user: userId,
        rating,
        comment
      });
    }

    await review.save();
    res.json({ success: true, message: "Restaurant review submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all restaurant reviews
const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await RestaurantReview.find()
      .populate('user', 'name')
      .sort({ date: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's restaurant review
const getUserRestaurantReview = async (req, res) => {
  try {
    const userId = req.body.userId;
    const review = await RestaurantReview.findOne({ user: userId });
    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addOrUpdateRestaurantReview, getRestaurantReviews, getUserRestaurantReview };