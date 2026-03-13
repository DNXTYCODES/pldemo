import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch actual categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all images to extract unique categories
        const response = await fetch(
          `${backendUrl}/api/images/search?limit=1000`,
        );
        const data = await response.json();
        
        if (data.success && data.images && data.images.length > 0) {
          // Extract unique categories from images
          const uniqueCategoriesSet = new Set();
          data.images.forEach((image) => {
            if (image.category) {
              uniqueCategoriesSet.add(image.category);
            }
          });
          
          // Convert to array of category objects
          const uniqueCategories = Array.from(uniqueCategoriesSet)
            .sort()
            .map((categoryName) => ({
              name: categoryName,
              count: data.images.filter((img) => img.category === categoryName)
                .length,
            }));
          
          setCategories(uniqueCategories);
          // Fetch images for each category
          uniqueCategories.forEach((category) => {
            fetchCategoryImages(category.name);
          });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [backendUrl]);

  // Fetch images for a specific category and pick a random one
  const fetchCategoryImages = async (categoryName) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/images/search?category=${categoryName}&limit=100`,
      );
      const data = await response.json();
      if (data.success && data.images && data.images.length > 0) {
        // Select a random image from the category
        const randomImage =
          data.images[Math.floor(Math.random() * data.images.length)];
        setCategoryImages((prev) => ({
          ...prev,
          [categoryName]: randomImage,
        }));
      }
    } catch (error) {
      console.error(`Error fetching images for ${categoryName}:`, error);
    }

    // Mark loading as complete once all categories are processed
    setLoading(false);
  };

  const handleViewMore = (categoryName) => {
    navigate(`/explore?category=${categoryName}`);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Explore by <span className="text-amber-500">Category</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our curated collection of photography across different genres
          and styles. Each category showcases unique perspectives and artistic
          visions.
        </p>
      </div>

      {/* Categories Grid */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}
      >
        {categories.map((category) => {
          const categoryImage = categoryImages[category.name];
          return (
            <div
              key={category.name}
              className="group relative h-72 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Category Image */}
              {categoryImage ? (
                <img
                  src={categoryImage.thumbnailUrl || categoryImage.imageUrl}
                  alt={categoryImage.name || categoryImage.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>

              {/* Category Info */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Top: Category Name */}
                <div>
                  <h3 className="text-white text-lg sm:text-xl font-bold capitalize">
                    {category.name}
                  </h3>
                  <p className="text-amber-300 text-sm font-medium">
                    {category.count} {category.count === 1 ? "photo" : "photos"}
                  </p>
                </div>

                {/* Bottom: View More Button */}
                <button
                  onClick={() => handleViewMore(category.name)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
                >
                  View More →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
