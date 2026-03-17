import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const UploadPhoto = () => {
  const { navigate, ethPrice, backendUrl } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceEth: "",
    category: "",
    tags: "",
    usageRights: "personal_use",
    licenseType: "non-exclusive",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usdValue, setUsdValue] = useState("0");

  // Insufficient balance modal state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(null);

  // User balance state
  const [userBalance, setUserBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Fetch user balance on component mount
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setBalanceLoading(false);
          return;
        }

        const response = await fetch(backendUrl + "/api/users/profile", {
          headers: { Authorization: token },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Profile data:", data); // Debug log
          if (data.user) {
            // Balance is already stored as ETH (decimal format), just parse it
            const balanceStr = String(data.user.balance || "0");
            console.log("Balance string:", balanceStr); // Debug log
            const balanceEth = parseFloat(balanceStr) || 0;
            console.log("Converted balance:", balanceEth, "ETH"); // Debug log
            setUserBalance(balanceEth);
          }
        } else {
          console.error("Failed to fetch profile:", response.status);
        }
      } catch (err) {
        console.error("Error fetching user balance:", err);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchUserBalance();
  }, [backendUrl]);

  const categories = [
    "Landscape",
    "Portrait",
    "Wildlife",
    "Architecture",
    "Street",
    "Macro",
    "Abstract",
    "Nature",
    "People",
    "Product",
  ];

  useEffect(() => {
    if (formData.priceEth && ethPrice) {
      const usd = (parseFloat(formData.priceEth) * ethPrice).toFixed(2);
      setUsdValue(usd);
    } else {
      setUsdValue("0");
    }
  }, [formData.priceEth, ethPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowBalanceModal(false);

    // Validate required fields
    if (
      !formData.title ||
      !formData.priceEth ||
      !formData.category ||
      !selectedFile
    ) {
      setError(
        "Please fill all required fields (Title, Category, Price) and select an image",
      );
      return;
    }

    if (parseFloat(formData.priceEth) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    // Check balance before uploading
    if (userBalance !== null && ethPrice) {
      const requiredBalanceUSD = 200; // $200 USD minimum
      const requiredBalanceETH = requiredBalanceUSD / ethPrice;
      const userBalanceUSD = userBalance * ethPrice;

      if (userBalanceUSD < requiredBalanceUSD) {
        setInsufficientBalance({
          currentBalance: userBalanceUSD,
          currentBalanceETH: userBalance,
          requiredBalance: requiredBalanceUSD,
          ethPrice: ethPrice,
        });
        setShowBalanceModal(true);
        return;
      }
    }

    setLoading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("priceEth", formData.priceEth);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("tags", formData.tags);
      uploadFormData.append("usageRights", formData.usageRights);
      uploadFormData.append("licenseType", formData.licenseType);

      const token = localStorage.getItem("token");

      const response = await fetch(backendUrl + "/api/images/upload", {
        method: "POST",
        headers: {
          Authorization: token || "",
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Image uploaded successfully! Gas fee of $${data.gasFeeDeducted?.amountUsd || 200} deducted from your balance.`
        );
        
        // Fetch updated balance
        const token = localStorage.getItem("token");
        try {
          const profileRes = await fetch(backendUrl + "/api/users/profile", {
            headers: { Authorization: token },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.user) {
              // Balance is already stored as ETH (decimal format), just parse it
              const balanceStr = String(profileData.user.balance || "0");
              const balanceEth = parseFloat(balanceStr) || 0;
              setUserBalance(balanceEth);
            }
          }
        } catch (err) {
          console.error("Error fetching updated balance:", err);
        }

        // Reset form
        setFormData({
          title: "",
          description: "",
          priceEth: "",
          category: "",
          tags: "",
          usageRights: "personal_use",
          licenseType: "non-exclusive",
        });
        setSelectedFile(null);
        setImagePreview(null);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/my-sales");
        }, 2000);
      } else if (data.errorCode === "INSUFFICIENT_BALANCE") {
        // Show insufficient balance modal
        setInsufficientBalance({
          currentBalance: parseFloat(data.currentBalance),
          requiredBalance: data.requiredBalance,
          message: data.message,
        });
        setShowBalanceModal(true);
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Error uploading image: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Insufficient Balance Modal */}
        {showBalanceModal && insufficientBalance && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl max-w-sm w-full p-8 border border-amber-100">
              <div className="text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-200">
                  <svg
                    className="w-10 h-10 text-amber-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 13V7m0 10H7m5 0h5M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9Z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  Insufficient Balance
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  You need more funds to upload images
                </p>

                {/* Balance Info */}
                <div className="bg-gradient-to-br from-amber-50 via-white to-gray-50 border-2 border-amber-200 rounded-xl p-6 mb-6 text-left">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-gray-700">
                        Required Balance:
                      </span>
                      <span className="text-lg font-bold text-amber-600">
                        ${insufficientBalance.requiredBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-gray-700">
                        Your Balance:
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${insufficientBalance.currentBalance.toFixed(2)}
                      </span>
                    </div>
                    {insufficientBalance.currentBalanceETH !== undefined && (
                      <p className="text-xs text-gray-500 text-right mt-2">
                        {insufficientBalance.currentBalanceETH.toFixed(6)} ETH @
                        ${insufficientBalance.ethPrice?.toFixed(2) || "N/A"}/ETH
                      </p>
                    )}
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                    <div className="flex justify-between items-start pt-2">
                      <span className="text-sm font-bold text-amber-600">
                        Shortfall:
                      </span>
                      <span className="text-lg font-bold text-amber-600">
                        $
                        {(
                          insufficientBalance.requiredBalance -
                          insufficientBalance.currentBalance
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <p className="text-gray-700 text-sm mb-8 leading-relaxed">
                  To upload and sell photos on Peak Lens Photography, you must
                  maintain a minimum balance of <strong>$200 USD</strong>{" "}
                  equivalent in Ethereum. This ensures platform security and
                  transaction integrity.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBalanceModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowBalanceModal(false);
                      navigate("/fund-account");
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Add Funds
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          {/* Image Upload Area */}
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-80 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("imageInput").click()}
                  className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 rounded font-medium text-white"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div
                className="text-center cursor-pointer"
                onClick={() => document.getElementById("imageInput").click()}
              >
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xl font-semibold mb-2 text-gray-900">
                  Click to upload image
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG, WebP up to 10MB
                </p>
              </div>
            )}
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Title (Required) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Photo Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter photo title"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your photo (optional)"
              rows="4"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Separate tags with commas (e.g. sunset, mountain, nature)"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Price (Required) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Price (ETH) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="priceEth"
                value={formData.priceEth}
                onChange={handleInputChange}
                placeholder="0.01"
                step="0.001"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            {/* USD Conversion */}
            {formData.priceEth && (
              <div className="mt-2 p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm text-gray-600">
                  Equivalent to:{" "}
                  <span className="text-amber-600 font-semibold">
                    ${usdValue} USD
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  1 ETH = ${ethPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Usage Rights */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Usage Rights
            </label>
            <select
              name="usageRights"
              value={formData.usageRights}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="personal_use">Personal Use Only</option>
              <option value="commercial_use">Commercial Use Only</option>
              <option value="both">Personal & Commercial</option>
            </select>
          </div>

          {/* License Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              License Type
            </label>
            <select
              name="licenseType"
              value={formData.licenseType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="exclusive">Exclusive</option>
              <option value="non-exclusive">Non-Exclusive</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded font-semibold text-lg transition-colors text-white"
          >
            {loading ? "Uploading..." : "Upload & List Photo"}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-3 text-blue-900">Tips for Success</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Use high-quality, original images</li>
            <li>✓ Add descriptive titles and tags to improve visibility</li>
            <li>✓ Price competitively based on image quality</li>
            <li>✓ Ensure you have rights to sell the image</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPhoto;
