import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, enum: ["image"], default: "image" },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false },
);

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;
