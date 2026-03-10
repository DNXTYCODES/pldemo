import notificationModel from "../models/notificationModel.js";

/**
 * Get all notifications for user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { limit = 50, skip = 0 } = req.query;

    const notifications = await notificationModel
      .find({ userId })
      .populate("relatedTransactionId")
      .populate("relatedImageId", "title imageUrl")
      .populate("relatedUserId", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await notificationModel.countDocuments({ userId });

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;

    const unreadCount = await notificationModel.countDocuments({
      userId,
      read: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving unread count",
      error: error.message,
    });
  }
};

/**
 * Mark single notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId || req.userId;

    const notification = await notificationModel.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;

    const result = await notificationModel.updateMany(
      { userId, read: false },
      {
        $set: {
          read: true,
          readAt: Date.now(),
        },
      },
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
      error: error.message,
    });
  }
};

/**
 * Delete single notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId || req.userId;

    const notification = await notificationModel.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await notificationModel.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

/**
 * Delete all notifications for user
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;

    const result = await notificationModel.deleteMany({ userId });

    res.json({
      success: true,
      message: "All notifications deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notifications",
      error: error.message,
    });
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
