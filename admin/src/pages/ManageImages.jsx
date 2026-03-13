import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const ManageImages = ({ token }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingImageId, setSavingImageId] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
  });

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

  // Handle delete image
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      setDeletingImageId(imageId);
      const response = await axios.delete(
        `${backendUrl}/api/images/${imageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setImages((prevImages) =>
          prevImages.filter((img) => img._id !== imageId),
        );
        setError("");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image");
    } finally {
      setDeletingImageId(null);
    }
  };

  // Handle edit image
  const startEditImage = (image) => {
    setEditingImageId(image._id);
    setEditFormData({
      title: image.title,
      description: image.description || "",
    });
  };

  const handleSaveEdit = async (imageId) => {
    try {
      setSavingImageId(imageId);
      const response = await axios.put(
        `${backendUrl}/api/images/${imageId}`,
        {
          title: editFormData.title,
          description: editFormData.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setImages((prevImages) =>
          prevImages.map((img) =>
            img._id === imageId
              ? {
                  ...img,
                  title: editFormData.title,
                  description: editFormData.description,
                }
              : img,
          ),
        );
        setEditingImageId(null);
        setError("");
      }
    } catch (err) {
      console.error("Error updating image:", err);
      setError("Failed to update image");
    } finally {
      setSavingImageId(null);
    }
  };

  // Filter images based on search
  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.sellerId?.name &&
        img.sellerId.name.toLowerCase().includes(searchTerm.toLowerCase())),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Images
          </h1>
          <p className="text-gray-600">
            Edit, delete, or assign images to home page sections (Trending, Popular, Editor's
            Pick)
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
          <div className="mb-4 rounded bg-red-50 p-4 text-red-600">{error}</div>
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
                      📌 Editor's Pick
                    </span>
                  )}
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                {editingImageId === image._id ? (
                  <div className="space-y-3 mb-3">
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="Title"
                    />
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="Description"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(image._id)}
                        disabled={savingImageId === image._id}
                        className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingImageId(null)}
                        className="flex-1 rounded bg-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="mb-1 truncate font-semibold text-gray-900">
                      {image.title}
                    </h3>
                    <p className="mb-3 text-sm text-gray-600">
                      By {image.sellerId?.name || "Unknown"}
                    </p>
                    <p className="mb-3 text-sm font-medium text-gray-900">
                      Ξ {image.priceEth} / ${image.priceUsd}
                    </p>
                  </>
                )}

                {/* Section Checkboxes */}
                {editingImageId !== image._id && (
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={image.isTrending || false}
                        onChange={() =>
                          handleSectionToggle(
                            image._id,
                            "trending",
                            image.isTrending,
                          )
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
                          handleSectionToggle(
                            image._id,
                            "popular",
                            image.isPopular,
                          )
                        }
                        disabled={savingImageId === image._id}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        Popular Photos
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={image.isAmbassadorsPick || false}
                        onChange={() =>
                          handleSectionToggle(
                            image._id,
                            "ambassadors-pick",
                            image.isAmbassadorsPick,
                          )
                        }
                        disabled={savingImageId === image._id}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        📌 Editor's Pick
                      </span>
                    </label>
                  </div>
                )}

                {/* Action Buttons */}
                {editingImageId !== image._id && (
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => startEditImage(image)}
                      className="flex-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      disabled={deletingImageId === image._id}
                      className="flex-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:bg-gray-300 disabled:text-gray-600"
                    >
                      {deletingImageId === image._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}

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
              {searchTerm
                ? "No images found matching your search"
                : "No images available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageImages;
