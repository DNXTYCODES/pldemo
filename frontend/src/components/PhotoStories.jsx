import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PhotoStories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    {
      id: 1,
      title: "Urban Exploration: Hidden Corners",
      description:
        "Discover the beauty in everyday urban landscapes, from forgotten alleyways to vibrant street art. This series captures the soul of the city through the lens of adventure.",
      author: "Marcus Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=300&fit=crop",
      ],
      likes: 1248,
    },
    {
      id: 2,
      title: "Desert Dreams: Golden Hours",
      description:
        "Experience the magical moments when sunlight transforms desert landscapes into golden ethereal scenes. A visual journey through arid beauty.",
      author: "Sofia Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1500595046891-49205e60bf9f?w=400&h=300&fit=crop",
      ],
      likes: 2156,
    },
    {
      id: 3,
      title: "Forest Whispers: Nature's Silence",
      description:
        "Find peace and serenity in the quiet embrace of ancient forests. A meditative collection showcasing nature's intricate beauty and timeless wisdom.",
      author: "Nina Petrov",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      ],
      likes: 1893,
    },
    {
      id: 4,
      title: "Ocean Moods: Waves & Wanderlust",
      description:
        "Dive into the ever-changing moods of the ocean. From calm waters at sunrise to dramatic storm waves, explore the dynamic nature of our seas.",
      author: "Alex Thomson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop",
      ],
      likes: 3021,
    },
    {
      id: 5,
      title: "Mountain Peaks: Summit Stories",
      description:
        "Journey to the highest points of Earth where sky meets stone. Witness breathtaking vistas and the triumph of human spirit at the edge of the world.",
      author: "James Mitchell",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      ],
      likes: 2743,
    },
    {
      id: 6,
      title: "Midnight Skies: Starlight Chronicles",
      description:
        "Explore the cosmos from earth as we capture the majesty of stars, constellations, and the infinite universe. A celestial adventure awaits.",
      author: "Luna Zhang",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop",
      ],
      likes: 2567,
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? stories.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentStory = stories[currentIndex];

  return (
    <div className="w-full py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Featured Photo Stories
            </h2>
            <p className="text-lg text-gray-600">
              Series of images that take you on a visual journey
            </p>
          </div>
          <Link
            to="/photo_stories"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>View All</span>
            <svg
              className="w-5 h-5"
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
          </Link>
        </div>

        {/* Story Carousel */}
        <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Images Section */}
            <div className="relative h-96 lg:h-full bg-gray-100 overflow-hidden">
              <div className="relative h-full">
                {currentStory.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      idx === currentIndex % currentStory.images.length
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${currentStory.title} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors z-10 shadow-md"
                aria-label="Previous story"
              >
                <svg
                  className="w-6 h-6 text-gray-900"
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
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors z-10 shadow-md"
                aria-label="Next story"
              >
                <svg
                  className="w-6 h-6 text-gray-900"
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

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {currentStory.images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex % currentStory.images.length
                        ? "w-6 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentStory.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {currentStory.description}
                </p>
              </div>

              {/* Author Info */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={currentStory.avatar}
                    alt={currentStory.author}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {currentStory.author}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {currentStory.likes.toLocaleString()} likes
                    </p>
                  </div>
                </div>

                {/* Story Dots Navigation */}
                <div className="flex items-center gap-3 pt-6 border-t">
                  {stories.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? "w-6 bg-gray-900"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to story ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoStories;
