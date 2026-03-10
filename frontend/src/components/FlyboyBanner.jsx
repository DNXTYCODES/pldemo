import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";

const FlyboyBanner = () => {
  // Array of background images
  const images = [
    assets.customslogo,
    assets.about_img, // Replace with your image paths
    assets.customs,
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set up interval for slideshow
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500); // Change image every 5 seconds

    return () => clearInterval(interval); // Clean up on component unmount
  }, [images.length]);

  return (
    <>
      <h2 className="prata-regular text-3xl font-bold text-center mb-10 bg-golden-brown bg-clip-text text-transparent bg-to-b">
        Flyboy Franchise
      </h2>

      <div className="relative bg-black border border-gray-900 rounded-xl overflow-hidden">
        {/* Background Image Slideshow */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${images[currentImageIndex]})`,
            opacity: 1, // Fade-in effect
          }}
        ></div>

        {/* Overlay for Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white py-20 px-6 md:px-16 lg:py-32">
          <h2 className="text-4xl font-bold text-golden-brown uppercase tracking-wider">
            Luxury Watches, Redefined Elegance
          </h2>

          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            At Flyboy, luxury transcends time. Discover our curated selection of
            exquisite watches, crafted for those who appreciate timeless
            elegance. And because sophistication knows no bounds, elevate your
            drive with our premium car detailing services—where precision and
            care redefine perfection.
          </p>
          <button className="mt-8 bg-golden-brown text-black text-lg font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-yellow-500 hover:shadow-2xl transition duration-300">
            <a
              href="https://flyboycustoms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800"
            >
              Check Us Out!
            </a>
          </button>
        </div>
      </div>
    </>
  );
};

export default FlyboyBanner;
