import mongoose from "mongoose";

const restaurantReviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

const RestaurantReview = mongoose.models.RestaurantReview || mongoose.model("RestaurantReview", restaurantReviewSchema);

export default RestaurantReview;