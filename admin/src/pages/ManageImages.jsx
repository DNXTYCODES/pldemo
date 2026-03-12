import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const ManageImages = ({ token }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingImageId, setSavingImageId] = useState(null);

  // Fetch all images for admin
  const fetchImagesForAdmin = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/images/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setImages(response.data.images);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesForAdmin();
  }, [token]);

  // Handle section toggle
  const handleSectionToggle = async (imageId, section, currentStatus) => {
    try {
      setSavingImageId(imageId);
      const response = await axios.put(
        `${backendUrl}/api/images/${imageId}/sections`,
        {
          section,
          assigned: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        // Update local state
        setImages((prevImages) =>
          prevImages.map((img) =>
            img._id === imageId
              ? {
                  ...img,
                  [section === "trending"
                    ? "isTrending"
                    : section === "popular"
                      ? "isPopular"
                      : section === "editors-choice"
                        ? "isEditorsChoice"
                        : "isAmbassadorsPick"]: !currentStatus,
                }
              : img,
          ),
        );
      }
    } catch (err) {
      console.error("Error updating section:", err);
      setError("Failed to update section assignment");
    } finally {
      setSavingImageId(null);
    }
  };

  // Filter images based on search
  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.sellerId?.name && img.sellerId.name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Images</h1>
          <p className="text-gray-600">
            Assign images to home page sections (Trending, Popular, Editors Choice, Ambassadors Pick)
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search images by title or photographer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Images Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => (
            <div
              key={image._id}
              className="overflow-hidden rounded border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative overflow-hidden bg-gray-100">
                <img
                  src={image.imageUrl || image.thumbnailUrl}
                  alt={image.title}
                  className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute right-2 top-2">
                  {image.isAmbassadorsPick && (
                    <span className="inline-block rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-gray-900">
                      🏆 Ambassador's Pick
                    </span>
                  )}
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                <h3 className="mb-1 truncate font-semibold text-gray-900">
                  {image.title}
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  By {image.sellerId?.name || "Unknown"}
                </p>
                <p className="mb-3 text-sm font-medium text-gray-900">
                  Ξ {image.priceEth} / ${image.priceUsd}
                </p>

                {/* Section Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={image.isTrending || false}
                      onChange={() =>
                        handleSectionToggle(image._id, "trending", image.isTrending)
                      }
                      disabled={savingImageId === image._id}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Trending</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={image.isPopular || false}
                      onChange={() =>
                        handleSectionToggle(image._id, "popular", image.isPopular)
                      }
                      disabled={savingImageId === image._id}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Popular Photos</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={image.isEditorsChoice || false}
                      onChange={() =>
                        handleSectionToggle(image._id, "editors-choice", image.isEditorsChoice)
                      }
                      disabled={savingImageId === image._id}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Editors Choice</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={image.isAmbassadorsPick || false}
                      onChange={() =>
                        handleSectionToggle(image._id, "ambassadors-pick", image.isAmbassadorsPick)
                      }
                      disabled={savingImageId === image._id}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">🏆 Ambassadors Pick</span>
                  </label>
                </div>

                {/* Saving Indicator */}
                {savingImageId === image._id && (
                  <div className="mt-2 text-xs text-blue-600">Saving...</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && !loading && (
          <div className="rounded border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? "No images found matching your search" : "No images available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageImages;
