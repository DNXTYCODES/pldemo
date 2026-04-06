import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFormattedPrice } from "../utils/ethPrice";
import { fetchImageCategories } from "../utils/categoryService";

const PAGE_SIZE = 20;

const Explore = () => {
  const { backendUrl, currencyPreference, ethPrice } = useContext(ShopContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dynamicCategories, setDynamicCategories] = useState([
    { value: "all", label: "All Categories" },
  ]);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await fetchImageCategories(backendUrl);
      const categoryOptions = [
        { value: "all", label: "All Categories" },
        ...categories.sort().map((cat) => ({
          value: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
        })),
      ];
      setDynamicCategories(categoryOptions);
    };

    loadCategories();
  }, [backendUrl]);

  // Handle URL parameters for search
  useEffect(() => {
    const searchParam = searchParams.get("search");
    const typeParam = searchParams.get("type");
    const categoryParam = searchParams.get("category");

    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        let url = `${backendUrl}/api/images/search?limit=${PAGE_SIZE}&skip=${
          (currentPage - 1) * PAGE_SIZE
        }`;

        if (searchQuery.trim()) {
          url += `&query=${encodeURIComponent(searchQuery.trim())}`;
          // Add search type based on URL parameter
          const typeParam = searchParams.get("type");
          if (typeParam) {
            url += `&type=${encodeURIComponent(typeParam)}`;
          } else {
            // Default to general search
            url += `&type=general`;
          }
        }
        if (selectedCategory !== "all") {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          setImages([]);
          setTotalPages(1);
          return;
        }

        if (data.success && data.images) {
          let pageImages = data.images;

          switch (sortBy) {
            case "latest":
              pageImages.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
              );
              break;
            case "trending":
              pageImages.sort(
                (a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0),
              );
              break;
            case "popular":
              pageImages.sort((a, b) => (b.views || 0) - (a.views || 0));
              break;
            case "price-low":
              pageImages.sort(
                (a, b) =>
                  parseFloat(a.priceUsd || 0) - parseFloat(b.priceUsd || 0),
              );
              break;
            case "price-high":
              pageImages.sort(
                (a, b) =>
                  parseFloat(b.priceUsd || 0) - parseFloat(a.priceUsd || 0),
              );
              break;
            default:
              break;
          }

          setImages(pageImages);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setImages([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [backendUrl, searchQuery, selectedCategory, currentPage, sortBy, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Explore Gallery
          </h1>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 sm:min-w-[200px]"
            >
              {dynamicCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 sm:min-w-[160px]"
            >
              <option value="latest">Latest</option>
              <option value="trending">Trending</option>
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Pagination Controls */}
          {!loading && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 aspect-square rounded-sm animate-pulse"
                />
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="group relative cursor-pointer bg-gray-100 aspect-square rounded-sm overflow-hidden"
                >
                  {/* Image */}
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.title}
                    onClick={() => navigate(`/image/${image._id}`)}
                    className="w-full h-full object-cover group-hover:brightness-110 transition duration-300"
                  />

                  {/* Trending Badge */}
                  {image.isTrending && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-block rounded-full bg-amber-400 px-2 py-1 text-xs font-semibold text-gray-900">
                        🔥 Trending
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex flex-col items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                    {/* Top: Price and Uploader */}
                    <div className="flex flex-col gap-2 w-full">
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
                      {image.sellerId?.name && (
                        <div className="flex items-center gap-2 bg-white/90 rounded-md px-2 py-1.5 w-full">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {image.sellerId?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {image.sellerId.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/image/${image._id}`);
                        }}
                        className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                        title="View"
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
                          <circle cx="12" cy="12" r="4"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
              <p className="text-gray-500 text-lg font-medium">
                No images found
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
