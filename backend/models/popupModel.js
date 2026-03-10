import mongoose from "mongoose";

const popupSchema = new mongoose.Schema({
  message: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

const PopupModel = mongoose.models.popup || mongoose.model("popup", popupSchema);

export default PopupModel;