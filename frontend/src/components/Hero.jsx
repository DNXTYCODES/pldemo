import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const slides = [
    {
      id: 0,
      href: "/collection",
      title: "Explore Gallery",
      backgroundStyle:
        "linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(51, 51, 51, 0.6) 100%)",
      backgroundImage:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&h=600&fit=crop",
    },
    {
      id: 1,
      href: "/collection",
      title: "Shop NFTs",
      backgroundStyle:
        "linear-gradient(135deg, rgba(42, 42, 42, 0.6) 0%, rgba(68, 68, 68, 0.6) 100%)",
      backgroundImage:
        "https://images.unsplash.com/photo-1620321503375-490c06e17d27?w=1200&h=600&fit=crop",
    },
    {
      id: 2,
      href: "/shop",
      title: "Shop Prints",
      backgroundStyle:
        "linear-gradient(135deg, rgba(42, 42, 42, 0.6) 0%, rgba(68, 68, 68, 0.6) 100%)",
      backgroundImage:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=600&fit=crop",
    },
    {
      id: 3,
      href: "/about",
      title: "Get Inspired",
      backgroundStyle:
        "linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(85, 85, 85, 0.6) 100%)",
      backgroundImage:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="sectionDiv w-full" style={{ position: "relative" }}>
      <div
        id="slideshowParentDiv"
        style={{
          position: "relative",
          width: "100%",
          height: "600px",
          overflow: "hidden",
        }}
      >
        {/* Slides Container */}
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
            to={slide.href}
            className="slideDiv"
            id={`slideshow${index}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: currentIndex === index ? "0%" : "-100%",
              zIndex: currentIndex === index ? 2 : 0,
              cursor: "pointer",
              transition: "left 0.8s ease-in-out",
              tabIndex: currentIndex === index ? 0 : -1,
              backgroundImage: `linear-gradient(135deg, rgba(26, 26, 26, 0.65) 0%, rgba(51, 51, 51, 0.65) 100%), url(${slide.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
            title={slide.title}
          >
            <div style={{ textAlign: "center", color: "white" }}>
              <h2
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  fontFamily: "Prata, serif",
                }}
              >
                {slide.title}
              </h2>
              <p style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                Discover Peak Lens Photography
              </p>
            </div>
          </Link>
        ))}

        {/* Left Arrow */}
        <button
          id="slideshowArrowLeftLink"
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          tabIndex="0"
          title="Previous Slide"
        >
          <img
            id="slideshowArrowLeft"
            className="slideshowArrow"
            src="/images/arrow-left.svg"
            alt="Previous Slide"
            style={{
              width: "40px",
              height: "40px",
              opacity: "0.7",
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "1")}
            onMouseLeave={(e) => (e.target.style.opacity = "0.7")}
          />
        </button>

        {/* Right Arrow */}
        <button
          id="slideshowArrowRightLink"
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          tabIndex="0"
          title="Next Slide"
        >
          <img
            id="slideshowArrowRight"
            className="slideshowArrow"
            src="/images/arrow-right.svg"
            alt="Next Slide"
            style={{
              width: "40px",
              height: "40px",
              opacity: "0.7",
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "1")}
            onMouseLeave={(e) => (e.target.style.opacity = "0.7")}
          />
        </button>

        {/* Square Indicators */}
        <div
          id="slideshowSquaresContainerDiv"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "12px",
            zIndex: 10,
          }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              id={`squareDiv[${index}]`}
              className={`slideSquare ${
                index === currentIndex ? "slideSquareSelected" : ""
              }`}
              onClick={() => goToSlide(index)}
              style={{
                width: "12px",
                height: "12px",
                background:
                  index === currentIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                border: "none",
                cursor: "pointer",
                transition: "background 0.3s ease",
                borderRadius: "2px",
              }}
              tabIndex="0"
              title={`Show Slide #${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

// import React, { useState, useEffect } from "react";
// import { assets } from "../assets/assets";
// import { Link, NavLink } from "react-router-dom";

// const Hero = () => {
//   const slides = [
//     { type: "image", src: assets.jollof, caption: "Our Signature Jollof Rice" },
//     { type: "image", src: assets.pe, caption: "Freshly Pounded Yam & Soup" },
//     { type: "image", src: assets.sp, caption: "Suya Platter with Spices" },
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [slides.length]);

//   return (
//     <div className="bg-gradient-to-r from-[#008753]/10 to-amber-50 rounded-3xl overflow-hidden">
//       <div className="flex flex-col md:flex-row">
//         {/* Left Content */}
//         <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
//           <div className="text-center md:text-left max-w-md">
//             <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
//               <div className="w-8 h-[2px] bg-[#008753]"></div>
//               <p className="font-medium text-sm text-[#008753]">
//                 EDIRIN CATHERING SOLUTIONS
//               </p>
//             </div>

//             <h1 className="prata-regular text-4xl md:text-5xl lg:text-6xl text-[#008753] mb-4 leading-tight">
//               AFRICAN <span className="text-black">/</span> <span className="text-amber-600">Carribean</span> Food
//             </h1>

//             <p className="text-gray-700 mb-8 text-lg">
//               Changing The Perspective Of Our Foods
//             </p>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//               <Link
//                 to="/orders"
//                 className="px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//               >
//                 <button>Order Now</button>
//               </Link>
//               <Link
//                 to="/menu"
//                 className="px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753]/10 transition-colors"
//               >
//                 <button>View Menu</button>{" "}
//               </Link>
//             </div>

//             <div className="mt-10 flex justify-center md:justify-start">
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-[#008753]"></div>
//                   <p className="text-sm">Fresh Ingredients</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-[#008753]"></div>
//                   <p className="text-sm">Traditional Recipes</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Slideshow */}
//         <div className="w-full md:w-1/2 h-[500px] relative">
//           {slides.map((slide, index) => (
//             <div
//               key={index}
//               className={`absolute inset-0 transition-opacity duration-1000 ${
//                 index === currentIndex ? "opacity-100" : "opacity-0"
//               }`}
//             >
//               <div className="relative h-full w-full">
//                 <img
//                   className="w-full h-full object-cover"
//                   src={slide.src}
//                   alt="Nigerian cuisine"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
//                   <p className="prata-regular text-white text-2xl text-center">
//                     {slide.caption}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Slide Indicators */}
//           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
//             {slides.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentIndex(index)}
//                 className={`w-3 h-3 rounded-full ${
//                   index === currentIndex ? "bg-[#008753]" : "bg-white/50"
//                 }`}
//                 aria-label={`Go to slide ${index + 1}`}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;

// import React, { useState, useEffect } from 'react';
// import { assets } from '../assets/assets';

// const Hero = () => {
//   const slides = [
//     { src: assets.a1, alt: "Latest iPhones in Nigeria" },
//     { src: assets.a12, alt: "Premium Laptops Collection" },
//     { src: assets.b6, alt: "Tech Accessories" },
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [slides.length]);

//   return (
//     <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden bg-gradient-to-r from-blue-900 to-purple-800 z-1">
//       {/* Text Overlay */}
//       <div className="absolute inset-0 z-10 flex items-center px-4 md:px-12 lg:px-24 text-white">
//         <div className="max-w-2xl space-y-4 md:space-y-6">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-1 bg-green-500"></div>
//             <p className="font-semibold text-sm md:text-lg">Nigeria's Leading Tech Store</p>
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold leading-tight">
//             Premium Gadgets & Tech Essentials
//           </h1>
//           <p className="text-lg md:text-xl">
//             Get the Latest Laptops, iPhones & Accessories at Best Prices
//           </p>
//           <div className="flex gap-4 mt-6">
//             <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-sm md:text-base transition-all">
//               Shop Now
//             </button>
//             <button className="border border-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-full text-sm md:text-base transition-all">
//               View Deals
//             </button>
//           </div>
//           <p className="text-sm mt-4 opacity-80">
//             ₦ Best Price Guarantee • 100% Genuine Products • Free Lagos Delivery
//           </p>
//         </div>
//       </div>

//       {/* Image Carousel */}
//       <div className="relative w-full h-full">
//         {slides.map((slide, index) => (
//           <div
//             key={index}
//             className={`absolute inset-0 transition-opacity duration-1000 ${
//               index === currentIndex ? 'opacity-100' : 'opacity-0'
//             }`}
//           >
//             <img
//               src={slide.src}
//               alt={slide.alt}
//               className="w-full h-full object-cover object-right"
//             />
//             {/* Gradient Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-800/50"></div>
//           </div>
//         ))}
//       </div>

//       {/* Carousel Dots */}
//       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => setCurrentIndex(index)}
//             className={`w-3 h-3 rounded-full transition-all ${
//               index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
//             }`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Hero;

// import React, { useState, useEffect } from 'react';
// import { assets } from '../assets/assets';

// const Hero = () => {
//   const slides = [
//     { type: 'image', src: assets.e1 }, // Replace with your video path
//     { type: 'image', src: assets.a12 }, // Replace with your first image path
//     { type: 'image', src: assets.b6 },  // Replace with your second image path
//   ];
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Automatically change slides every 3 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, [slides.length]);

