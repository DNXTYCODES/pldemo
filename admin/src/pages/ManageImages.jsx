import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import AdminPageGuide from "../components/AdminPageGuide";

const ManageImages = ({ token }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingImageId, setSavingImageId] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    priceEth: "",
    category: "",
    tags: "",
    usageRights: "personal_use",
    licenseType: "non-exclusive",
    sellerId: "",
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

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/users/admin/all-users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.data.success) {
          setUsers(response.data.users || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categories/image`);
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchUsers();
    fetchCategories();
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
        `${backendUrl}/api/images/admin/${imageId}`,
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
    // Find the matching category from available categories (case-insensitive match)
    const matchingCategory = categories.length > 0
      ? categories.find(
          (cat) => cat.toLowerCase().trim() === (image.category || "").toLowerCase().trim()
        )
      : null;

    setEditingImageId(image._id);
    setEditFormData({
      title: image.title,
      description: image.description || "",
      priceEth: image.priceEth || "",
      category: matchingCategory || image.category || "",
      tags: Array.isArray(image.tags)
        ? image.tags.join(", ")
        : image.tags || "",
      usageRights: image.usageRights || "personal_use",
      licenseType: image.licenseType || "non-exclusive",
      sellerId: image.sellerId?._id || image.sellerId || "",
    });
  };

  const handleSaveEdit = async (imageId) => {
    // Validate required fields
    if (!editFormData.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editFormData.priceEth?.trim()) {
      toast.error("Price is required");
      return;
    }
    if (!editFormData.category?.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!editFormData.sellerId?.trim()) {
      toast.error("Owner is required");
      return;
    }

    try {
      setSavingImageId(imageId);
      const response = await axios.put(
        `${backendUrl}/api/images/admin/${imageId}`,
        {
          title: editFormData.title,
          description: editFormData.description,
          priceEth: editFormData.priceEth,
          category: editFormData.category,
          tags: editFormData.tags,
          usageRights: editFormData.usageRights,
          licenseType: editFormData.licenseType,
          sellerId: editFormData.sellerId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        const newOwner = users.find(
          (user) => user._id === editFormData.sellerId,
        );
        setImages((prevImages) =>
          prevImages.map((img) =>
            img._id === imageId
              ? {
                  ...img,
                  title: editFormData.title,
                  description: editFormData.description,
                  priceEth: editFormData.priceEth,
                  category: editFormData.category,
                  tags: editFormData.tags
                    ? editFormData.tags.split(",").map((tag) => tag.trim())
                    : [],
                  usageRights: editFormData.usageRights,
                  licenseType: editFormData.licenseType,
                  sellerId: newOwner || img.sellerId,
                }
              : img,
          ),
        );
        setEditingImageId(null);
        setError("");
        toast.success("Image updated successfully");
      }
    } catch (err) {
      console.error("Error updating image:", err);
      setError("Failed to update image");
      toast.error("Failed to update image");
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
            Edit, delete, or assign images to home page sections (Trending,
            Popular, Editor's Pick)
          </p>
        </div>

        <AdminPageGuide
          title="Manage Images overview"
          overview="Review and maintain all uploaded images. Update metadata, delete undesirable images, and assign images to featured homepage sections like Trending, Popular, Editor's Pick, and Ambassador's Pick."
          modalTitle="Manage Images Guide"
          sections={[
            {
              heading: "Image management",
              content:
                "Use this page to review every uploaded image, edit titles and descriptions, and remove images that should not remain on the platform.",
            },
            {
              heading: "Homepage section assignment",
              content:
                "Toggle assignments for each image to place it in promoted sections such as Trending, Popular, Editor's Pick, and Ambassador's Pick.",
            },
            {
              heading: "Search and review",
              content:
                "Search by image title or photographer name to quickly find the image you need to update.",
            },
          ]}
        />

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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm text-gray-700">
                        Price (ETH)
                        <input
                          type="number"
                          step="0.0001"
                          value={editFormData.priceEth}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              priceEth: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Category
                        <select
                          value={editFormData.category}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              category: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block text-sm text-gray-700">
                      Tags (comma separated)
                      <input
                        type="text"
                        value={editFormData.tags}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            tags: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm text-gray-700">
                        Usage Rights
                        <select
                          value={editFormData.usageRights}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              usageRights: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="personal_use">Personal Use</option>
                          <option value="commercial_use">Commercial Use</option>
                          <option value="both">Personal + Commercial</option>
                        </select>
                      </label>

                      <label className="block text-sm text-gray-700">
                        License Type
                        <select
                          value={editFormData.licenseType}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              licenseType: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="non-exclusive">Non-exclusive</option>
                          <option value="exclusive">Exclusive</option>
                        </select>
                      </label>
                    </div>

                    <label className="block text-sm text-gray-700">
                      Owner
                      <select
                        value={editFormData.sellerId}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            sellerId: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="">Select owner</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} -{" "}
                            {user.photography_specialty?.join(", ") ||
                              "No specialty"}
                          </option>
                        ))}
                      </select>
                    </label>

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
