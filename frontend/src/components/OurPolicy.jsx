import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-around gap-8 text-center px-4">
          {/* Delivery Policy */}
          <div className="flex-1 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#008753]/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <img src={assets.fd} className="w-8" alt="Fast Delivery" />
            </div>
            <p className="font-semibold text-lg text-[#008753] mb-2">
              Fast Delivery
            </p>
            <p className="text-gray-600">
              Fresh meals delivered within 60 minutes
            </p>
          </div>

          {/* Quality Policy */}
          <div className="flex-1 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#008753]/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <img
                src={assets.quality_icon}
                className="w-8"
                alt="Quality Ingredients"
              />
            </div>
            <p className="font-semibold text-lg text-[#008753] mb-2">
              Premium Ingredients
            </p>
            <p className="text-gray-600">
              Locally sourced, authentic ingredients
            </p>
          </div>

          {/* Support Policy */}
          <div className="flex-1 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#008753]/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <img
                src={assets.support_icon2}
                className="w-8"
                alt="Customer Support"
              />
            </div>
            <p className="font-semibold text-lg text-[#008753] mb-2">
              24/7 Support
            </p>
            <p className="text-gray-600">Dedicated customer care team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;

// import React from 'react'
// import { assets } from '../assets/assets'

// const OurPolicy = () => {
//   return (
//     <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>

//       <div className=' pt-8 pb-8'>
//         <img src={assets.exchange_icon2} className='w-12 m-auto mb-5' alt="" />
//         <p className=' font-semibold bg-golden-brown bg-clip-text text-transparent bg-to-b'>Easy Exchange Policy</p>
//         <p className=' text-gray-400'>We offer hassle free  exchange policy</p>
//       </div>
//       <div className=' pt-8 pb-8'>
//         <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
//         <p className=' font-semibold bg-golden-brown bg-clip-text text-transparent bg-to-b'>7 Days Return Policy</p>
//         <p className=' text-gray-400'>We provide 7 days free return policy</p>
//       </div>
//       <div className=' pt-8 pb-8 '>
//         <img src={assets.support_icon2} className='w-12 m-auto mb-5' alt="" />
//         <p className=' font-semibold bg-golden-brown bg-clip-text text-transparent bg-to-b'>Best customer support</p>
//         <p className=' text-gray-400'>we provide 24/7 customer support</p>
//       </div>

//     </div>
//   )
// }

// export default OurPolicy