//   return (
//     <div className="flex flex-col sm:flex-row border border-gray-700 rounded-3xl bg-golden-brown bg-clip-text text-transparent bg-to-b">
//       {/* Hero Left Side */}
//       <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
//         <div>
//           <div className="flex items-center gap-2">
//             <p className="w-8 md:w-11 h-[2px] bg-white"></p>
//             <p className="font-medium text-sm">TIMELESS ELEGANCE</p>
//           </div>
//           <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
//             LUXURY WATCHES
//           </h1>
//           <div className="flex items-center gap-2">
//             <p className="font-semibold text-sm md:text-base">EXCLUSIVE DESIGNS</p>
//             <p className="w-8 md:w-11 h-[1px] bg-white"></p>
//           </div>
//         </div>
//       </div>

//       {/* Hero Right Side - Slideshow */}
//       <div className="w-full sm:w-1/2 h-[500px] rounded-3xl relative overflow-hidden z-[0]">
//         {slides.map((slide, index) => (
//           <div
//             key={index}
//             className={`absolute w-full h-full transition-opacity duration-1000 ${
//               index === currentIndex ? 'opacity-100' : 'opacity-0'
//             }`}
//           >
//             {slide.type === 'video' ? (
//               <video
//                 className="w-full h-full object-cover rounded-3xl"
//                 src={slide.src}
//                 autoPlay
//                 loop
//                 muted
//               />
//             ) : (
//               <img
//                 className="w-full h-full object-cover rounded-3xl z-[0]"
//                 src={slide.src}
//                 alt="LUXURY WRISTWATCH with GOLD and DIAMOND accents"
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Hero;

// import React from 'react'
// import { assets } from '../assets/assets'

// const Hero = () => {
//   return (
//     <div className='flex flex-col sm:flex-row border rounded-3xl bg-golden-brown bg-clip-text text-transparent bg-to-b'>
//       {/* Hero Left Side */}
//       <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
//             <div>
//                 <div className='flex items-center gap-2'>
//                     <p className='w-8 md:w-11 h-[2px] bg-white'></p>
//                     <p className=' font-medium text-sm md:'>OUR BESTSELLERS</p>
//                 </div>
//                 <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>Latest Arrivals</h1>
//                 <div className='flex items-center gap-2'>
//                     <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
//                     <p className='w-8 md:w-11 h-[1px] bg-white'></p>
//                 </div>
//             </div>
//       </div>
//       {/* Hero Right Side */}
//       <img className='w-full sm:w-1/2 rounded-3xl' src={assets.b6} alt="" />
//     </div>
//   )
// }

// export default Hero
