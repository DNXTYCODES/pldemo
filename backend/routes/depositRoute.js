import express from "express";
import {
  initiateDeposit,
  getDepositStatus,
  getPendingDeposits,
  confirmDeposit,
  rejectDeposit,
  getUserTransactions,
} from "../controllers/depositController.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const depositRouter = express.Router();

// User Routes
depositRouter.post("/initiate", auth, initiateDeposit); // User initiates a deposit
depositRouter.get("/status/:transactionId", auth, getDepositStatus); // Check deposit status
depositRouter.get("/transactions", auth, getUserTransactions); // Get all user transactions

// Admin Routes
depositRouter.get("/admin/pending", adminAuth, getPendingDeposits); // Get pending deposits
depositRouter.put("/admin/confirm/:transactionId", adminAuth, confirmDeposit); // Confirm deposit
depositRouter.put("/admin/reject/:transactionId", adminAuth, rejectDeposit); // Reject deposit

export default depositRouter;
