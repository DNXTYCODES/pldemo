import categoryModel from "../models/categoryModel.js";

const DEFAULT_IMAGE_CATEGORIES = [
  "Landscape",
  "Portrait",
  "Wildlife",
  "Architecture",
  "Street",
  "Macro",
  "Abstract",
  "Nature",
  "People",
  "Product",
];

const normalizeCategoryName = (name) => name.trim().toLowerCase();

export const getImageCategories = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ type: "image" })
      .sort({ name: 1 });

    const existingCategoryNames = categories.map((item) => item.name);
    const mergedCategories = [
      ...DEFAULT_IMAGE_CATEGORIES,
      ...existingCategoryNames.filter(
        (name) =>
          !DEFAULT_IMAGE_CATEGORIES
            .map(normalizeCategoryName)
            .includes(normalizeCategoryName(name)),
      ),
    ];

    res.json({
      success: true,
      categories: mergedCategories,
    });
  } catch (error) {
    console.error("Error fetching image categories:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch image categories",
      error: error.message,
    });
  }
};

export const createImageCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const normalized = name.trim();
    const lowerNormalized = normalizeCategoryName(normalized);

    const defaultExists = DEFAULT_IMAGE_CATEGORIES.some(
      (defaultName) => normalizeCategoryName(defaultName) === lowerNormalized,
    );

    const existingCategory = await categoryModel.findOne({
      name: { $regex: `^${normalized}$`, $options: "i" },
      type: "image",
    });

    if (defaultExists || existingCategory) {
      return res.json({
        success: false,
        message: "This category already exists",
      });
    }

    const category = await categoryModel.create({
      name: normalized,
      type: "image",
    });

    res.json({
      success: true,
      message: "Image category created successfully",
      category: category.name,
    });
  } catch (error) {
    console.error("Error creating image category:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create image category",
      error: error.message,
    });
  }
};
