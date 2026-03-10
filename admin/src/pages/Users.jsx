import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const EXPERTISE_LEVELS = ["amateur", "semi-professional", "professional"];
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

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    location: "",
    expertise_level: "amateur",
    photography_specialty: [],
    languages: [],
    balance: "0",
    accountStatus: "active",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [imageUploadData, setImageUploadData] = useState({
    title: "",
    description: "",
    priceEth: "",
    category: "",
    tags: "",
    usageRights: "personal_use",
    licenseType: "non-exclusive",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Pending Uploads Management
  const [pendingUploads, setPendingUploads] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showPendingTab, setShowPendingTab] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [declineReason, setDeclineReason] = useState({});

  // Fetch all users
  useEffect(() => {
    fetchUsers();
    fetchPendingUploads();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        backendUrl + "/api/users/admin/all-users",
        {
          headers: { Authorization: token },
        },
      );

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUploads = async () => {
    try {
      setLoadingPending(true);
      const response = await axios.get(
        backendUrl + "/api/images/admin/pending",
        {
          headers: { Authorization: token },
        },
      );

      if (response.data.success) {
        setPendingUploads(response.data.uploads);
      }
    } catch (error) {
      console.error("Error fetching pending uploads:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApproveUpload = async (imageId) => {
    try {
      setApprovingId(imageId);
      const response = await axios.post(
        backendUrl + `/api/images/${imageId}/approve`,
        {},
        {
          headers: { Authorization: token },
        },
      );

      if (response.data.success) {
        toast.success("Upload approved successfully!");
        setPendingUploads(pendingUploads.filter((img) => img._id !== imageId));
      } else {
        toast.error(response.data.message || "Failed to approve upload");
      }
    } catch (error) {
      console.error("Error approving upload:", error);
      toast.error("Error approving upload");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeclineUpload = async (imageId) => {
    try {
      setDecliningId(imageId);
      const reason = declineReason[imageId] || "No reason provided";
      const response = await axios.post(
        backendUrl + `/api/images/${imageId}/decline`,
        { reason },
        {
          headers: { Authorization: token },
        },
      );

      if (response.data.success) {
        toast.success("Upload declined successfully!");
        setPendingUploads(pendingUploads.filter((img) => img._id !== imageId));
        setDeclineReason((prev) => {
          const newReason = { ...prev };
          delete newReason[imageId];
          return newReason;
        });
      } else {
        toast.error(response.data.message || "Failed to decline upload");
      }
    } catch (error) {
      console.error("Error declining upload:", error);
      toast.error("Error declining upload");
    } finally {
      setDecliningId(null);
    }
  };

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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile || !editingUser) {
      toast.error("Please select a profile picture");
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("profilePicture", profilePictureFile);

      const response = await axios.put(
        backendUrl + `/api/users/admin/${editingUser._id}/profile-picture`,
        formDataUpload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Profile picture updated successfully");
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        fetchUsers();
      } else {
        toast.error(
          response.data.message || "Failed to update profile picture",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error uploading profile picture");
    }
  };

  const handleImageInputChange = (e) => {
    const { name, value } = e.target;
    setImageUploadData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();

    if (
      !imageFile ||
      !imageUploadData.title ||
      !imageUploadData.priceEth ||
      !imageUploadData.category ||
      !editingUser
    ) {
      toast.error(
        "Please fill all required fields (Title, Price, Category) and select an image",
      );
      return;
    }

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", imageFile);
      formDataUpload.append("title", imageUploadData.title);
      formDataUpload.append("description", imageUploadData.description);
      formDataUpload.append("priceEth", imageUploadData.priceEth);
      formDataUpload.append("category", imageUploadData.category);
      formDataUpload.append("tags", imageUploadData.tags);
      formDataUpload.append("usageRights", imageUploadData.usageRights);
      formDataUpload.append("licenseType", imageUploadData.licenseType);
      formDataUpload.append("userId", editingUser._id);

      const response = await axios.post(
        backendUrl + "/api/images/admin/upload",
        formDataUpload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Image uploaded successfully");
        setImageFile(null);
        setImagePreview(null);
        setImageUploadData({
          title: "",
          description: "",
          priceEth: "",
          category: "",
          tags: "",
          usageRights: "personal_use",
          licenseType: "non-exclusive",
        });
      } else {
        toast.error(response.data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      bio: "",
      location: "",
      expertise_level: "amateur",
      photography_specialty: [],
      languages: [],
      balance: "0",
      accountStatus: "active",
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      (!editingUser && !formData.password)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const response = await axios.put(
          backendUrl + `/api/users/admin/${editingUser._id}`,
          formData,
          {
            headers: { Authorization: token },
          },
        );

        if (response.data.success) {
          toast.success("User updated successfully");
          fetchUsers();
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to update user");
        }
      } else {
        // Create new user
        const response = await axios.post(
          backendUrl + "/api/users/admin/create",
          formData,
          {
            headers: { Authorization: token },
          },
        );

        if (response.data.success) {
          toast.success("User created successfully");
          fetchUsers();
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to create user");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Error saving user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      bio: user.bio || "",
      location: user.location || "",
      expertise_level: user.expertise_level || "amateur",
      photography_specialty: user.photography_specialty || [],
      languages: user.languages || [],
      balance: user.balance || "0",
      accountStatus: user.accountStatus || "active",
    });
    setShowForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await axios.delete(
        backendUrl + `/api/users/admin/${userId}`,
        {
          headers: { Authorization: token },
        },
      );

      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error deleting user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setShowPendingTab(false)}
          className={`px-6 py-3 font-semibold transition ${
            !showPendingTab
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setShowPendingTab(true)}
          className={`px-6 py-3 font-semibold transition relative ${
            showPendingTab
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending Uploads
          {pendingUploads.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {pendingUploads.length}
            </span>
          )}
        </button>
      </div>

      {/* Users Tab */}
      {!showPendingTab && (
        <div>
          <div className="mb-8 p-6 bg-white border rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6">
              {editingUser ? "Edit User" : "Create New User"}
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Password */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required={!editingUser}
                    />
                  </div>
                )}

                {/* Balance */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Balance (ETH)
                  </label>
                  <input
                    type="text"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Status
                  </label>
                  <select
                    name="accountStatus"
                    value={formData.accountStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Expertise Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expertise Level
                  </label>
                  <select
                    name="expertise_level"
                    value={formData.expertise_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {EXPERTISE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg h-20"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Photography Specialties */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Photography Specialties
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PHOTOGRAPHY_SPECIALTIES.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.photography_specialty.includes(
                          specialty,
                        )}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="mr-2"
                      />
                      {specialty}
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Languages
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LANGUAGES.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => handleLanguageToggle(language)}
                        className="mr-2"
                      />
                      {language}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {editingUser ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Profile Picture Upload - Only show when editing */}
            {editingUser && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-bold mb-4">
                  Update Profile Picture
                </h3>
                <div className="space-y-4">
                  {profilePicturePreview && (
                    <img
                      src={profilePicturePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePictureInput"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
                    >
                      {profilePictureFile
                        ? "Change Profile Picture"
                        : "Click to select profile picture"}
                    </label>
                  </div>
                  {profilePictureFile && (
                    <button
                      type="button"
                      onClick={handleUploadProfilePicture}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Upload Profile Picture
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Image Upload - Only show when editing */}
            {editingUser && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-bold mb-4">
                  Upload Image for User
                </h3>
                <form onSubmit={handleUploadImage} className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  )}

                  {/* Image Upload */}
                  <div>
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageInput"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
                    >
                      {imageFile
                        ? "Change Image"
                        : "Click to select image for upload"}
                    </label>
                  </div>

                  {/* Image Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={imageUploadData.title}
                        onChange={handleImageInputChange}
                        placeholder="Image title"
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={imageUploadData.category}
                        onChange={handleImageInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Select category</option>
                        {PHOTOGRAPHY_SPECIALTIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price (ETH) *
                      </label>
                      <input
                        type="number"
                        name="priceEth"
                        value={imageUploadData.priceEth}
                        onChange={handleImageInputChange}
                        placeholder="0.00"
                        step="0.00001"
                        min="0"
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Usage Rights
                      </label>
                      <select
                        name="usageRights"
                        value={imageUploadData.usageRights}
                        onChange={handleImageInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="personal_use">Personal Use</option>
                        <option value="commercial_use">Commercial Use</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={imageUploadData.description}
                      onChange={handleImageInputChange}
                      placeholder="Image description"
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={imageUploadData.tags}
                      onChange={handleImageInputChange}
                      placeholder="Separate tags with commas"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Upload Button */}
                  <button
                    type="submit"
                    disabled={uploadingImage || !imageFile}
                    className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image for User"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {!showPendingTab && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Balance</th>
                  <th className="px-4 py-3 text-left">Expertise</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Account Type</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.balance} ETH</td>
                      <td className="px-4 py-3 capitalize">
                        {user.expertise_level}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.accountStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.accountType === "real"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {user.accountType === "real"
                            ? "Real Account"
                            : "Bot Account"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Total Users: <strong>{filteredUsers.length}</strong>
          </div>
        </div>
      )}

      {/* Pending Uploads Tab */}
      {showPendingTab && (
        <div>
          {loadingPending ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading pending uploads...</p>
            </div>
          ) : pendingUploads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No pending uploads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUploads.map((upload) => (
                <div
                  key={upload._id}
                  className="p-6 bg-white border rounded-lg shadow hover:shadow-lg transition"
                >
                  <div className="grid grid-cols-4 gap-6">
                    {/* Image Thumbnail */}
                    <div>
                      <img
                        src={upload.imageUrl}
                        alt={upload.title}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                    </div>

                    {/* Upload Details */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-bold mb-2">{upload.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {upload.description || "No description"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Seller:</span>{" "}
                          {upload.sellerId?.name}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span>{" "}
                          {upload.priceEth} ETH
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {upload.category}
                        </div>
                        <div>
                          <span className="font-medium">Gas Fee:</span>{" "}
                          {upload.gasFee} ETH
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Uploaded:</span>{" "}
                          {new Date(upload.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleApproveUpload(upload._id)}
                        disabled={approvingId === upload._id}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition text-sm font-medium"
                      >
                        {approvingId === upload._id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <div>
                        <textarea
                          placeholder="Decline reason (optional)"
                          value={declineReason[upload._id] || ""}
                          onChange={(e) =>
                            setDeclineReason((prev) => ({
                              ...prev,
                              [upload._id]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 text-xs border rounded-lg mb-1"
                          rows="2"
                        />
                        <button
                          onClick={() => handleDeclineUpload(upload._id)}
                          disabled={decliningId === upload._id}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition text-sm font-medium"
                        >
                          {decliningId === upload._id
                            ? "Declining..."
                            : "Decline"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
