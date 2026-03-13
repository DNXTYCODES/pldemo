import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { getFormattedPrice } from "../utils/ethPrice";
import { toast } from "react-toastify";

const PhotoTabs = () => {
  const { backendUrl, currencyPreference, ethPrice, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [allImages, setAllImages] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [trendingImages, setTrendingImages] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

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

  // Fetch trending images from backend section
  const fetchTrendingImages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/images/section/trending`);
      const data = await response.json();
      if (data.success) {
        setTrendingImages(data.images.slice(0, 12));
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

  const loadUserFavorites = async () => {
    if (token) {
      try {
        const response = await fetch(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: token },
        });
        const data = await response.json();
        if (data.success && data.user.favorites) {
          const favoriteIds = new Set(
            data.user.favorites.map(fav => 
              typeof fav === 'object' ? fav._id || fav : fav
            )
          );
          setFavorites(favoriteIds);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
  };

  useEffect(() => {
    fetchAllImages();
    fetchCategoryImages();
    fetchTrendingImages();
    fetchRecentImages();
  }, [backendUrl]);

  useEffect(() => {
    if (token) {
      loadUserFavorites();
    }
  }, [token, backendUrl]);

  const handleFavorite = async (e, imageId) => {
    e.stopPropagation();
    
    if (!token) {
      toast.error("Please log in to favorite images");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/images/${imageId}/favorite`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        await loadUserFavorites();
        toast.success(data.isFavorited ? "Added to favorites" : "Removed from favorites");
      } else {
        toast.error(data.message || "Failed to update favorite");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Error updating favorite");
    }
  };

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
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">
              Explore
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading images...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allImages.slice(0, 24).map((image) => (
                  <div
                    key={image._id}
                    className="group relative cursor-pointer overflow-hidden rounded-md bg-gray-200 aspect-square"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.title}
                      onClick={() => navigate(`/image/${image._id}`)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                      {/* Uploader Info & Price */}
                      <div className="flex flex-col gap-2 w-full">
                        {/* Price */}
                        {image.priceEth && (
                          <div className="bg-white/90 rounded-md px-2 py-1 w-full">
                            <p className="text-xs font-semibold text-gray-900">
                              {getFormattedPrice(
                                image.priceEth,
                                ethPrice,
                                currencyPreference,
                              )}
                            </p>
                          </div>
                        )}
                        {/* Uploader Info */}
                        <div className="flex items-center gap-2 bg-white/90 rounded-md px-2 py-1.5 w-full">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {image.sellerId?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {image.sellerId?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleFavorite(e, image._id)}
                          className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                          title="Like"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={favorites.has(image._id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/image/${image._id}`);
                          }}
                          className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                          title="View Details"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-700"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
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
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">
              Photography Categories
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading categories...
              </div>
            ) : (
              <div className="space-y-10">
                {categoriesData.map((category) => (
                  <div key={category.id}>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {category.images.map((image) => (
                        <div
                          key={image._id}
                          className="group relative cursor-pointer overflow-hidden rounded-md bg-gray-200 aspect-square"
                        >
                          <img
                            src={image.thumbnailUrl || image.imageUrl}
                            alt={image.title}
                            onClick={() => navigate(`/image/${image._id}`)}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                            {/* Uploader Info & Price */}
                            <div className="flex flex-col gap-2 w-full">
                              {/* Price */}
                              {image.priceEth && (
                                <div className="bg-white/90 rounded-md px-2 py-1 w-full">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {getFormattedPrice(
                                      image.priceEth,
                                      ethPrice,
                                      currencyPreference,
                                    )}
                                  </p>
                                </div>
                              )}
                              {/* Uploader Info */}
                              <div className="flex items-center gap-2 bg-white/90 rounded-md px-2 py-1.5 w-full">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {image.sellerId?.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-900 truncate">
                                  {image.sellerId?.name || "Unknown"}
                                </span>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => handleFavorite(e, image._id)}
                                className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                                title="Like"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill={favorites.has(image._id) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-red-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/image/${image._id}`);
                                }}
                                className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                                title="View Details"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-gray-700"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
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
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">
              Trending This Week
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading trending images...
              </div>
            ) : trendingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {trendingImages.map((image) => (
                  <div
                    key={image._id}
                    className="group relative cursor-pointer overflow-hidden rounded-md bg-gray-200 aspect-square"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.title}
                      onClick={() => navigate(`/image/${image._id}`)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {/* Editor's Pick Badge */}
                    {image.isAmbassadorsPick && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                          📌 Pick
                        </span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                      {/* Uploader Info & Price */}
                      <div className="flex flex-col gap-2 w-full">
                        {/* Price */}
                        {image.priceEth && (
                          <div className="bg-white/90 rounded-md px-2 py-1 w-full">
                            <p className="text-xs font-semibold text-gray-900">
                              {getFormattedPrice(
                                image.priceEth,
                                ethPrice,
                                currencyPreference,
                              )}
                            </p>
                          </div>
                        )}
                        {/* Uploader Info */}
                        <div className="flex items-center gap-2 bg-white/90 rounded-md px-2 py-1.5 w-full">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {image.sellerId?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {image.sellerId?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleFavorite(e, image._id)}
                          className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                          title="Like"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={favorites.has(image._id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/image/${image._id}`);
                          }}
                          className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                          title="View Details"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-700"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
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
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">
              Recently Added
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading recent images...
              </div>
            ) : recentImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {recentImages.slice(0, 24).map((image) => (
                  <div
                    key={image._id}
                    className="group relative cursor-pointer overflow-hidden rounded-md bg-gray-200 aspect-square"
                  >
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt={image.title}
                      onClick={() => navigate(`/image/${image._id}`)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                      {/* Uploader Info & Price */}
                      <div className="flex flex-col gap-2 w-full">
                        {/* Price */}
                        {image.priceEth && (
                          <div className="bg-white/90 rounded-md px-2 py-1 w-full">
                            <p className="text-xs font-semibold text-gray-900">
                              {getFormattedPrice(
                                image.priceEth,
                                ethPrice,
                                currencyPreference,
                              )}
                            </p>
                          </div>
                        )}
                        {/* Uploader Info */}
                        <div className="flex items-center gap-2 bg-white/90 rounded-md px-2 py-1.5 w-full">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {image.sellerId?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {image.sellerId?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleFavorite(e, image._id)}
                          className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                          title="Like"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={favorites.has(image._id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/image/${image._id}`);
                          }}
                          className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                          title="View Details"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-700"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
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
