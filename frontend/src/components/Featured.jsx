import React from 'react';
import { assets } from '../assets/assets';

const FeaturedSection = () => {
  const featuredWatches = [
    {
      id: 1,
      name: 'ROLEX',
      video: assets.rolex, // Replace with your video path
      logo: assets.rolex_img, // Add the corresponding logo path
    },
    {
      id: 2,
      name: 'PANERAI',
      video: assets.panerai,
      logo: assets.panerai_img,
    },
  ];

  const otherBrands = [
    { id: 1, name: 'OMEGA', logo: assets.omega },
    { id: 2, name: 'HUBLOT', logo: assets.hublot },
    { id: 3, name: 'CARTIER', logo: assets.cartier_img },
    { id: 4, name: 'BREITLING', logo: assets.breitling },
    { id: 5, name: 'TAG HEUER', logo: assets.tagheuer_img },
    { id: 6, name: 'PATEK PHILIPPE', logo: assets.patek1 },
    { id: 7, name: 'AUDEMARS PIGUET', logo: assets.ap1 },
  ];

  return (
    <div className="py-16 px-6">
      <h2 className="prata-regular text-3xl font-bold text-center mb-10 bg-golden-brown bg-clip-text text-transparent bg-to-b">
        Featured Watches
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredWatches.map((watch) => (
          <div
            key={watch.id}
            className="relative group border border-gray-700 rounded-md shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <video
              src={watch.video}
              alt={`${watch.name}-luxury-wristwatch`}
              className="w-49 aspect-square object-cover"
              // controls
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-300">
              {/* You can add a button here if needed */}
            </div>
            {/* Brand Logo and Name Overlay */}
            <div
              className="absolute bottom-2 left-2 flex items-center bg-black bg-opacity-50 px-3 py-1 rounded-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img
                src={watch.logo}
                alt={`${watch.name}-luxury-wristwatch`}
                style={{ width: '30px', height: '30px', objectFit: 'contain' }}
              />
              <span className="text-lg font-semibold text-white">{watch.name}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="prata-regular text-2xl font-bold text-center mt-16 mb-10 bg-golden-brown bg-clip-text text-transparent bg-to-b">
        Other Watch Brands
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {otherBrands.map((brand) => (
          <div
            key={brand.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              justifyContent: 'space-between',
            }}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '12px' }}
            />
            <span
              className="bg-golden-brown bg-clip-text text-transparent bg-to-b"
              style={{ fontSize: '16px', fontWeight: 'bold' }}
            >
              {brand.name}
            </span>
          </div>
        ))}
      </div>
      <a href='/collection' className='underline decoration-gray-700 bg-golden-brown bg-clip-text text-transparent bg-to-b'>view more</a>
    </div>
  );
};

export default FeaturedSection;