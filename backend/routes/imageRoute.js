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
  adminMassUploadImages,
  getPendingUploads,
  getUserPendingUploads,
  approveImageUpload,
  declineImageUpload,
  toggleTrending,
  addToFavourite,
  reportImage,
  buyImageRequest,
  getAllImagesForAdmin,
  updateImageSections,
  getImagesBySection,
  addFakeViews,
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
imageRouter.post("/:imageId/favourite", auth, addToFavourite); // Add to favourite
imageRouter.post("/:imageId/report", auth, reportImage); // Report image
imageRouter.post("/:imageId/fake-views", addFakeViews); // Add fake views for social proof
imageRouter.post("/:imageId/buy-request", auth, buyImageRequest); // Request to buy image
imageRouter.delete("/:imageId", auth, deleteImage); // Delete image

// Admin Routes
imageRouter.post(
  "/admin/upload",
  auth,
  upload.single("image"),
  adminUploadImage,
); // Admin upload image for user
imageRouter.post(
  "/admin/mass-upload",
  auth,
  upload.array("images", 10),
  adminMassUploadImages,
); // Admin bulk upload images for users
imageRouter.get("/admin/pending", auth, getPendingUploads); // Get all pending uploads (admin)
imageRouter.get("/admin/all", auth, getAllImagesForAdmin); // Get all images for admin management
imageRouter.post("/:imageId/approve", auth, approveImageUpload); // Approve pending upload (admin)
imageRouter.post("/:imageId/decline", auth, declineImageUpload); // Decline pending upload (admin)
imageRouter.put("/:imageId/trending", auth, toggleTrending); // Toggle trending status (admin)
imageRouter.put("/:imageId/sections", auth, updateImageSections); // Update image section assignments (admin)

// Section-based Routes
imageRouter.get("/section/:section", getImagesBySection); // Get images by section (public)

export default imageRouter;
