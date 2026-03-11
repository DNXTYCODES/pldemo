import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const PhotoTabs = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [allImages, setAllImages] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [trendingImages, setTrendingImages] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const PHOTOGRAPHY_CATEGORIES = [
    "Landscape",
    "Portrait",
    "Wildlife",
    "Architecture",
    "Street",
    "Macro",
    "Abstract",
    "Nature",
  ];

  // Fetch all images for Explore tab
  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/images/search?limit=100`);
      const data = await response.json();
      if (data.success) {
        setAllImages(data.images);
      }
    } catch (error) {
      console.error("Error fetching all images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category images for For You tab
  const fetchCategoryImages = async () => {
    try {
      const categoryData = [];
      for (const category of PHOTOGRAPHY_CATEGORIES) {
        const response = await fetch(
          `${backendUrl}/api/images/search?category=${category}&limit=4`,
        );
        const data = await response.json();
        if (data.success && data.images.length > 0) {
          categoryData.push({
            id: category,
            name: category,
            images: data.images,
          });
        }
      }
      setCategoriesData(categoryData);
    } catch (error) {
      console.error("Error fetching category images:", error);
    }
  };

  // Fetch trending images
  const fetchTrendingImages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/images/search?limit=50`);
      const data = await response.json();
      if (data.success) {
        const trending = data.images
          .filter((img) => img.isTrending === true)
          .slice(0, 12);
        setTrendingImages(trending);
      }
    } catch (error) {
      console.error("Error fetching trending images:", error);
    }
  };

  // Fetch recent images
  const fetchRecentImages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/images/search?limit=12`);
      const data = await response.json();
      if (data.success) {
        setRecentImages(data.images);
      }
    } catch (error) {
      console.error("Error fetching recent images:", error);
    }
  };

  useEffect(() => {
    fetchAllImages();
    fetchCategoryImages();
    fetchTrendingImages();
    fetchRecentImages();
  }, []);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-200">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "explore"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Explore
          </button>

          <button
            onClick={() => setActiveTab("for-you")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "for-you"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            For You
          </button>

          <button
            onClick={() => setActiveTab("trending")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "trending"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Trending
          </button>

          <button
            onClick={() => setActiveTab("recent")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "recent"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Recently Added
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {/* Explore Tab */}
        {activeTab === "explore" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore</h2>
            <p className="text-gray-600 mb-8">
              Discover exceptional photography from talented artists around the
              world.
            </p>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading images...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allImages.slice(0, 12).map((image) => (
                  <div
                    key={image._id}
                    onClick={() => navigate(`/image/${image._id}`)}
                    className="bg-gray-100 h-64 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {image.title}
                        </h3>
                        <p className="text-xs text-gray-300">
                          {image.sellerId?.name}
                        </p>
                        {image.priceEth && (
                          <p className="text-xs text-amber-400 font-semibold mt-2">
                            {parseFloat(image.priceEth).toFixed(4)} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* For You Tab */}
        {activeTab === "for-you" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Photography Categories
            </h2>
            <p className="text-gray-600 mb-8">Browse by your interests</p>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading categories...
              </div>
            ) : (
              <div className="space-y-12">
                {categoriesData.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {category.images.map((image) => (
                        <div
                          key={image._id}
                          onClick={() => navigate(`/image/${image._id}`)}
                          className="bg-gray-100 h-64 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
                        >
                          <img
                            src={image.thumbnailUrl || image.imageUrl}
                            alt={image.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              <h3 className="font-bold text-sm line-clamp-2">
                                {image.title}
                              </h3>
                              <p className="text-xs text-gray-300">
                                {image.sellerId?.name}
                              </p>
                              {image.priceEth && (
                                <p className="text-xs text-amber-400 font-semibold mt-2">
                                  {parseFloat(image.priceEth).toFixed(4)} ETH
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === "trending" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending This Week
            </h2>
            <p className="text-gray-600 mb-8">
              Most viewed and loved photography right now
            </p>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading trending images...
              </div>
            ) : trendingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingImages.map((image) => (
                  <div
                    key={image._id}
                    onClick={() => navigate(`/image/${image._id}`)}
                    className="bg-gray-100 h-64 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {image.title}
                        </h3>
                        <p className="text-xs text-gray-300">
                          {image.sellerId?.name}
                        </p>
                        {image.priceEth && (
                          <p className="text-xs text-amber-400 font-semibold mt-2">
                            {parseFloat(image.priceEth).toFixed(4)} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No trending images yet
              </div>
            )}
          </div>
        )}

        {/* Recently Added Tab */}
        {activeTab === "recent" && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Recently Added
            </h2>
            <p className="text-gray-600 mb-8">
              Latest uploads from our community of photographers
            </p>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading recent images...
              </div>
            ) : recentImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentImages.slice(0, 12).map((image) => (
                  <div
                    key={image._id}
                    onClick={() => navigate(`/image/${image._id}`)}
                    className="bg-gray-100 h-64 group relative cursor-pointer overflow-hidden rounded-md hover:shadow-md transition"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-sm line-clamp-2">
                          {image.title}
                        </h3>
                        <p className="text-xs text-gray-300">
                          {image.sellerId?.name}
                        </p>
                        {image.priceEth && (
                          <p className="text-xs text-amber-400 font-semibold mt-2">
                            {parseFloat(image.priceEth).toFixed(4)} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent images yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoTabs;
