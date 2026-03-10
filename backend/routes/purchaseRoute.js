import express from "express";
import {
  purchaseImage,
  getPurchaseHistory,
  selectiveVerifyPayment,
} from "../controllers/purchaseController.js";
import auth from "../middleware/auth.js";

const purchaseRouter = express.Router();

// User Routes
purchaseRouter.post("/buy-image", auth, purchaseImage); // Purchase an image
purchaseRouter.get("/history", auth, getPurchaseHistory); // Get purchase history
purchaseRouter.post("/verify", auth, selectiveVerifyPayment); // Verify/confirm purchase

export default purchaseRouter;
