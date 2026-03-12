import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const ManagePhotographers = ({ token }) => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingPhotographerId, setSavingPhotographerId] = useState(null);

  // Fetch all photographers for admin
  const fetchPhotographersForAdmin = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/users/admin/photographers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Photographers response:", response.data);
      if (response.data.success) {
        setPhotographers(response.data.photographers);
      } else {
        setError(response.data.message || "Failed to load photographers");
      }
    } catch (err) {
      console.error("Error fetching photographers:", err);
      setError(err.response?.data?.message || "Failed to load photographers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographersForAdmin();
  }, [token]);

  // Handle featured toggle
  const handleFeaturedToggle = async (userId, currentStatus) => {
    try {
      setSavingPhotographerId(userId);
      const response = await axios.put(
        `${backendUrl}/api/users/admin/${userId}/featured`,
        {
          isFeatured: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        // Update local state
        setPhotographers((prevPhotographers) =>
          prevPhotographers.map((photographer) =>
            photographer._id === userId
              ? {
                  ...photographer,
                  isFeatured: !currentStatus,
                }
              : photographer,
          ),
        );
      }
    } catch (err) {
      console.error("Error updating featured status:", err);
      setError("Failed to update featured status");
    } finally {
      setSavingPhotographerId(null);
    }
  };

  // Filter photographers based on search
  const filteredPhotographers = photographers.filter(
    (photographer) =>
      photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photographer.location &&
        photographer.location.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading photographers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Photographers
          </h1>
          <p className="text-gray-600">
            Select photographers to feature on the home page
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search photographers by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {/* Photographers Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPhotographers.map((photographer) => (
            <div
              key={photographer._id}
              className="overflow-hidden rounded border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Avatar */}
              <div className="relative overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
                <img
                  src={
                    photographer.profilePicture ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${photographer.name}`
                  }
                  alt={photographer.name}
                  className="h-32 w-32 rounded-full object-cover"
                />
                {photographer.isFeatured && (
                  <div className="absolute right-2 top-2">
                    <span className="inline-block rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-gray-900">
                      ⭐ Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Photographer Info */}
              <div className="p-4">
                <h3 className="mb-1 truncate font-semibold text-gray-900">
                  {photographer.name}
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  {photographer.location || "No location"}
                </p>

                {/* Image Count */}
                <p className="mb-4 text-sm text-gray-600">
                  {photographer.ownedImages?.length || 0} images
                </p>

                {/* Featured Toggle */}
                <button
                  onClick={() =>
                    handleFeaturedToggle(
                      photographer._id,
                      photographer.isFeatured,
                    )
                  }
                  disabled={savingPhotographerId === photographer._id}
                  className={`w-full rounded py-2 px-3 text-sm font-medium transition-colors ${
                    photographer.isFeatured
                      ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } ${savingPhotographerId === photographer._id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {savingPhotographerId === photographer._id
                    ? "Saving..."
                    : photographer.isFeatured
                      ? "⭐ Remove from Featured"
                      : "Add to Featured"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPhotographers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No photographers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePhotographers;
