import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Profile = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentEthPrice, setCurrentEthPrice] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

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
        setCurrentEthPrice(3000); // Fallback price
      }
    };

    fetchEthPrice();
  }, []);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        console.log("=== PROFILE PAGE LOADING ===");
        console.log("Token exists:", !!token);
        console.log(
          "Token value:",
          token ? token.substring(0, 20) + "..." : "NO TOKEN",
        );

        if (!token) {
          setError("No authentication token found. Please login first.");
          setLoading(false);
          return;
        }

        // Fetch profile
        console.log(
          "Fetching profile from " + backendUrl + "/api/users/profile",
        );
        const profileRes = await fetch(backendUrl + "/api/users/profile", {
          headers: { Authorization: token },
        });

        console.log(
          "Profile API Status:",
          profileRes.status,
          profileRes.statusText,
        );

        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          console.error("Profile API Error Response:", errorText);
          console.error(
            "Profile API Error HTML (first 500 chars):",
            errorText.substring(0, 500),
          );
          throw new Error(
            `API error: ${profileRes.status} ${profileRes.statusText}`,
          );
        }

        const profileData = await profileRes.json();
        console.log("Profile User Data:", profileData.user);

        // Log individual user fields
        if (profileData.user) {
          console.log("User ID:", profileData.user._id);
          console.log("User Name:", profileData.user.name);
          console.log("User Email:", profileData.user.email);
          console.log("User Balance:", profileData.user.balance);
          console.log("User Bio:", profileData.user.bio);
          console.log("User Location:", profileData.user.location);
          console.log(
            "User Expertise Level:",
            profileData.user.expertise_level,
          );
          console.log(
            "User Photography Specialty:",
            profileData.user.photography_specialty,
          );
          console.log("User Languages:", profileData.user.languages);
          console.log("User Profile Picture:", profileData.user.profilePicture);
        }

        // Fetch stats
        console.log("Fetching stats from " + backendUrl + "/api/users/stats");
        const statsRes = await fetch(backendUrl + "/api/users/stats", {
          headers: { Authorization: token },
        });

        console.log("Stats API Status:", statsRes.status, statsRes.statusText);

        const statsData = await statsRes.json();
        console.log("Stats Response (Full):", statsData);

        if (profileData.success && profileData.user) {
          console.log("✅ Successfully loaded user profile");
          setUser(profileData.user);
        } else {
          console.error("❌ Profile data missing or success is false");
          setError(
            profileData.message || "Failed to load profile - User not found",
          );
        }

        if (statsData.success) {
          console.log("✅ Successfully loaded stats");
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        console.error("Error stack:", err.stack);

        // Better error messaging
        let errorMessage = "Error loading profile";
        if (err.message.includes("Unexpected token")) {
          errorMessage =
            "Backend server is not running. Please start the backend with: npm run start";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Cannot connect to backend server. Make sure it's running on http://localhost:4000";
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log("=== PROFILE PAGE LOADING COMPLETE ===");
      }
    };

    fetchProfileAndStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-2xl font-bold mb-4">Profile Not Found</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const usdBalance = user.balance
    ? (parseFloat(user.balance) * currentEthPrice).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-white text-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Title text1="My" text2="Profile" />

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded text-red-800">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="mt-12 bg-gray-50 rounded-lg border border-gray-200 p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-4 border-amber-500">
                <span className="text-4xl font-bold text-gray-900">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-400 mb-4">{user.email}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/edit-profile")}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={() => navigate("/fund-account")}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>

        {/* Account Balance Card */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
          <p className="text-gray-600 text-sm mb-2">Account Balance</p>
          <div className="flex items-baseline gap-4">
            <div>
              <p className="text-4xl font-bold text-amber-600">
                {parseFloat(user.balance || 0).toFixed(8)}
              </p>
              <p className="text-gray-600 text-sm">ETH</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">${usdBalance}</p>
              <p className="text-gray-600 text-sm">USD</p>
            </div>
          </div>
        </div>

        {/* Professional Profile Section */}
        <div className="mt-8 bg-gray-50 rounded-lg border border-gray-300 p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Professional Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bio */}
            {user.bio && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  About
                </h3>
                <p className="text-gray-800 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Location */}
            {user.location && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Location
                </h3>
                <p className="text-gray-800 flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  {user.location}
                </p>
              </div>
            )}

            {/* Expertise Level */}
            {user.expertise_level && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Expertise Level
                </h3>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {user.expertise_level.charAt(0).toUpperCase() +
                    user.expertise_level.slice(1).replace("-", " ")}
                </span>
              </div>
            )}

            {/* Photography Specialties */}
            {user.photography_specialty &&
              user.photography_specialty.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Photography Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.photography_specialty.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 bg-amber-100 border border-amber-400 rounded-full text-sm font-medium text-amber-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Languages */}
            {user.languages && user.languages.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.languages.map((language) => (
                    <span
                      key={language}
                      className="px-4 py-2 bg-blue-100 border border-blue-400 rounded-full text-sm font-medium text-blue-700"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <button
              onClick={() => navigate("/edit-profile")}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-2"
            >
              ✎ Edit Profile Information
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "text-amber-600 border-amber-600"
                : "text-gray-600 border-transparent hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "transactions"
                ? "text-amber-600 border-amber-600"
                : "text-gray-600 border-transparent hover:text-gray-700"
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && stats && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stats Cards */}
            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Images Uploaded</p>
              <p className="text-3xl font-bold text-amber-600">
                {stats.totalImages}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Total Purchases</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.transactions.purchases}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Total Sales</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.transactions.sales}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Favorites</p>
              <p className="text-3xl font-bold text-pink-600">
                {stats.totalFavorites}
              </p>
            </div>

            {/* Earnings */}
            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Total Earned</p>
              <p className="text-2xl font-bold text-green-600">
                {parseFloat(stats.earnings.totalEarned).toFixed(8)} ETH
              </p>
            </div>

            {/* Spent */}
            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">
                {parseFloat(stats.earnings.totalSpent).toFixed(8)} ETH
              </p>
            </div>

            {/* Member Since */}
            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Member Since</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(stats.memberSince).toLocaleDateString()}
              </p>
            </div>

            {/* Total Transactions */}
            <div className="bg-gray-50 border border-gray-300 rounded p-6">
              <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.transactions.total}
              </p>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="mt-8 bg-gray-50 border border-gray-300 rounded p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Recent Activity
            </h3>
            <div className="text-center py-8">
              <p className="text-gray-600">
                <button
                  onClick={() => navigate("/orders")}
                  className="text-amber-600 hover:underline"
                >
                  View full transaction history
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
