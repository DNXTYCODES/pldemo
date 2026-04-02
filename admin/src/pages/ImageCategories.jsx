import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const ImageCategories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/categories/image`);
      if (response.data.success) {
        setCategories(response.data.categories || []);
      } else {
        toast.error(response.data.message || "Unable to load categories");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (event) => {
    event.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) {
      return toast.error("Enter a category name");
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/categories/image`,
        { name: trimmed },
        { headers: { token } },
      );

      if (response.data.success) {
        setNewCategory("");
        toast.success(response.data.message || "Category added");
        fetchCategories();
      } else {
        toast.error(response.data.message || "Unable to add category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to add category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Image Categories</h2>
        <p className="text-gray-500 mb-6">
          Add or review the available image categories that admins can assign when uploading images.
        </p>

        <form onSubmit={handleAddCategory} className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="new-category">
            New category
          </label>
          <input
            id="new-category"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New image category"
            className="w-full sm:max-w-md rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto rounded-lg bg-amber-500 px-5 py-3 text-white font-semibold shadow hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Category"}
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Available Categories</h3>
          <span className="text-sm text-gray-500">{categories.length} total</span>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading categories...</div>
        ) : categories.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((categoryName) => (
              <li
                key={categoryName}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800"
              >
                {categoryName}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No image categories configured.</div>
        )}
      </div>
    </div>
  );
};

export default ImageCategories;
