import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const notificationRouter = express.Router();

// User Routes
notificationRouter.get("/", auth, getNotifications); // Get all notifications
notificationRouter.get("/unread-count", auth, getUnreadCount); // Get unread count
notificationRouter.put("/:notificationId/read", auth, markAsRead); // Mark single as read
notificationRouter.put("/read-all", auth, markAllAsRead); // Mark all as read
notificationRouter.delete("/:notificationId", auth, deleteNotification); // Delete single
notificationRouter.delete("/", auth, deleteAllNotifications); // Delete all

export default notificationRouter;
