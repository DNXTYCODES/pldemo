import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const Settings = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("No authentication token found. Please login first.");
          setLoading(false);
          return;
        }

        const response = await fetch(backendUrl + "/api/users/profile", {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUserProfile(data.user);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="text-center">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-16 px-4 mb-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-bold mb-3">Settings & Account</h1>
            <p className="text-amber-100 text-lg">Manage your profile, uploads, purchases, and account preferences</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-20">
          {/* Not Logged In Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-12 text-center shadow-lg">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto">
              You need to log in to your Peak Lens Photography account to access your settings and manage your profile, uploads, and purchases.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Go to Login →
            </button>

            <p className="text-gray-600 text-sm mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:text-blue-700 underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      icon: "👤",
      title: "Profile Settings",
      description: "View and manage your account information",
      action: "View Profile",
      onClick: () => navigate("/profile"),
      gradient: "from-blue-400 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      icon: "✏️",
      title: "Edit Profile",
      description: "Update your personal details and preferences",
      action: "Edit Now",
      onClick: () => navigate("/edit-profile"),
      gradient: "from-purple-400 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
    },
    {
      icon: "📸",
      title: "Upload Photos",
      description: "Share your photography with the community",
      action: "Upload",
      onClick: () => navigate("/upload-photo"),
      gradient: "from-amber-400 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
    },
    {
      icon: "💰",
      title: "My Sales",
      description: "Track and manage your uploaded photos and earnings",
      action: "View Sales",
      onClick: () => navigate("/my-sales"),
      gradient: "from-green-400 to-green-600",
      bgGradient: "from-green-50 to-green-100",
    },
    {
      icon: "🛍️",
      title: "My Purchases",
      description: "View and manage your photo purchases",
      action: "View Purchases",
      onClick: () => navigate("/my-purchases"),
      gradient: "from-cyan-400 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
    },
    {
      icon: "💳",
      title: "Fund Account",
      description: "Add funds to your account and manage payments",
      action: "Add Funds",
      onClick: () => navigate("/fund-account"),
      gradient: "from-indigo-400 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
    },
    {
      icon: "📊",
      title: "Transactions",
      description: "View your complete transaction history and analytics",
      action: "View History",
      onClick: () => navigate("/transactions"),
      gradient: "from-rose-400 to-rose-600",
      bgGradient: "from-rose-50 to-rose-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-16 px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-3">Settings & Account</h1>
          <p className="text-amber-100 text-lg">Manage your profile, uploads, purchases, and account preferences</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Welcome Message */}
        {userProfile && (
          <div className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 shadow-sm">
            <p className="text-gray-700 text-lg">
              Welcome back, <span className="font-bold text-amber-600">{userProfile.name}</span>! Here's where you can manage everything related to your Peak Lens Photography account.
            </p>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Gradient Background Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-40 group-hover:opacity-60 transition-opacity`}
              ></div>

              {/* Content */}
              <div className="relative p-8 flex flex-col h-full">
                {/* Icon */}
                <div className="text-5xl mb-4">{section.icon}</div>

                {/* Title and Description */}
                <div className="flex-1 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {/* Button */}
                <button
                  onClick={section.onClick}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform group-hover:scale-105 bg-gradient-to-r ${section.gradient} hover:shadow-lg`}
                >
                  {section.action} →
                </button>
              </div>

              {/* Side Accent */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              ></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300 rounded-2xl p-8 text-center shadow-md">
            <div className="text-4xl font-bold text-amber-600 mb-2">
              {userProfile?.balance ? parseFloat(userProfile.balance).toFixed(4) : "0.00"}
            </div>
            <p className="text-gray-700 font-medium">Account Balance (ETH)</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-2xl p-8 text-center shadow-md">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {userProfile?.name ? userProfile.name.split(" ")[0] : "User"}
            </div>
            <p className="text-gray-700 font-medium">Account Status</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-300 rounded-2xl p-8 text-center shadow-md">
            <div className="text-4xl font-bold text-blue-600 mb-2">✓</div>
            <p className="text-gray-700 font-medium">Account Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
