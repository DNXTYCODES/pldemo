import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import AdminPageGuide from "../components/AdminPageGuide";

const defaultCategories = [
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

const usageRightsOptions = [
  { value: "personal_use", label: "Personal Use" },
  { value: "commercial_use", label: "Commercial Use" },
  { value: "both", label: "Personal + Commercial" },
];

const licenseTypes = [
  { value: "non-exclusive", label: "Non-exclusive" },
  { value: "exclusive", label: "Exclusive" },
];

const MassUpload = ({ token }) => {
  const [uploads, setUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categories/image`);
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error("Unable to load categories:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/users/admin/all-users`,
          {
            headers: { token },
          },
        );

        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          toast.error(response.data.message || "Unable to load users");
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchCategories();
    fetchUsers();
  }, [token]);

  // Update default category in existing uploads when categories load
  useEffect(() => {
    if (categories.length > 0 && uploads.length > 0) {
      setUploads((prev) =>
        prev.map((item) => ({
          ...item,
          category: item.category || categories[0],
        })),
      );
    }
  }, [categories]);

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files).slice(0, 10);
    const mapped = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      title: "",
      description: "",
      priceEth: "",
      category: categories[0] || "",
      tags: "",
      usageRights: "personal_use",
      licenseType: "non-exclusive",
      userId: users[0]?._id || "",
    }));
    setUploads(mapped);
  };

  const updateItem = (index, key, value) => {
    setUploads((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const removeUpload = (index) => {
    setUploads((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const resetForm = () => {
    uploads.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });
    setUploads([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!uploads.length) {
      return toast.error("Please select at least one image to upload.");
    }

    for (let i = 0; i < uploads.length; i += 1) {
      const item = uploads[i];
      if (!item.title || !item.priceEth || !item.category || !item.userId) {
        return toast.error(
          `Please complete title, price, category, and uploader for item #${i + 1}`,
        );
      }
    }

    const formData = new FormData();
    uploads.forEach((item) => {
      formData.append("images", item.file);
    });

    const metadata = uploads.map((item) => ({
      title: item.title,
      description: item.description,
      priceEth: item.priceEth,
      category: item.category,
      tags: item.tags,
      usageRights: item.usageRights,
      licenseType: item.licenseType,
      userId: item.userId,
    }));

    formData.append("metadata", JSON.stringify(metadata));

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${backendUrl}/api/images/admin/mass-upload`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
      } else {
        toast.error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Upload failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Mass Upload Images
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Upload up to 10 images at once and enter metadata for each image.
            Select the uploader for each image and see their current image count
            and specialty.
          </p>
        </div>

        <AdminPageGuide
          title="Mass Upload overview"
          overview="Upload multiple images in one batch, assign each file its own metadata and uploader, and submit them all at once for faster catalog creation."
          modalTitle="Mass Upload Guide"
          sections={[
            {
              heading: "Select images",
              content:
                "Choose up to 10 image files at once and preview them before entering metadata.",
            },
            {
              heading: "Fill metadata",
              content:
                "For each image, set title, description, price, category, tags, usage rights, license type, and uploader.",
            },
            {
              heading: "Submit batch",
              content:
                "Once all uploads are complete and required fields are filled, submit the batch to upload all images together.",
            },
          ]}
        />

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Select images (max 10)
          </label>
          <input
            onChange={handleFilesChange}
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-2 text-sm text-gray-500">
            Each image can be assigned a different uploader and metadata.
          </p>
        </div>

        {uploads.length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {uploads.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-72">
                    <div className="rounded-xl overflow-hidden border border-dashed border-gray-300 bg-gray-50">
                      <img
                        src={item.preview}
                        alt={`Upload preview ${index + 1}`}
                        className="object-cover w-full h-60"
                      />
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      {item.file.name} ·{" "}
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Image #{index + 1}
                      </h2>
                      <button
                        type="button"
                        onClick={() => removeUpload(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          Title
                        </span>
                        <input
                          value={item.title}
                          onChange={(e) =>
                            updateItem(index, "title", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter image title"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          Price (ETH)
                        </span>
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          value={item.priceEth}
                          onChange={(e) =>
                            updateItem(index, "priceEth", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="0.05"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          Category
                        </span>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            updateItem(index, "category", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Select category</option>
                          {(categories.length
                            ? categories
                            : defaultCategories
                          ).map((categoryOption) => (
                            <option key={categoryOption} value={categoryOption}>
                              {categoryOption}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          Tags
                        </span>
                        <input
                          value={item.tags}
                          onChange={(e) =>
                            updateItem(index, "tags", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="landscape, sunset"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          Usage Rights
                        </span>
                        <select
                          value={item.usageRights}
                          onChange={(e) =>
                            updateItem(index, "usageRights", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {usageRightsOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          License Type
                        </span>
                        <select
                          value={item.licenseType}
                          onChange={(e) =>
                            updateItem(index, "licenseType", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {licenseTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-medium text-gray-900">
                        Description
                      </span>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Optional description"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-gray-900">
                        Uploading Photographer
                      </span>
                      <select
                        value={item.userId}
                        onChange={(e) =>
                          updateItem(index, "userId", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select uploader</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} · {user.ownedImagesCount} images ·{" "}
                            {user.photography_specialty?.join(", ") ||
                              "No specialty"}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Total images:{" "}
                <span className="font-semibold">{uploads.length}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {submitting ? "Uploading..." : "Submit Mass Upload"}
              </button>
            </div>
          </form>
        )}

        {!uploads.length && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
            No images selected yet. Choose up to 10 images to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default MassUpload;
