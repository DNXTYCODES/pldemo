import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const MySales = () => {
  const { navigate, backendUrl, ethPrice } = useContext(ShopContext);
  const [images, setImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(false);
  const [error, setError] = useState("");
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    const fetchMyImages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${backendUrl}/api/images/user/my-images`, {
          headers: { Authorization: token },
        });
        const data = await response.json();

        if (data.success) {
          setImages(data.images);
        } else {
          setError(data.message || "Failed to load images");
        }
      } catch (err) {
        setError("Error loading images: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyImages();
  }, [backendUrl]);

  useEffect(() => {
    const fetchPendingImages = async () => {
      try {
        setLoadingPending(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${backendUrl}/api/images/user/pending`, {
          headers: { Authorization: token },
        });
        const data = await response.json();

        if (data.success) {
          setPendingImages(data.uploads || []);
        }
      } catch (err) {
        console.error("Error loading pending uploads:", err);
      } finally {
        setLoadingPending(false);
      }
    };

    fetchPendingImages();
  }, [backendUrl]);

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      const data = await response.json();

      if (data.success) {
        setImages(images.filter((img) => img._id !== imageId));
      } else {
        alert(data.message || "Failed to delete image");
      }
    } catch (err) {
      alert("Error deleting image: " + err.message);
    }
  };

  const handleUpdatePrice = async (imageId) => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/images/${imageId}/price`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ priceEth: newPrice }),
      });

      const data = await response.json();

      if (data.success) {
        setImages(
          images.map((img) =>
            img._id === imageId
              ? {
                  ...img,
                  priceEth: newPrice,
                  priceUsd: (parseFloat(newPrice) * ethPrice).toFixed(2),
                }
              : img,
          ),
        );
        setEditingPrice(null);
        setNewPrice("");
      } else {
        alert(data.message || "Failed to update price");
      }
    } catch (err) {
      alert("Error updating price: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <p className="text-xl">Loading your images...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-4 mt-8 mb-6 border-b border-gray-700">
          <button
            onClick={() => setShowPending(false)}
            className={`px-6 py-3 font-semibold transition ${
              !showPending
                ? "border-b-2 border-amber-500 text-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Active Sales ({images.length})
          </button>
          <button
            onClick={() => setShowPending(true)}
            className={`px-6 py-3 font-semibold transition relative ${
              showPending
                ? "border-b-2 border-amber-500 text-amber-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Pending Approval
            {pendingImages.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                {pendingImages.length}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        {!showPending ? (
          <>
            {images.length === 0 ? (
              <div className="mt-12 text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-2xl font-bold mb-4 text-gray-900">
                  No Images Yet
                </p>
                <p className="text-gray-600 mb-8">
                  Start selling your photos by uploading images
                </p>
                <button
                  onClick={() => navigate("/upload-photo")}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded font-medium text-white"
                >
                  Upload Your First Photo
                </button>
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div
                    key={image._id}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-amber-500 transition-colors"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium ${
                          image.status === "active"
                            ? "bg-green-100 text-green-800"
                            : image.approvalStatus === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {image.approvalStatus === "declined"
                          ? "Upload Declined"
                          : image.status.charAt(0).toUpperCase() + image.status.slice(1)}
                      </span>
                    </div>

                    {/* Image Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 truncate text-gray-900">
                        {image.title}
                      </h3>



                      {/* Price */}
                      {editingPrice === image._id ? (
                        <div className="mb-4 flex gap-2">
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="New price (ETH)"
                            step="0.001"
                            min="0"
                            className="flex-1 px-2 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => handleUpdatePrice(image._id)}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPrice(null)}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded border border-amber-200">
                          <p className="text-sm text-gray-600 mb-1">
                            Current Price
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-amber-600">
                                {parseFloat(image.priceEth).toFixed(8)} ETH
                              </p>
                              <p className="text-xs text-gray-500">
                                ${parseFloat(image.priceUsd).toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingPrice(image._id);
                                setNewPrice(image.priceEth);
                              }}
                              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/image/${image._id}`)}
                          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image._id)}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded text-sm font-medium text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => navigate("/upload-photo")}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded font-medium text-white"
                >
                  Upload Another Photo
                </button>
              </div>
            )}
          </>
        ) : (
          <div>
            {loadingPending ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading pending uploads...</p>
              </div>
            ) : pendingImages.length === 0 ? (
              <div className="mt-12 text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-2xl font-bold mb-4 text-gray-900">
                  No Pending Uploads
                </p>
                <p className="text-gray-600 mb-8">
                  All your uploads have been processed
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {pendingImages.map((image) => (
                  <div
                    key={image._id}
                    className="p-6 bg-white border border-amber-300 rounded-lg hover:border-amber-400 transition-colors"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {/* Image Thumbnail */}
                      <div>
                        <img
                          src={image.thumbnailUrl || image.imageUrl}
                          alt={image.title}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>

                      {/* Details */}
                      <div className="col-span-2">
                        <h3 className="text-lg font-bold mb-2 text-amber-400">
                          {image.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {image.description || "No description"}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Category:</span>{" "}
                            <span className="text-white">{image.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Price:</span>{" "}
                            <span className="text-white">
                              {image.priceEth} ETH
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>{" "}
                            <span className="text-yellow-400 font-medium">
                              Pending Review
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Gas Fee:</span>{" "}
                            <span className="text-amber-300 font-medium">
                              {image.gasFee} ETH (will be deducted upon
                              approval)
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">Uploaded:</span>{" "}
                            <span className="text-white">
                              {new Date(image.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-600 rounded-full opacity-20 blur-lg"></div>
                          <svg
                            className="relative w-16 h-16 text-yellow-500 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="mt-3 text-center text-sm text-gray-400">
                          Admin review in progress
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySales;
