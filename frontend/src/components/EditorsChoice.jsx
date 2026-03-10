import React from "react";
import { Link } from "react-router-dom";

const EditorsChoice = () => {
  const editorsChoicePhotos = [
    {
      id: 1,
      title: "Quiet Beach",
      artist: "Enric Ferragut",
      image:
        "https://drscdn.500px.org/photo/1117548621/q%3D75_m%3D600/v2?sig=d3fcc744eadd5715351ef9991c1d072773933aa2bccb5c539bf5b0699b051418",
      badge: "Ambassador's Pick",
    },
    {
      id: 2,
      title: "Cottontail",
      artist: "Riccardo Portigliatti",
      image:
        "https://drscdn.500px.org/photo/1117604932/q%3D75_m%3D600/v2?sig=9f56b341c693ae0f78b58d45d7b7e9f827d7072f11ace373a948818ed8818b10",
      badge: "Ambassador's Pick",
    },
    {
      id: 3,
      title: "The Ray of Light",
      artist: "Arseny Kashkarov",
      image:
        "https://drscdn.500px.org/photo/1117474243/q%3D75_m%3D600/v2?sig=68303b28d351669367ed4b1f64c2032801a08f78cb7f165327c4a62194e3b65a",
      badge: "Ambassador's Pick",
    },
    {
      id: 4,
      title: "The Flow of Silence",
      artist: "Thomas de Franzoni",
      image:
        "https://drscdn.500px.org/photo/1117461991/q%3D75_m%3D600_k%3D1/v2?sig=f0a1c5eeaec210f663ae1226efb297af185ecc8917271852c22641da2e8f95ed",
      badge: "Ambassador's Pick",
    },
    {
      id: 5,
      title: "Patagonia in Season",
      artist: "Murphy Osborne",
      image:
        "https://drscdn.500px.org/photo/1121252245/q%3D75_m%3D600/v2?sig=b2083ec97cd58287a0e5123a494d179e8cca1364452cef5b53c8affe308c4a71",
      badge: "Ambassador's Pick",
    },
    {
      id: 6,
      title: "Evening City Lights",
      artist: "Svetlana Povarova Ree",
      image:
        "https://drscdn.500px.org/photo/1117480406/q%3D75_m%3D600/v2?sig=1fd3b6a436a5ae56f3e4463d64cef6984dfe26a2dcc40b8db0d0f416b25041e0",
      badge: "Ambassador's Pick",
    },
    {
      id: 7,
      title: "October...",
      artist: "Ed Gordeev",
      image:
        "https://drscdn.500px.org/photo/1117578831/q%3D75_m%3D600/v2?sig=e64579eba23e63d24a8f1e25fa22bfd809d723ef2acb596f2deb944c135ad525",
      badge: "Ambassador's Pick",
    },
    {
      id: 8,
      title: "Scenic Waterfall",
      artist: "Neo Virus",
      image:
        "https://drscdn.500px.org/photo/1121238340/q%3D75_m%3D600/v2?sig=33037ef670d404a00de8b8c2cf2d44085591ae9b574d43df1a66c8652c43b953",
      badge: "Ambassador's Pick",
    },
    {
      id: 9,
      title: "Into the Light",
      artist: "Andy Dauer",
      image:
        "https://drscdn.500px.org/photo/1121422165/q%3D75_m%3D600/v2?sig=bbec7f3a6cd52be346ec85b7bf3583e0eeca8a475c147b153c0049b524828b6d",
      badge: "Ambassador's Pick",
    },
    {
      id: 10,
      title: "Street Lamp Winter",
      artist: "Anna Koszewska",
      image:
        "https://drscdn.500px.org/photo/1121390180/q%3D75_m%3D600/v2?sig=2713d1bd10c404e9d9b7b54712270694a7a5c8d46e99315be019d6301ae2cd7c",
      badge: "Ambassador's Pick",
    },
    {
      id: 11,
      title: "Berlin Spring",
      artist: "Matthias Kanisch",
      image:
        "https://drscdn.500px.org/photo/1121392881/q%3D75_m%3D600/v2?sig=bb87e32e60841b74362900ff03a5ad9b5dac905380e68ff13b128751a1db8319",
      badge: "Ambassador's Pick",
    },
    {
      id: 12,
      title: "River Derwent",
      artist: "Steve",
      image:
        "https://drscdn.500px.org/photo/1121393282/q%3D75_m%3D600/v2?sig=db93c25dab5503b24fbc8eee79936df04bbbd67649b50fa920ff56194a5d3452",
      badge: "Ambassador's Pick",
    },
    {
      id: 13,
      title: "Come and Go",
      artist: "Berthedel",
      image:
        "https://drscdn.500px.org/photo/1121421416/q%3D75_m%3D600/v2?sig=fe7fee78a290627ef065ba49d131db065ba27fb94941d3a312009809728bb28e",
      badge: "Ambassador's Pick",
    },
    {
      id: 14,
      title: "Forest Canopy",
      artist: "John Smith",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop",
      badge: "Ambassador's Pick",
    },
    {
      id: 15,
      title: "Mountain Valley",
      artist: "Jane Doe",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      badge: "Ambassador's Pick",
    },
    {
      id: 16,
      title: "Desert Sunset",
      artist: "Mike Johnson",
      image:
        "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=400&h=400&fit=crop",
      badge: "Ambassador's Pick",
    },
  ];

  return (
    <div className="py-12 bg-white">
      <style>{`
        .editors-choice-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .editors-choice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .editors-choice-title-section p:first-child {
          font-size: 14px;
          font-weight: 400;
          color: #666;
          margin: 0 0 8px 0;
        }

        .editors-choice-title-section h2 {
          font-size: 28px;
          font-weight: 600;
          color: #222;
          margin: 0;
        }

        .editors-choice-view-all {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #222;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.3s;
        }

        .editors-choice-view-all:hover {
          opacity: 0.7;
        }

        .editors-choice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        @media (min-width: 1024px) {
          .editors-choice-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .editors-choice-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .editors-choice-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .editor-photo-card {
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
          aspect-ratio: 1;
          border-radius: 4px;
          cursor: pointer;
        }

        .editor-photo-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .editor-photo-card:hover img {
          transform: scale(1.05);
        }

        .editor-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.95);
          padding: 6px 12px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 2;
        }

        .editor-badge-icon {
          width: 16px;
          height: 16px;
          display: inline-block;
        }

        .editor-badge-text {
          font-size: 12px;
          font-weight: 500;
          color: #222;
        }

        .editor-photo-overlay {
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

        .editor-photo-card:hover .editor-photo-overlay {
          transform: translateY(0);
        }

        .editor-photo-overlay h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
        }

        .editor-photo-overlay p {
          margin: 0;
          font-size: 12px;
          color: #ccc;
        }
      `}</style>

      <div className="editors-choice-container">
        {/* Header Section */}
        <div className="editors-choice-header">
          <div className="editors-choice-title-section">
            <p>Editors' Choice</p>
            <h2>Photos hand-selected by the 500px team and ambassadors</h2>
          </div>

          <Link to="/editors" className="editors-choice-view-all">
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
        <div className="editors-choice-grid">
          {editorsChoicePhotos.map((photo) => (
            <div key={photo.id} className="editor-photo-card">
              <img src={photo.image} alt={photo.title} />

              {/* Badge */}
              <div className="editor-badge">
                <svg
                  className="editor-badge-icon"
                  viewBox="0 0 16 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0L10.4922 4.56977L15.6085 5.52786L12.0325 9.31023L12.7023 14.4721L8 12.24L3.29772 14.4721L3.96752 9.31023L0.391548 5.52786L5.50779 4.56977L8 0Z"
                    fill="#F69400"
                  ></path>
                </svg>
                <span className="editor-badge-text">{photo.badge}</span>
              </div>

              {/* Overlay on Hover */}
              <div className="editor-photo-overlay">
                <h4>{photo.title}</h4>
                <p>by {photo.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorsChoice;
