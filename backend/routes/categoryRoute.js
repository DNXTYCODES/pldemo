import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getImageCategories,
  createImageCategory,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/image", getImageCategories);
categoryRouter.post("/image", adminAuth, createImageCategory);

export default categoryRouter;
