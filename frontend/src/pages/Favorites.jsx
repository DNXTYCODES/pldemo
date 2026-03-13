import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";

const Favorites = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const profileResponse = await fetch(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: token },
        });
        const profileData = await profileResponse.json();

        if (profileData.success && profileData.user.favorites) {
          const favoriteIds = profileData.user.favorites;

          // Fetch full image details for each favorite
          const imagePromises = favoriteIds.map((imageId) =>
            fetch(`${backendUrl}/api/images/${imageId}`)
              .then((res) => res.json())
              .then((data) => (data.success ? data.image : null)),
          );

          const images = await Promise.all(imagePromises);
          setFavorites(images.filter((img) => img !== null));
        } else {
          setError(profileData.message || "Failed to load favorites");
        }
      } catch (err) {
        setError("Error loading favorites: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [backendUrl]);

  const handleRemoveFavorite = async (imageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${backendUrl}/api/images/${imageId}/favorite`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setFavorites(favorites.filter((fav) => fav._id !== imageId));
        alert(data.message || "Removed from favorites");
      } else {
        alert(data.message || "Failed to remove favorite");
      }
    } catch (err) {
      alert("Error removing favorite: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <p className="text-xl">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="mt-12 text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-2xl font-bold mb-4 text-gray-900">
              No Favorites Yet
            </p>
            <p className="text-gray-600 mb-8">
              Add photos to your favorites while browsing
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded font-medium text-white"
            >
              Browse Gallery
            </button>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite._id}
                className="group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-amber-500 transition-colors"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-700 overflow-hidden">
                  <img
                    src={favorite.thumbnailUrl || favorite.imageUrl}
                    alt={favorite.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(favorite._id)}
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    title="Remove from favorites"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate mb-2">
                    {favorite.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {favorite.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4 p-2 bg-gray-700 rounded">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="font-bold text-amber-400">
                      {parseFloat(favorite.priceEth).toFixed(8)} ETH
                    </p>
                    <p className="text-xs text-gray-400">
                      ${parseFloat(favorite.priceUsd).toFixed(2)}
                    </p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => navigate(`/image/${favorite._id}`)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 rounded font-medium text-sm"
                  >
                    View & Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
