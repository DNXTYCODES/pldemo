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
    <div className="text-center">
      <p className="prata-regular text-2xl font-medium text-gray-800 text-amber-600">
        Stay Inspired with Peak Lens
      </p>
      <p className="text-gray-600 mt-3">
        Subscribe to our newsletter and be the first to discover exclusive photography releases, featured artists, limited edition NFTs, and behind-the-scenes insights from Peak Lens Photography. Join our community of photography enthusiasts and collectors!
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-gray-300 pl-3 rounded-lg overflow-hidden"
      >
        <input
          className="w-full sm:flex-1 outline-none text-gray-900 bg-transparent py-3"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-10 py-3 transition-colors font-medium"
          disabled={loading}
        >
          {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
        </button>
      </form>
      {message && <p className="text-gray-600 mt-2">{message}</p>}
    </div>
  );
};

export default NewsletterBox;
