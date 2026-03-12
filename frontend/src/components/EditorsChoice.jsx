import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { getFormattedPrice } from "../utils/ethPrice";

const EditorsChoice = () => {
  const { backendUrl, currencyPreference, ethPrice } = useContext(ShopContext);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEditorsChoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/images/section/editors-choice`);
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching editors choice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditorsChoice();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editors Choice</h1>
          <div className="mt-8 text-center text-gray-500">
            Loading photos...
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Editors Choice
        </h2>
        <p className="text-lg font-medium text-gray-900 mb-8">
          Curated selections from our editorial team
        </p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
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

              {/* Ambassador's Pick Badge */}
              {image.isAmbassadorsPick && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                    🏆 Pick
                  </span>
                </div>
              )}

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
                        {image.sellerId?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {image.sellerId?.name || "Unknown"}
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => e.stopPropagation()}
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
    </div>
  );
};

export default EditorsChoice;
