import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CommunityBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    {
      id: 0,
      title: "Why join the world's best photography community?",
      subtitle: "Compete & Get Recognized",
      description:
        "Join global contests, take on creative challenges, and showcase your talent. Improve your skills, gain exposure, and win exciting prizes with contests, challenges, and more.",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=500&fit=crop",
    },
    {
      id: 1,
      title: "Share Your Vision with the World",
      subtitle: "Build Your Photography Portfolio",
      description:
        "Showcase your best work to an audience of collectors and enthusiasts. Create a professional portfolio and connect with other photographers.",
      image: "https://500px.com/staticV2/media/explore_banner_1.982fdc43.jpg",
    },
    {
      id: 2,
      title: "Monetize Your Passion",
      subtitle: "Earn from Your Photography",
      description:
        "Sell your prints, licensing rights, and exclusive content. Turn your photography into a sustainable business.",
      image: "https://500px.com/staticV2/media/explore_banner_3.0c30259f.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1,
    );
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex flex-col md:flex-row rounded-lg overflow-hidden shadow-md bg-white border border-gray-200 min-h-80">
          {/* Image Section */}
          <div className="md:w-1/2">
            <img
              alt={currentBanner.title}
              src={currentBanner.image}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Content Section - Compact 500px Style */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {currentBanner.title}
            </h3>

            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
              {currentBanner.subtitle}
            </h4>

            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              {currentBanner.description}
            </p>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white font-medium text-sm rounded hover:bg-gray-800 transition-colors w-fit mb-5"
              role="button"
            >
              <span>Sign up for free</span>
            </Link>

            {/* Indicator Dots - Compact */}
            <div className="flex items-center gap-2">
              {banners.map((_, index) => (
                <div
                  key={index}
                  className={`transition-all ${
                    index === currentIndex
                      ? "w-5 h-1.5 bg-gray-900 rounded-full"
                      : "w-1.5 h-1.5 bg-gray-300 rounded-full"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows - Compact */}
          <button
            onClick={prevBanner}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full transition-colors z-10"
            aria-label="Previous banner"
          >
            <svg
              className="w-4 h-4 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full transition-colors z-10"
            aria-label="Next banner"
          >
            <svg
              className="w-4 h-4 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityBanner;
