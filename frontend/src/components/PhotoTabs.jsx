import React, { useState } from "react";

const PhotoTabs = () => {
  const [activeTab, setActiveTab] = useState("explore");

  // Sample category data for "For You" tab
  const categories = [
    {
      id: 1,
      name: "Landscape",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop",
    },
    {
      id: 2,
      name: "Seascape",
      image:
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&h=500&fit=crop",
    },
    {
      id: 3,
      name: "Street Photography",
      image:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=500&fit=crop",
    },
    {
      id: 4,
      name: "Portrait",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    },
    {
      id: 5,
      name: "Wildlife",
      image:
        "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=500&h=500&fit=crop",
    },
    {
      id: 6,
      name: "Macro",
      image:
        "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=500&h=500&fit=crop",
    },
    {
      id: 7,
      name: "Architecture",
      image:
        "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&h=500&fit=crop",
    },
    {
      id: 8,
      name: "Nature",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop",
    },
  ];

  // Sample trending photos
  const trendingPhotos = [
    {
      id: 1,
      title: "Sunset Over Mountains",
      artist: "John Doe",
      image:
        "https://images.unsplash.com/photo-1495854035989-cebdf40d5e6d?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Urban Reflections",
      artist: "Jane Smith",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Ocean Waves",
      artist: "Mike Johnson",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Forest Path",
      artist: "Sarah Lee",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop",
    },
    {
      id: 5,
      title: "City Lights",
      artist: "Alex Chen",
      image:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Desert Dunes",
      artist: "Emma Martinez",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    },
  ];

  // Sample recent photos
  const recentPhotos = [
    {
      id: 1,
      title: "Golden Hour",
      artist: "Tom Wilson",
      image:
        "https://images.unsplash.com/photo-1495854035989-cebdf40d5e6d?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Arctic Aurora",
      artist: "Lisa White",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Autumn Colors",
      artist: "David Brown",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Misty Landscapes",
      artist: "Rachel Green",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Urban Geometry",
      artist: "Chris Taylor",
      image:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Tropical Paradise",
      artist: "Nina Patel",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <style>{`
                .category-image {
                    transition: filter 0.3s ease;
                    filter: blur(8px);
                }
                .category-card:hover .category-image {
                    filter: blur(0px);
                }
            `}</style>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center border-b border-gray-200">
          {/* Explore Tab - FIRST/DEFAULT */}
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "explore"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            aria-label="Explore all photography"
            role="tab"
            aria-selected={activeTab === "explore"}
          >
            Explore
          </button>

          {/* For You Tab */}
          <button
            onClick={() => setActiveTab("for-you")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "for-you"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            aria-label="View categories"
            role="tab"
            aria-selected={activeTab === "for-you"}
          >
            For You
          </button>

          {/* Trending Tab */}
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "trending"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            aria-label="View trending photography"
            role="tab"
            aria-selected={activeTab === "trending"}
          >
            Trending
          </button>

          {/* Recently Added Tab */}
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === "recent"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            aria-label="Browse recent uploads"
            role="tab"
            aria-selected={activeTab === "recent"}
          >
            Recently Added
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {/* Explore Tab */}
        {activeTab === "explore" && (
          <div className="max-w-7xl mx-auto px-4 py-12" role="tabpanel">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore</h2>
            <p className="text-gray-600 mb-8">
              Discover exceptional photography from talented artists around the
              world.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg overflow-hidden bg-gray-100 h-48"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* For You Tab */}
        {activeTab === "for-you" && (
          <div className="max-w-7xl mx-auto px-4 py-12" role="tabpanel">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Photography Categories
            </h2>
            <p className="text-gray-600 mb-8">Hover to reveal each category</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card rounded-lg overflow-hidden bg-gray-100 h-48 relative"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <h3 className="text-white font-semibold text-center text-sm md:text-base">
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === "trending" && (
          <div className="max-w-7xl mx-auto px-4 py-12" role="tabpanel">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trending This Week
            </h2>
            <p className="text-gray-600 mb-8">
              Most viewed and loved photography right now
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-lg overflow-hidden bg-gray-100 h-48"
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Added Tab */}
        {activeTab === "recent" && (
          <div className="max-w-7xl mx-auto px-4 py-12" role="tabpanel">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Recently Added
            </h2>
            <p className="text-gray-600 mb-8">
              Latest uploads from our community of photographers
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-lg overflow-hidden bg-gray-100 h-48"
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoTabs;
