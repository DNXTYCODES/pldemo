import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { getFormattedPrice } from "../utils/ethPrice";
import { toast } from "react-toastify";

const ImageDetail = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token, currencyPreference, ethPrice } =
    useContext(ShopContext);

  const [imageData, setImageData] = useState(null);
  const [relatedImages, setRelatedImages] = useState([]);
  const [uploaderInfo, setUploaderInfo] = useState(null);
  const [uploaderOtherImages, setUploaderOtherImages] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Fetch image details
  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/images/${imageId}`);
        const data = await response.json();

        if (data.success) {
          // First, add fake views to boost social proof
          try {
            await fetch(`${backendUrl}/api/images/${imageId}/fake-views`, {
              method: "POST",
            });
            // After adding fake views, fetch the updated image data
            const updatedResponse = await fetch(`${backendUrl}/api/images/${imageId}`);
            const updatedData = await updatedResponse.json();
            if (updatedData.success) {
              setImageData(updatedData.image);
            } else {
              setImageData(data.image);
            }
          } catch (error) {
            // If fake views fail, just use the original data
            console.log("Note: Could not add fake views");
            setImageData(data.image);
          }

          // Fetch related images (same category)
          const relatedResponse = await fetch(
            `${backendUrl}/api/images/search?category=${data.image.category}&limit=5`,
          );
          const relatedData = await relatedResponse.json();
          if (relatedData.success) {
            setRelatedImages(
              relatedData.images.filter((img) => img._id !== imageId),
            );
          }

          // Fetch uploader info and their other images
          if (data.image.sellerId) {
            setUploaderInfo(data.image.sellerId);

            const uploaderImagesResponse = await fetch(
              `${backendUrl}/api/images/search?sellerId=${data.image.sellerId._id}&limit=6`,
            );
            const uploaderImagesData = await uploaderImagesResponse.json();
            if (uploaderImagesData.success) {
              setUploaderOtherImages(
                uploaderImagesData.images.filter((img) => img._id !== imageId),
              );
            }
          }
        } else {
          toast.error("Image not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching image details:", error);
        toast.error("Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    fetchImageDetails();
  }, [imageId, backendUrl, navigate]);

  const handleReport = () => {
    if (!token) {
      toast.error("Please log in to report images");
      navigate("/login");
      return;
    }
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/images/${imageId}/report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reportReason }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Image reported successfully");
        setShowReportModal(false);
        setReportReason("");
      } else {
        toast.error(data.message || "Failed to report image");
      }
    } catch (error) {
      console.error("Error reporting image:", error);
      toast.error("Failed to report image");
    }
  };

  const handleBuyRequest = async () => {
    if (!token) {
      toast.error("Please log in to request purchase");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/images/${imageId}/buy-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Purchase request sent to uploader");
      } else {
        toast.error(data.message || "Failed to send purchase request");
      }
    } catch (error) {
      console.error("Error sending purchase request:", error);
      toast.error("Failed to send purchase request");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading image...</div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Image not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:opacity-70 z-10"
            onClick={() => setIsFullscreen(false)}
          >
            ✕
          </button>
          <img
            src={imageData.imageUrl}
            alt={imageData.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Image Section - Left Side */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer relative group"
              onClick={() => setIsFullscreen(true)}
            >
              <img
                src={imageData.imageUrl}
                alt={imageData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-sm font-medium">
                  View Fullscreen
                </span>
              </div>
            </div>

            {/* Icon Action Buttons */}
            <div className="flex gap-3 mt-4 justify-center px-2">
              {/* Buy Request Button */}
              <button
                onClick={handleBuyRequest}
                className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                title="Request to Buy"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>

              {/* Report Button */}
              <button
                onClick={handleReport}
                className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                title="Report Image"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Right Sidebar - Info Section */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Title & Description Box - Compact 500px Style */}
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {imageData.title}
              </h1>
              {imageData.description && (
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {imageData.description}
                  </p>
                </div>
              )}

              {/* Metadata Section - Compact Grid */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
                {/* Location */}
                {imageData.location && (
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{imageData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Section - Compact 500px Style */}
            <div className="border-b border-gray-200 py-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Views Stat */}
                <div className="flex flex-col items-center text-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-700 mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <p className="text-sm font-bold text-gray-900">
                    {imageData.views || 0}
                  </p>
                  <p className="text-xs text-gray-600">Views</p>
                </div>
              </div>
            </div>

            {/* Price Section - Compact 500px Style */}
            <div className="border-b border-gray-200 py-4">
              <h3 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                Price
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  {currencyPreference === "eth" ? (
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {getFormattedPrice(imageData.priceEth, ethPrice, "eth")}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        ≈{" "}
                        {getFormattedPrice(imageData.priceEth, ethPrice, "usd")}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {getFormattedPrice(imageData.priceEth, ethPrice, "usd")}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        ≈{" "}
                        {getFormattedPrice(imageData.priceEth, ethPrice, "eth")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category & Tags - Compact Style */}
            {(imageData.category || imageData.tags?.length > 0) && (
              <div className="border-b border-gray-200 py-4">
                <h3 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                  Details
                </h3>
                <div className="flex flex-wrap gap-2">
                  {imageData.category && (
                    <span className="inline-block bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">
                      {imageData.category}
                    </span>
                  )}
                  {imageData.tags &&
                    imageData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Uploader Section - Compact 500px Style */}
            {uploaderInfo && (
              <div className="py-4">
                <h3 className="text-xs font-semibold text-gray-700 uppercase mb-3">
                  Photographer
                </h3>
                <div
                  className="flex items-start gap-3 cursor-pointer hover:opacity-70 transition"
                  onClick={() => navigate(`/uploader/${uploaderInfo._id}`)}
                >
                  <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
                    {uploaderInfo.profilePicture ? (
                      <img
                        src={`${uploaderInfo.profilePicture}?w=100&h=100&c_fill&q_60`}
                        alt={uploaderInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {uploaderInfo.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
                      {uploaderInfo.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {uploaderInfo.expertiseLevel || "Photographer"}
                    </p>
                    {uploaderInfo.location && (
                      <p className="text-xs text-gray-600">
                        {uploaderInfo.location}
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/uploader/${uploaderInfo._id}`);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-2"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Images - 500px Style */}
        {relatedImages.length > 0 && (
          <div className="border-t pt-8 mb-12">
            <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase">
              Similar photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {relatedImages.map((image) => (
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
                    {/* Like & Menu Icons */}
                    <div className="flex gap-2">
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
        )}

        {/* Uploader's Other Images - 500px Style */}
        {uploaderOtherImages.length > 0 && (
          <div className="border-t pt-8 mb-12">
            <div className="flex justify-between items-baseline mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">
                More from {uploaderInfo?.name}
              </h3>
              <button
                onClick={() => navigate(`/uploader/${uploaderInfo._id}`)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {uploaderOtherImages.map((image) => (
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
                    {/* Price & Uploader Info */}
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
                      {/* Category Badge */}
                      <div className="bg-white/90 rounded-md px-2 py-1 w-full">
                        <span className="text-xs font-medium text-gray-900">
                          {image.category || "Photo"}
                        </span>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
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
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Report Image
                </h2>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please describe the reason for reporting this image
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Enter your reason here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows="4"
                />
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-lg">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm"
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetail;
