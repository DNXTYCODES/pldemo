import React, { useState } from "react";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Subscription successful! 🎉");
        setEmail(""); // Clear input after success
      } else {
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-6">
          Stay Updated
        </h2>

        {/* Form Container */}
        <div className="flex justify-center">
          <div className="w-full max-w-[500px]">
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to our newsletter and be the first to discover exclusive
              photography releases, featured artists, and limited edition NFTs.
            </p>
            <form
              onSubmit={onSubmitHandler}
              className="w-full flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden"
            >
              <input
                className="w-full flex-1 outline-none text-gray-900 bg-transparent px-3 py-2 text-sm"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-6 py-2 transition-colors font-medium whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
              </button>
            </form>
            {message && <p className="text-gray-600 text-sm mt-2">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterBox;
