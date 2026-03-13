import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import DishLoader from "../components/DishLoader";
import { useSearchParams } from "react-router-dom";

const Explore = () => {
  const { backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dynamicCategories, setDynamicCategories] = useState([
    { value: "all", label: "All Categories" },
  ]);
  const [sortBy, setSortBy] = useState("latest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [ratings, setRatings] = useState(0);

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "trending", label: "Trending" },
    { value: "popular", label: "Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  // Fetch categories from backend and set from query params
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/product/categories`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success && data.categories) {
          const categoryOptions = [
            { value: "all", label: "All Categories" },
            ...data.categories.map((cat) => ({
              value: cat.name,
              label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
            })),
          ];
          setDynamicCategories(categoryOptions);

          // Check if category is in query params
          const categoryParam = searchParams.get("category");
          if (
            categoryParam &&
            categoryOptions.some((cat) => cat.value === categoryParam)
          ) {
            setSelectedCategory(categoryParam);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [backendUrl, searchParams]);

  // Fetch all images
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/product/list`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setImages(data.products);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [backendUrl]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...images];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (image) =>
          image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          image.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          image.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (image) => image.category === selectedCategory
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (image) => image.basePrice >= priceRange[0] && image.basePrice <= priceRange[1]
    );

    // Rating filter
    if (ratings > 0) {
      filtered = filtered.filter(
        (image) => (image.averageRating || 0) >= ratings
      );
    }

    // Sorting
    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "trending":
        filtered.sort((a, b) => (b.trendingCount || 0) - (a.trendingCount || 0));
        break;
      case "popular":
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        break;
    }

    setFilteredImages(filtered);
  }, [images, searchQuery, selectedCategory, priceRange, ratings, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          Explore Our <span className="text-amber-500">Gallery</span>
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mt-4">
          Discover amazing photography from talented artists around the world.
          Search, filter, and find the perfect images for any occasion.
        </p>
      </div>

      {/* Filters Section - Desktop */}
      <div className="hidden lg:block mb-8 bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {dynamicCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseFloat(e.target.value), priceRange[1]])
                }
                className="w-1/2 px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min="0"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseFloat(e.target.value)])
                }
                className="w-1/2 px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Rating
            </label>
            <select
              value={ratings}
              onChange={(e) => setRatings(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="0">All Ratings</option>
              <option value="1">1 Star & Up</option>
              <option value="2">2 Stars & Up</option>
              <option value="3">3 Stars & Up</option>
              <option value="4">4 Stars & Up</option>
              <option value="5">5 Stars Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Section - Mobile */}
      <div className="lg:hidden mb-8 bg-white rounded-lg shadow-sm p-4 space-y-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {dynamicCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Counter */}
      <div className="mb-6 text-center text-sm text-gray-600">
        {loading ? (
          <p>Loading images...</p>
        ) : (
          <p>
            Showing <span className="font-semibold">{filteredImages.length}</span> of{" "}
            <span className="font-semibold">{images.length}</span> images
          </p>
        )}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <DishLoader key={i} />
          ))}
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredImages.map((product) => (
            <ProductItem key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
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
          <p className="text-gray-500 text-lg font-medium">No images found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default Explore;
