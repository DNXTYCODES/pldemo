import express from 'express';
import { addOrUpdateReview, getProductReviews, getUserReview } from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', auth, addOrUpdateReview);
router.get('/user/:productId', auth, getUserReview);

// Public routes
router.get('/product/:productId', getProductReviews);

export default router;