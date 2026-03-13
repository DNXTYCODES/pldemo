import React from 'react';

const DishLoader = ({ size = 'md', message = 'Preparing your meal...' }) => {
  // Size configuration
  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      spinner: 'w-14 h-14 border-2',
      icon: 'w-8 h-8',
      text: 'text-base'
    },
    md: {
      container: 'w-24 h-24',
      spinner: 'w-20 h-20 border-4',
      icon: 'w-12 h-12',
      text: 'text-lg'
    },
    lg: {
      container: 'w-32 h-32',
      spinner: 'w-28 h-28 border-4',
      icon: 'w-16 h-16',
      text: 'text-xl'
    }
  };
  
  const { container, spinner, icon, text } = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className={`relative ${container} mb-6`}>
        {/* Spinner */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div 
            className={`${spinner} rounded-full border-[#d97706] border-t-transparent animate-spin`}
          ></div>
        </div>
        
        {/* Camera Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className={`${icon} text-[#d97706] animate-pulse`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
      </div>
      
      <p className={`prata-regular ${text} text-[#d97706] text-center`}>
        {message}
      </p>
    </div>
  );
};

export default DishLoader;







































// import React from 'react';

// const DishLoader = ({ size = 'md', message = 'Preparing your meal...' }) => {
//   // Size configuration
//   const sizeConfig = {
//     sm: {
//       container: 'w-16 h-16',
//       plate: 'w-14 h-14 border-2',
//       utensils: 'w-6 h-6',
//       text: 'text-sm'
//     },
//     md: {
//       container: 'w-24 h-24',
//       plate: 'w-20 h-20 border-4',
//       utensils: 'w-10 h-10',
//       text: 'text-base'
//     },
//     lg: {
//       container: 'w-32 h-32',
//       plate: 'w-28 h-28 border-4',
//       utensils: 'w-14 h-14',
//       text: 'text-lg'
//     }
//   };
  
//   const { container, plate, utensils, text } = sizeConfig[size] || sizeConfig.md;

//   return (
//     <div className="flex flex-col items-center justify-center">
//       <div className={`relative ${container} mb-4`}>
//         {/* Plate */}
//         <div className={`absolute inset-0 rounded-full bg-white border-[#008753] ${plate} animate-spin`}></div>
        
//         {/* Spoon */}
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           <svg 
//             className={`${utensils} text-[#008753]`}
//             viewBox="0 0 24 24"
//             fill="currentColor"
//           >
//             <path d="M3,4v2c0,3.31 2.69,6 6,6c0.85,0 1.64,-0.26 2.28,-0.7l0.72,4.7H5v2h7v-2h-2l-0.78,-5.08C14.36,11.74 15.15,12 16,12c3.31,0 6,-2.69 6,-6V4H15v2c0,1.1 -0.9,2 -2,2c-1.1,0 -2,-0.9 -2,-2V4H3Z" />
//           </svg>
//         </div>
        
//         {/* Fork */}
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90">
//           <svg 
//             className={`${utensils} text-[#008753]`}
//             viewBox="0 0 24 24"
//             fill="currentColor"
//           >
//             <path d="M3,4v2c0,3.31 2.69,6 6,6c0.85,0 1.64,-0.26 2.28,-0.7l0.72,4.7H5v2h7v-2h-2l-0.78,-5.08C14.36,11.74 15.15,12 16,12c3.31,0 6,-2.69 6,-6V4H15v2c0,1.1 -0.9,2 -2,2c-1.1,0 -2,-0.9 -2,-2V4H3Z" />
//           </svg>
//         </div>
//       </div>
      
//       <p className={`prata-regular ${text} text-[#008753] text-center`}>
//         {message}
//       </p>
//     </div>
//   );
// };

// export default DishLoader;























// import React from 'react';

// const DishLoader = () => {
//   return (
//     <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
//       <div className="text-center">
//         <div className="relative w-24 h-24 mx-auto mb-6">
//           {/* Plate */}
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="w-20 h-20 rounded-full border-4 border-[#008753] border-t-transparent animate-spin"></div>
//           </div>
          
//           {/* Food Icon */}
//           <div className="absolute inset-0 flex items-center justify-center">
//             <svg 
//               className="w-12 h-12 text-[#008753] animate-pulse" 
//               viewBox="0 0 24 24" 
//               fill="none" 
//               stroke="currentColor" 
//               strokeWidth="2"
//             >
//               <path d="M12 22s7-4 7-10V5l-7-3-7 3v7c0 6 7 10 7 10z" />
//               <path d="M8 11h8" />
//               <path d="M12 15v-4" />
//             </svg>
//           </div>
//         </div>
        
//         <p className="prata-regular text-xl text-[#008753] mt-2">
//           Preparing your meal...
//         </p>
//       </div>
//     </div>
//   );
// };

// export default DishLoader;