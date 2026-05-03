import express from "express";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  initiateWithdrawal,
  getPendingWithdrawalFees,
  confirmWithdrawalFee,
  rejectWithdrawalFee,
  getUserWithdrawalCodes,
  redeemWithdrawalCode,
  getPendingWithdrawals,
  confirmWithdrawal,
  rejectWithdrawal,
} from "../controllers/withdrawalController.js";

const router = express.Router();

// User routes
router.post("/initiate", auth, initiateWithdrawal); // User initiates withdrawal (creates fee pending)
router.get("/codes", auth, getUserWithdrawalCodes); // Get user's codes
router.post("/redeem", auth, redeemWithdrawalCode); // Redeem a code to create withdrawal request

// Admin routes for fees
router.get("/admin/fees/pending", adminAuth, getPendingWithdrawalFees);
router.put("/admin/fees/confirm/:transactionId", adminAuth, confirmWithdrawalFee);
router.put("/admin/fees/reject/:transactionId", adminAuth, rejectWithdrawalFee);

// Admin routes for withdrawals
router.get("/admin/pending", adminAuth, getPendingWithdrawals);
router.put("/admin/confirm/:transactionId", adminAuth, confirmWithdrawal);
router.put("/admin/reject/:transactionId", adminAuth, rejectWithdrawal);

export default router;
