export const DEFAULT_IMAGE_CATEGORIES = [
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

export async function fetchImageCategories(backendUrl) {
  try {
    const response = await fetch(`${backendUrl}/api/categories/image`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    if (
      data.success &&
      Array.isArray(data.categories) &&
      data.categories.length > 0
    ) {
      return data.categories;
    }
  } catch (error) {
    console.error("Error fetching image categories:", error);
  }

  return DEFAULT_IMAGE_CATEGORIES;
}
