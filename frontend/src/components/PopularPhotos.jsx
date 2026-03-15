import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { getFormattedPrice } from "../utils/ethPrice";
import { toast } from "react-toastify";

const PopularPhotos = () => {
  const { backendUrl, currencyPreference, ethPrice, token } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${backendUrl}/api/images/section/popular`,
        );
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching popular photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPhotos();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Popular Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 aspect-square rounded-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Popular Photos
        </h2>
        <p className="text-lg font-medium text-gray-900 mb-8">
          Trending images with the highest ratings
        </p>

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

              {/* Editor's Pick Badge */}
              {image.isAmbassadorsPick && (
                <div className="absolute top-2 right-2">
                  <span className="inline-block rounded-full bg-yellow-400 px-2 py-1 text-xs font-semibold text-gray-900">
                    📌 Editor's Pick
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
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularPhotos;
