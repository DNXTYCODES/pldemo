import PopupModel from "../models/popupModel.js";

// Get current popup message
export const getPopup = async (req, res) => {
  try {
    const popup = await PopupModel.findOne().sort({ updatedAt: -1 });
    res.json({ success: true, popup: popup?.message || "" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update popup message
export const updatePopup = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (message.trim()) {
      await PopupModel.create({ message });
    } else {
      await PopupModel.deleteMany({});
    }
    
    res.json({ success: true, message: "Popup updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};