import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";

const UploadPhoto = () => {
  const { navigate } = useContext(ShopContext);
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
  const [currentEthPrice, setCurrentEthPrice] = useState(0);
  const [usdValue, setUsdValue] = useState("0");

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
    // Fetch current ETH price
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
    if (formData.priceEth && currentEthPrice) {
      const usd = (parseFloat(formData.priceEth) * currentEthPrice).toFixed(2);
      setUsdValue(usd);
    } else {
      setUsdValue("0");
    }
  }, [formData.priceEth, currentEthPrice]);

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

      const response = await fetch("/api/images/upload", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Image uploaded successfully!");
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
                  1 ETH = ${currentEthPrice.toFixed(2)}
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
