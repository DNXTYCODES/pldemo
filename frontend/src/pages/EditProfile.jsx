import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const PHOTOGRAPHY_SPECIALTIES = [
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

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Arabic",
  "Hindi",
];

const EditProfile = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    expertise_level: "amateur",
    photography_specialty: [],
    languages: [],
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        console.log("=== EDIT PROFILE PAGE LOADING ===");
        console.log("Token exists:", !!token);
        console.log(
          "Token value:",
          token ? token.substring(0, 20) + "..." : "NO TOKEN",
        );

        console.log(
          "Fetching profile from " + backendUrl + "/api/users/profile",
        );
        const response = await fetch(backendUrl + "/api/users/profile", {
          headers: { Authorization: token },
        });

        console.log(
          "Profile API Status:",
          response.status,
          response.statusText,
        );

        const data = await response.json();
        console.log("Profile Response (Full):", data);
        console.log("Profile User Data:", data.user);

        // Log individual user fields
        if (data.user) {
          console.log("User ID:", data.user._id);
          console.log("User Name:", data.user.name);
          console.log("User Email:", data.user.email);
          console.log("User Balance:", data.user.balance);
          console.log("User Bio:", data.user.bio);
          console.log("User Location:", data.user.location);
          console.log("User Expertise Level:", data.user.expertise_level);
          console.log(
            "User Photography Specialty:",
            data.user.photography_specialty,
          );
          console.log("User Languages:", data.user.languages);
          console.log("User Profile Picture:", data.user.profilePicture);
        }

        if (data.success && data.user) {
          console.log("✅ Successfully loaded user profile");
          setCurrentUser(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email,
            bio: data.user.bio || "",
            location: data.user.location || "",
            expertise_level: data.user.expertise_level || "amateur",
            photography_specialty: data.user.photography_specialty || [],
            languages: data.user.languages || [],
          });
          if (data.user.profilePicture) {
            setPicturePreview(data.user.profilePicture);
          }
        } else {
          console.error("❌ Profile response not successful");
          console.error("Success:", data.success);
          console.error("Message:", data.message);
          setError(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        console.error("Error stack:", err.stack);
        setError("Error loading profile: " + err.message);
      } finally {
        setLoading(false);
        console.log("=== EDIT PROFILE PAGE LOADING COMPLETE ===");
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData((prev) => ({
      ...prev,
      photography_specialty: prev.photography_specialty.includes(specialty)
        ? prev.photography_specialty.filter((s) => s !== specialty)
        : [...prev.photography_specialty, specialty],
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const [customSpecialty, setCustomSpecialty] = useState("");
  const handleAddCustomSpecialty = () => {
    if (
      customSpecialty.trim() &&
      !formData.photography_specialty.includes(customSpecialty)
    ) {
      setFormData((prev) => ({
        ...prev,
        photography_specialty: [...prev.photography_specialty, customSpecialty],
      }));
      setCustomSpecialty("");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setProfilePicture(file);
      setError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(backendUrl + "/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile updated successfully!");
        setCurrentUser(data.user);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Error updating profile: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePicture = async (e) => {
    e.preventDefault();

    if (!profilePicture) {
      setError("Please select an image to upload");
      return;
    }

    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const uploadFormData = new FormData();
      uploadFormData.append("profilePicture", profilePicture);

      const response = await fetch(backendUrl + "/api/users/profile-picture", {
        method: "PUT",
        headers: {
          Authorization: token,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile picture updated successfully!");
        setProfilePicture(null);
        setCurrentUser((prev) => ({
          ...prev,
          profilePicture: data.profilePicture,
        }));
      } else {
        setError(data.message || "Failed to update picture");
      }
    } catch (err) {
      setError("Error updating picture: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(backendUrl + "/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("Error changing password: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Title text1="Edit" text2="Profile" />

        {/* Profile Picture Section */}
        <div className="mt-12 bg-white rounded-lg border border-gray-300 p-8">
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            Profile Picture
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            {/* Current Picture */}
            <div className="flex-shrink-0">
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-amber-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-4 border-amber-500">
                  <span className="text-4xl font-bold text-gray-900">
                    {currentUser?.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => document.getElementById("pictureInput").click()}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 rounded font-medium mb-2"
              >
                Choose Image
              </button>
              <input
                id="pictureInput"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
              {profilePicture && (
                <button
                  onClick={handleUpdatePicture}
                  disabled={updating}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-medium"
                >
                  {updating ? "Updating..." : "Save Picture"}
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600">Max file size: 5MB</p>
        </div>

        {/* Personal Information */}
        <form
          onSubmit={handleUpdateProfile}
          className="mt-8 bg-white rounded-lg border border-gray-300 p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            Personal Information
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself as a photographer..."
                maxLength="500"
                rows="4"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Expertise Level
              </label>
              <select
                name="expertise_level"
                value={formData.expertise_level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="amateur">Amateur</option>
                <option value="semi-professional">Semi-professional</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            {/* Photography Specialties */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900">
                Photography Specialties
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 border border-gray-300 rounded">
                {PHOTOGRAPHY_SPECIALTIES.map((specialty) => (
                  <label key={specialty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.photography_specialty.includes(
                        specialty,
                      )}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="w-4 h-4 rounded border-gray-400 cursor-pointer accent-amber-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {specialty}
                    </span>
                  </label>
                ))}
              </div>

              {/* Custom Specialty */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  placeholder="Add custom specialty..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomSpecialty())
                  }
                />
                <button
                  type="button"
                  onClick={handleAddCustomSpecialty}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded font-medium text-sm"
                >
                  Add
                </button>
              </div>

              {/* Selected Specialties Tags */}
              {formData.photography_specialty.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.photography_specialty.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center gap-2 bg-amber-100 border border-amber-400 rounded-full px-3 py-1 text-sm text-amber-700"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleSpecialtyToggle(specialty)}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900">
                Languages
              </label>
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-300 rounded">
                {LANGUAGES.map((language) => (
                  <label key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                      className="w-4 h-4 rounded border-gray-400 cursor-pointer accent-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {language}
                    </span>
                  </label>
                ))}
              </div>

              {/* Selected Languages Tags */}
              {formData.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center gap-2 bg-blue-100 border border-blue-400 rounded-full px-3 py-1 text-sm text-blue-700"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password */}
        <form
          onSubmit={handleChangePassword}
          className="mt-8 bg-white rounded-lg border border-gray-300 p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            Change Password
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium"
          >
            {updating ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
