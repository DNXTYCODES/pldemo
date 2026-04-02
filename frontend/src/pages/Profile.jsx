import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { getFormattedPrice } from "../utils/ethPrice";

const Profile = () => {
  const { navigate, backendUrl, ethPrice, currencyPreference } =
    useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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

          // Fetch transactions
          try {
            const txRes = await fetch(backendUrl + "/api/users/transactions", {
              headers: { Authorization: token },
            });
            const txData = await txRes.json();
            if (txData.success && Array.isArray(txData.transactions)) {
              setTransactions(txData.transactions.reverse());
            }
          } catch (txErr) {
            console.error("Error fetching transactions:", txErr);
          }
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

  return (
    <div className="min-h-screen bg-white text-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded text-red-800">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[2fr_1fr] xl:grid-cols-[2.2fr_1fr]">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl text-white">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-500"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-4 border-amber-500">
                        <span className="text-4xl font-bold text-slate-950">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                      Account Holder
                    </p>
                    <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
                      {user.name}
                    </h1>
                    <p className="mt-2 text-sm text-slate-300">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:w-fit">
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate("/fund-account")}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    Top Up
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                    Current Balance
                  </p>
                  <p className="mt-4 text-5xl font-semibold text-amber-300 leading-tight">
                    {getFormattedPrice(user.balance || 0, ethPrice, "eth")}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">ETH</p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                    USD Equivalent
                  </p>
                  <p className="mt-4 text-4xl font-semibold text-emerald-300 leading-tight">
                    {getFormattedPrice(user.balance || 0, ethPrice, "usd")}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Using current ETH rate
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 bg-slate-950/95 px-6 py-4 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Wallet Summary
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your available balance is shown in ETH and USD. Withdrawals
                    and pending fees are tracked in transaction history.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">ETH Price</p>
                  <p className="text-lg font-semibold text-white">
                    ${ethPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                Quick Overview
              </p>
              <div className="mt-5 grid gap-4">
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Images Uploaded
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {stats?.totalImages ?? "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">Net Earnings</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {parseFloat(
                      (
                        (stats?.earnings?.totalEarned || 0) -
                        (stats?.earnings?.totalSpent || 0)
                      ).toFixed(8),
                    )}{" "}
                    ETH
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    Total Transactions
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {stats?.transactions?.total ?? "0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                Profile Details
              </p>
              <div className="mt-5 space-y-4 text-sm text-slate-700">
                {user.location && (
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <span className="text-slate-500">Location</span>
                    <span className="font-semibold text-slate-900">
                      {user.location}
                    </span>
                  </div>
                )}
                {user.expertise_level && (
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <span className="text-slate-500">Expertise Level</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {user.expertise_level.replace("-", " ")}
                    </span>
                  </div>
                )}
                {user.photography_specialty?.length > 0 && (
                  <div>
                    <span className="text-slate-500">Specialties</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.photography_specialty.map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.languages?.length > 0 && (
                  <div>
                    <span className="text-slate-500">Languages</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.languages.map((language) => (
                        <span
                          key={language}
                          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                <p className="text-gray-800">{user.location}</p>
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
          <div className="mt-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Images Uploaded */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-amber-700 text-sm font-semibold uppercase tracking-wide">
                    Images Uploaded
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-600"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-amber-700">
                  {stats.totalImages}
                </p>
              </div>

              {/* Purchases */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-700 text-sm font-semibold uppercase tracking-wide">
                    Purchases
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-600"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-blue-700">
                  {stats.transactions.purchases}
                </p>
              </div>

              {/* Sales */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-700 text-sm font-semibold uppercase tracking-wide">
                    Sales
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-600"
                  >
                    <path d="M12 2v20m10-10H2" />
                    <path d="M2 12l4-4m16 4l-4 4m0-8l4-4" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-700">
                  {stats.transactions.sales}
                </p>
              </div>

              {/* Total Transactions */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-700 text-sm font-semibold uppercase tracking-wide">
                    Transactions
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-600"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-purple-700">
                  {stats.transactions.total}
                </p>
              </div>

              {/* Member Since */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
                    Member Since
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-600"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-700">
                  {new Date(stats.memberSince).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Net Balance */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-cyan-700 text-sm font-semibold uppercase tracking-wide">
                    Net Balance
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-cyan-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-cyan-700">
                  {parseFloat(
                    (
                      stats.earnings.totalEarned - stats.earnings.totalSpent
                    ).toFixed(8),
                  )}{" "}
                  ETH
                </p>
              </div>

              {/* ETH Price */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-indigo-700 text-sm font-semibold uppercase tracking-wide">
                    ETH Price
                  </p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-indigo-600"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-indigo-700">
                  ${ethPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="mt-8 bg-gray-50 border border-gray-300 rounded p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-900">
              Transaction History
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => {
                  const getTypeIcon = (type) => {
                    switch (type) {
                      case "deposit":
                        return "➕";
                      case "purchase":
                        return "🛒";
                      case "sale":
                        return "💰";
                      case "withdrawal":
                        return "➖";
                      case "fee":
                        return "⛽";
                      case "upload_approval":
                        return "✅";
                      case "upload_decline":
                        return "❌";
                      default:
                        return "📋";
                    }
                  };

                  const getTypeLabel = (type) => {
                    switch (type) {
                      case "deposit":
                        return "Deposit";
                      case "purchase":
                        return "Image Purchase";
                      case "sale":
                        return "Image Sale";
                      case "withdrawal":
                        return "Withdrawal";
                      case "fee":
                        return "Fee";
                      case "upload_approval":
                        return "Upload Approved";
                      case "upload_decline":
                        return "Upload Declined";
                      default:
                        return "Transaction";
                    }
                  };

                  const getStatusColor = (type) => {
                    switch (type) {
                      case "deposit":
                      case "sale":
                      case "upload_approval":
                        return "bg-green-50";
                      case "withdrawal":
                      case "fee":
                      case "purchase":
                        return "bg-red-50";
                      case "upload_decline":
                        return "bg-yellow-50";
                      default:
                        return "bg-gray-50";
                    }
                  };

                  return (
                    <div
                      key={tx._id}
                      className={`border border-gray-300 rounded p-4 ${getStatusColor(tx.type)} hover:shadow-md transition`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {getTypeIcon(tx.type)}
                            </span>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {getTypeLabel(tx.type)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(tx.createdAt).toLocaleDateString()}{" "}
                                {new Date(tx.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          {tx.description && (
                            <p className="text-sm text-gray-700 mb-2 pl-0 sm:pl-11">
                              {tx.description}
                            </p>
                          )}

                          {tx.adminNotes && (
                            <p className="text-sm text-gray-600 italic border-l-0 sm:border-l-2 border-gray-400 pl-0 sm:pl-3">
                              Note: {tx.adminNotes}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm sm:ml-11">
                            {tx.amountEth !== "0" && (
                              <div>
                                <span className="text-gray-600 block">
                                  Amount
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {tx.amountEth} ETH
                                </span>
                              </div>
                            )}
                            {tx.gasFeeEth && tx.gasFeeEth !== "0" && (
                              <div>
                                <span className="text-gray-600 block">
                                  Gas Fee
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {tx.gasFeeEth} ETH
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600 block">
                                Status
                              </span>
                              <span
                                className={`font-semibold ${
                                  tx.status === "completed"
                                    ? "text-green-600"
                                    : tx.status === "pending"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {tx.status.charAt(0).toUpperCase() +
                                  tx.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right mt-4 sm:mt-0 sm:ml-4">
                          <p className="text-sm text-gray-600 mb-1">
                            {tx.ethPriceAtTime
                              ? `ETH Price: $${parseFloat(tx.ethPriceAtTime).toLocaleString()}`
                              : ""}
                          </p>
                          {tx.amountUsd && tx.amountUsd !== "0" && (
                            <p className="text-lg font-bold text-gray-900">
                              ${parseFloat(tx.amountUsd).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
