import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const FeaturedPhotographers = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPhotographers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/users/featured`);
        const data = await response.json();
        if (data.success) {
          setPhotographers(data.photographers);
        }
      } catch (error) {
        console.error("Error fetching featured photographers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPhotographers();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Featured Photographers
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

  if (photographers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with View All Button */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Featured Photographers
          </h2>
        </div>

        <p className="text-lg font-medium text-gray-900 mb-8">
          Discover exceptional photographers we love
        </p>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {photographers.map((photographer, photographerIndex) => {
            // Get first 4 images for the grid
            const images =
              photographer.ownedImages && photographer.ownedImages.length > 0
                ? photographer.ownedImages.slice(0, 4)
                : [];

            return (
              <div
                key={`${photographer._id || "photographer"}-${photographerIndex}`}
                className="group flex flex-col"
              >
                {/* 2x2 Image Grid Container */}
                <div className="relative mb-8">
                  <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-sm overflow-hidden">
                    {images.length >= 4 ? (
                      images.map((image, idx) => (
                        <div
                          key={`${photographer._id || "photographer"}-${image._id || idx}-${idx}`}
                          className="aspect-square cursor-pointer overflow-hidden bg-gray-200"
                        >
                          <img
                            src={image.thumbnailUrl || image.imageUrl}
                            alt={`${photographer.name} ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:brightness-110 transition duration-300"
                            onClick={() => navigate(`/image/${image._id}`)}
                          />
                        </div>
                      ))
                    ) : (
                      <>
                        {images.map((image, idx) => (
                          <div
                            key={`${photographer._id || "photographer"}-${image._id || idx}-${idx}`}
                            className="aspect-square cursor-pointer overflow-hidden bg-gray-200"
                          >
                            <img
                              src={image.thumbnailUrl || image.imageUrl}
                              alt={`${photographer.name} ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:brightness-110 transition duration-300"
                              onClick={() => navigate(`/image/${image._id}`)}
                            />
                          </div>
                        ))}
                        {/* Placeholder for missing images */}
                        {[...Array(4 - images.length)].map((_, idx) => (
                          <div
                            key={`placeholder-${photographer._id || "photographer"}-${idx}`}
                            className="aspect-square bg-gray-200 flex items-center justify-center"
                          >
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Avatar Badge - Overlapping */}
                  <div className="absolute -bottom-4 left-2 h-16 w-16 rounded-full overflow-hidden border-4 border-white bg-gray-200 shadow-md">
                    <img
                      src={
                        photographer.profilePicture ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${photographer.name}`
                      }
                      alt={photographer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="pt-6 flex flex-col flex-grow">
                  {/* Name and Location */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {photographer.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                    {photographer.location || "Photographer"}
                  </p>

                  {/* View Profile Button */}
                  <button
                    onClick={() => navigate(`/uploader/${photographer._id}`)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-sm hover:bg-gray-800 transition duration-300 mt-auto"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPhotographers;
