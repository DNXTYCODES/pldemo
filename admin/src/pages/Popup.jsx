import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import AdminPageGuide from "../components/AdminPageGuide";

const Popup = ({ token }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/popup`);
        setMessage(response.data.popup);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPopup();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${backendUrl}/api/popup`,
        { message },
        { headers: { token } },
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Global Popup Message
        </h1>
        <p className="text-gray-600">
          Manage popup notifications shown to all visitors
        </p>
      </div>

      <AdminPageGuide
        title="Popup Message overview"
        overview="Create and update the global popup message that visitors see across the site. This page lets you write a timely announcement, save it, or clear it entirely."
        modalTitle="Popup Message Guide"
        sections={[
          {
            heading: "Set the popup message",
            content:
              "Use the textarea to type the announcement you want every visitor to see.",
          },
          {
            heading: "Save or clear",
            content:
              "Save changes to publish the popup immediately, or clear it to disable the announcement.",
          },
          {
            heading: "Use cases",
            content:
              "Use this for promotions, site updates, temporary alerts, or important notices.",
          },
        ]}
      />

      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Popup Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your popup message here. This will appear as a notification to all visitors."
            className="w-full h-40 sm:h-48 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Characters: {message.length}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 font-medium transition-all"
          >
            {loading ? "Saving..." : "✓ Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all"
          >
            Clear Message
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg mb-6">
            <p className="text-green-700 font-medium">
              ✓ Popup updated successfully!
            </p>
            <p className="text-green-600 text-sm mt-1">
              The message will appear on all pages.
            </p>
          </div>
        )}
      </form>

      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 max-w-4xl">
        <h3 className="font-bold text-blue-900 mb-3 text-lg">How it works:</h3>
        <ul className="list-disc pl-5 space-y-2 text-blue-800 text-sm sm:text-base">
          <li>This message will appear on every page of your website</li>
          <li>Visitors will see it once per session</li>
          <li>Leave empty to disable the popup</li>
          <li>Use for important announcements and promotions</li>
        </ul>
      </div>
    </div>
  );
};

export default Popup;
