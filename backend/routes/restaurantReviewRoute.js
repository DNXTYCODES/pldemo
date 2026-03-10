import express from 'express';
import { 
  addOrUpdateRestaurantReview, 
  getRestaurantReviews, 
  getUserRestaurantReview 
} from '../controllers/restaurantReviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, addOrUpdateRestaurantReview);
router.get('/', getRestaurantReviews);
router.get('/user', auth, getUserRestaurantReview);

export default router;