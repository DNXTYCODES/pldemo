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
  const [isFavourite, setIsFavourite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch image details
  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/images/${imageId}`);
        const data = await response.json();

        if (data.success) {
          setImageData(data.image);
          setIsFavourite(data.image.isFavourite || false);

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

  const handleFavourite = async () => {
    if (!token) {
      toast.error("Please log in to favourite images");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/images/${imageId}/favourite`,
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
        setIsFavourite(!isFavourite);
        toast.success(
          isFavourite ? "Removed from favourites" : "Added to favourites",
        );
      } else {
        toast.error(data.message || "Failed to update favourite");
      }
    } catch (error) {
      console.error("Error updating favourite:", error);
      toast.error("Failed to update favourite");
    }
  };

  const handleReport = async () => {
    if (!token) {
      toast.error("Please log in to report images");
      navigate("/login");
      return;
    }

    const reason = prompt(
      "Please describe the reason for reporting this image:",
    );
    if (!reason) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/images/${imageId}/report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Image reported successfully");
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
              {/* Favorite Button */}
              <button
                onClick={handleFavourite}
                className={`p-3 rounded-lg transition ${
                  isFavourite
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Add to Favourite"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={isFavourite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

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
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
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
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
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

                {/* Upload Date */}
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>
                    {new Date(imageData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Section - Compact 500px Style */}
            <div className="border-b border-gray-200 py-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Favorites Stat */}
                <div className="flex flex-col items-center text-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-red-500 mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <p className="text-sm font-bold text-gray-900">
                    {imageData.favouriteCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">Likes</p>
                </div>

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
                    {imageData.viewCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">Views</p>
                </div>

                {/* Downloads Stat */}
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <p className="text-sm font-bold text-gray-900">
                    {imageData.downloadCount || 0}
                  </p>
                  <p className="text-xs text-gray-600">Downloads</p>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {uploaderInfo.name?.charAt(0).toUpperCase()}
                    </span>
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
                        📍 {uploaderInfo.location}
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
                          handleFavourite();
                        }}
                        className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                        title="Like"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
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
                          handleFavourite();
                        }}
                        className="p-1.5 rounded bg-white/90 hover:bg-white transition"
                        title="Like"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
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
        )}
      </div>
    </div>
  );
};

export default ImageDetail;
