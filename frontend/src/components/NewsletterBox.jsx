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
      const response = await fetch("https://flyboybackend.onrender.com/api/newsletter/subscribe", {
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
      <p className="prata-regular text-2xl font-medium text-gray-800 bg-golden-brown bg-clip-text text-transparent bg-to-b">
        Subscribe now to stay in the loop
      </p>
      <p className="text-gray-400 mt-3">
        Join our newsletter and be the first to discover exclusive offers, the
        latest arrivals, and insider news on the world of luxury watches. Sign
        up today and elevate your style with Flyboy!
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          className="w-full sm:flex-1 outline-none text-black"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-[#333333] text-white text-xs px-10 py-4"
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
