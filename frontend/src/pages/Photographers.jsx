import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Photographers = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [photographers, setPhotographers] = useState([]);
  const [filteredPhotographers, setFilteredPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("featured");

  // Fetch all photographers
  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/users/all`);
        const data = await response.json();
        if (data.success) {
          setPhotographers(data.photographers);
        }
      } catch (error) {
        console.error("Error fetching photographers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, [backendUrl]);

  // Filter and sort photographers
  useEffect(() => {
    let filtered = [...photographers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (photographer) =>
          photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (photographer.location &&
            photographer.location
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortType) {
      case "a-z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "images":
        filtered.sort(
          (a, b) =>
            (b.ownedImages?.length || 0) - (a.ownedImages?.length || 0)
        );
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          // Featured photographers first
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          return 0;
        });
        break;
    }

    setFilteredPhotographers(filtered);
  }, [photographers, searchTerm, sortType]);

  if (loading) {
    return (
      <div className="min-h-screen pt-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Our Photographers
          </h1>
          <p className="text-gray-600 mb-8">
            Discover the talented photographers on our platform
          </p>
          <div className="text-center py-16 text-gray-500">
            Loading photographers...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Our Photographers
          </h1>
          <p className="text-gray-600">
            Discover the talented photographers on our platform
          </p>
        </div>

        {/* Search and Sort Section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          {/* Sort Dropdown */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="featured">Featured First</option>
            <option value="a-z">Name: A-Z</option>
            <option value="z-a">Name: Z-A</option>
            <option value="images">Most Images</option>
          </select>
        </div>

        {/* Result Count */}
        <p className="text-sm text-gray-600 mb-6">
          {filteredPhotographers.length} photographer
          {filteredPhotographers.length !== 1 ? "s" : ""} found
        </p>

        {/* Photographers Vertical Feed */}
        {filteredPhotographers.length > 0 ? (
          <div className="space-y-6">
            {filteredPhotographers.map((photographer) => {
              // Get first 4 images for the grid
              const images =
                photographer.ownedImages && photographer.ownedImages.length > 0
                  ? photographer.ownedImages.slice(0, 4)
                  : [];

              return (
                <div
                  key={photographer._id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-6 p-6">
                    {/* Left: Avatar and Info */}
                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                      {/* Avatar */}
                      <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-gray-200 mb-4 flex-shrink-0">
                        <img
                          src={
                            photographer.profilePicture ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${photographer.name}`
                          }
                          alt={photographer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Name, Location, Stats */}
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {photographer.name}
                      </h3>
                      {photographer.location && (
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {photographer.location}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        {photographer.ownedImages && (
                          <div>
                            <span className="font-semibold text-gray-900">
                              {photographer.ownedImages.length}
                            </span>{" "}
                            image{photographer.ownedImages.length !== 1 ? "s" : ""}
                          </div>
                        )}
                        {photographer.expertise_level && (
                          <div>
                            <span className="font-semibold text-gray-900 capitalize">
                              {photographer.expertise_level}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {photographer.isFeatured && (
                        <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                          ⭐ Featured
                        </span>
                      )}

                      {/* View Profile Button */}
                      <button
                        onClick={() => navigate(`/uploader/${photographer._id}`)}
                        className="w-full px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition duration-300"
                      >
                        View Profile
                      </button>
                    </div>

                    {/* Right: 2x2 Image Grid */}
                    {images.length > 0 && (
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 gap-3">
                          {images.map((image, idx) => (
                            <div
                              key={image._id}
                              className="aspect-square cursor-pointer overflow-hidden bg-gray-200 rounded-lg hover:opacity-80 transition"
                            >
                              <img
                                src={image.thumbnailUrl || image.imageUrl}
                                alt={`${photographer.name} ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                onClick={() => navigate(`/image/${image._id}`)}
                              />
                            </div>
                          ))}
                          {/* Placeholder for missing images */}
                          {[...Array(Math.max(0, 4 - images.length))].map(
                            (_, idx) => (
                              <div
                                key={`placeholder-${idx}`}
                                className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                              >
                                <span className="text-gray-400 text-xs">
                                  No image
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>
              {searchTerm
                ? "No photographers found matching your search."
                : "No photographers available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Photographers;
