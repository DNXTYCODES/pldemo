import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const MyPurchases = () => {
  const { navigate } = useContext(ShopContext);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentEthPrice, setCurrentEthPrice] = useState(0);

  useEffect(() => {
    // Fetch ETH price
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.ethereum && data.ethereum.usd) {
          setCurrentEthPrice(data.ethereum.usd);
        } else {
          setCurrentEthPrice(3000);
        }
      } catch (err) {
        console.error("Error fetching ETH price:", err);
        setCurrentEthPrice(3000);
      }
    };

    fetchEthPrice();
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("/api/purchases/history", {
          headers: { Authorization: token },
        });
        const data = await response.json();

        if (data.success) {
          setPurchases(data.purchases);
        } else {
          setError(data.message || "Failed to load purchases");
        }
      } catch (err) {
        setError("Error loading purchases: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <p className="text-xl">Loading your purchases...</p>
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

        {purchases.length === 0 ? (
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-2xl font-bold mb-4 text-gray-900">No Purchases Yet</p>
            <p className="text-gray-600 mb-8">
              Start exploring and buying amazing photos
            </p>
            <button
              onClick={() => navigate("/collection")}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded font-medium"
            >
              Browse Gallery
            </button>
          </div>
        ) : (
          <div className="mt-12 space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-amber-500 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  {/* Image Info */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    {purchase.imageId?.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={purchase.imageId.imageUrl}
                          alt={purchase.imageId.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">
                        {purchase.imageId?.title || "Unknown Image"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        by {purchase.sellerId?.name || "Unknown Artist"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Price Paid</p>
                    <p className="font-bold text-amber-400">
                      {parseFloat(purchase.amountEth).toFixed(8)} ETH
                    </p>
                    <p className="text-sm text-gray-400">
                      ${parseFloat(purchase.amountUsd).toFixed(2)}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() =>
                      navigate(`/product/${purchase.imageId?._id}`)
                    }
                    className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-sm"
                  >
                    View
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

export default MyPurchases;
