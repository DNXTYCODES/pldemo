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
        const response = await fetch(
          `${backendUrl}/api/images/section/editors-choice`,
        );
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
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Editors Choice
          </h2>
          <div className="text-center py-8 text-gray-500">Loading...</div>
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
          Editors Choice
        </h2>
        <p className="text-lg font-medium text-gray-900 mb-8">
          Curated selections from our editorial team
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300 flex flex-col justify-between items-end p-2 opacity-0 group-hover:opacity-100">
                {/* Top: Price */}
                {image.priceEth && (
                  <div className="bg-white rounded-xs px-1.5 py-0.5 self-start">
                    <p className="text-xs font-semibold text-gray-900">
                      {getFormattedPrice(
                        image.priceEth,
                        ethPrice,
                        currencyPreference,
                      )}
                    </p>
                  </div>
                )}

                {/* Bottom: Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 rounded-xs bg-white hover:bg-gray-100"
                    title="Like"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-red-500"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/image/${image._id}`);
                    }}
                    className="p-1 rounded-xs bg-white hover:bg-gray-100"
                    title="View"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-700"
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
