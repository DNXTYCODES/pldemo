import express from 'express';
import { getPopup, updatePopup } from '../controllers/popupController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', getPopup);
router.put('/', adminAuth, updatePopup);

export default router;