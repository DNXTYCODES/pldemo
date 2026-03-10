import React from "react";
import { Link } from "react-router-dom";

const PopularPhotos = () => {
  const popularPhotos = [
    {
      id: 1,
      title: "Sunset Over Mountains",
      artist: "John Doe",
      image:
        "https://images.unsplash.com/photo-1495854035989-cebdf40d5e6d?w=400&h=400&fit=crop",
      pulseRating: "98.5",
    },
    {
      id: 2,
      title: "Urban Reflections",
      artist: "Jane Smith",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
      pulseRating: "96.2",
    },
    {
      id: 3,
      title: "Ocean Waves",
      artist: "Mike Johnson",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
      pulseRating: "94.8",
    },
    {
      id: 4,
      title: "Forest Path",
      artist: "Sarah Lee",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop",
      pulseRating: "92.1",
    },
    {
      id: 5,
      title: "City Lights",
      artist: "Alex Chen",
      image:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=400&fit=crop",
      pulseRating: "90.7",
    },
    {
      id: 6,
      title: "Desert Dunes",
      artist: "Emma Martinez",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      pulseRating: "89.3",
    },
    {
      id: 7,
      title: "Mountain Peak",
      artist: "David Brown",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      pulseRating: "87.9",
    },
    {
      id: 8,
      title: "Tropical Beach",
      artist: "Lisa White",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
      pulseRating: "86.5",
    },
  ];

  return (
    <div className="py-12 bg-white">
      <style>{`
        .popular-photos-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .popular-photos-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .popular-photos-title-section h3 {
          font-size: 14px;
          font-weight: 400;
          color: #666;
          margin: 0 0 8px 0;
        }

        .popular-photos-title-section h2 {
          font-size: 28px;
          font-weight: 600;
          color: #222;
          margin: 0;
        }

        .popular-photos-view-all {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #222;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.3s;
        }

        .popular-photos-view-all:hover {
          opacity: 0.7;
        }

        .popular-photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        @media (min-width: 1024px) {
          .popular-photos-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .popular-photos-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .popular-photos-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .photo-card {
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
          aspect-ratio: 1;
          border-radius: 4px;
          cursor: pointer;
        }

        .photo-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .photo-card:hover img {
          transform: scale(1.05);
        }

        .photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          color: white;
          padding: 16px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }

        .photo-card:hover .photo-overlay {
          transform: translateY(0);
        }

        .photo-overlay h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
        }

        .photo-overlay p {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #ccc;
        }

        .photo-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .rating-icon {
          width: 16px;
          height: 16px;
          display: inline-block;
        }
      `}</style>

      <div className="popular-photos-container">
        {/* Header Section */}
        <div className="popular-photos-header">
          <div className="popular-photos-title-section">
            <p>Popular Photos</p>
            <h2>New uploads with the highest Pulse rating</h2>
          </div>

          <Link to="/popular" className="popular-photos-view-all">
            <span>View All</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.88933 20C8.52962 19.9999 8.20537 19.7832 8.06772 19.4509C7.93008 19.1185 8.00614 18.736 8.26046 18.4816L14.7476 11.9945L8.26046 5.50744C7.92336 5.15842 7.92819 4.60364 8.27129 4.26053C8.6144 3.91742 9.16919 3.9126 9.51821 4.24969L16.6342 11.3657C16.9814 11.713 16.9814 12.2761 16.6342 12.6234L9.51821 19.7394C9.35143 19.9062 9.12522 19.9999 8.88933 20Z"
                fill="#222222"
              ></path>
            </svg>
          </Link>
        </div>

        {/* Photo Grid */}
        <div className="popular-photos-grid">
          {popularPhotos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.image} alt={photo.title} />
              <div className="photo-overlay">
                <h4>{photo.title}</h4>
                <p>by {photo.artist}</p>
                <div className="photo-rating">
                  <svg
                    className="rating-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  {photo.pulseRating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularPhotos;
