import express from "express";
import {
  uploadImage,
  getImages,
  getImageById,
  getUserImages,
  updateImagePrice,
  toggleFavorite,
  deleteImage,
  searchImages,
  adminUploadImage,
  getPendingUploads,
  getUserPendingUploads,
  approveImageUpload,
  declineImageUpload,
} from "../controllers/imageController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const imageRouter = express.Router();

// Public Routes
imageRouter.get("/search", searchImages); // Search images
imageRouter.get("/", getImages); // Get all available images
imageRouter.get("/:imageId", getImageById); // Get single image details

// User Routes
imageRouter.post("/upload", auth, upload.single("image"), uploadImage); // Upload new image (pending approval)
imageRouter.get("/user/my-images", auth, getUserImages); // Get user's uploaded images
imageRouter.get("/user/pending", auth, getUserPendingUploads); // Get user's pending uploads
imageRouter.put("/:imageId/price", auth, updateImagePrice); // Update image price
imageRouter.put("/:imageId/favorite", auth, toggleFavorite); // Toggle favorite
imageRouter.delete("/:imageId", auth, deleteImage); // Delete image

// Admin Routes
imageRouter.post("/admin/upload", auth, upload.single("image"), adminUploadImage); // Admin upload image for user
imageRouter.get("/admin/pending", auth, getPendingUploads); // Get all pending uploads (admin)
imageRouter.post("/:imageId/approve", auth, approveImageUpload); // Approve pending upload (admin)
imageRouter.post("/:imageId/decline", auth, declineImageUpload); // Decline pending upload (admin)

export default imageRouter;
