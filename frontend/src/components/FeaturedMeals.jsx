import React from "react";
import { assets } from "../assets/assets"; // Make sure this path is correct

const FeaturedMeals = () => {
  // Nigerian meal data with image assets
  const featuredMeals = [
    {
      id: 1,
      name: "Jollof Rice",
      description:
        "Our signature spicy tomato rice cooked with fresh peppers, onions, and traditional spices.",
      price: "₦2,500",
      // popular: true,
      image: assets.menu1,
    },
    {
      id: 2,
      name: "Pounded Yam & Egusi",
      description:
        "Smooth pounded yam served with rich egusi soup packed with assorted meats and fish.",
      price: "₦3,200",
      image: assets.menu2,
    },
    {
      id: 3,
      name: "Suya Platter",
      description:
        "Grilled spicy beef skewers served with fresh onions, tomatoes, and our special yaji spice.",
      price: "₦2,800",
      popular: true,
      image: assets.menu3,
    },
    // {
    //   id: 4,
    //   name: "Moi Moi",
    //   description: "Steamed bean pudding made with fresh peppers, onions, and fish - a protein-packed delight.",
    //   price: "₦1,800",
    //   image: assets.mm // Replace with actual asset if available
    // }
  ];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="prata-regular text-4xl md:text-5xl text-[#008753] mb-4">
            Featured Nigerian Delicacies
          </h2>
          <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
          <p className="mt-6 max-w-2xl mx-auto text-gray-700">
            Taste authentic flavors from across Africa and the Carribean.
            Prepared fresh daily with traditional recipes. <br />
            P.S: for real time Prices, check the{" "}
            <a
              href="/menu"
              className="text-[blue]"
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Menu
            </a>
          </p>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-[#008753]/20"
            >
              {/* Popular badge */}
              {meal.popular && (
                <div className="absolute bg-[#008753] text-white px-4 py-1 rounded-bl-lg font-bold z-10">
                  Most Popular
                </div>
              )}

              {/* Meal Image */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              {/* Meal Details */}
              {/* <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="prata-regular text-2xl text-[#008753]">
                    {meal.name}
                  </h3>
                </div>
                <p className="mt-3 mb-4 text-gray-600">
                  {meal.description}
                </p>
              </div> */}
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors">
            View Full Menu
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMeals;

// import React from 'react';

// const FeaturedMeals = () => {
//   // Sample Nigerian meal data
//   const featuredMeals = [
//     {
//       id: 1,
//       name: "Jollof Rice",
//       description: "Our signature spicy tomato rice cooked with fresh peppers, onions, and traditional spices.",
//       price: "₦2,500",
//       popular: true
//     },
//     {
//       id: 2,
//       name: "Pounded Yam & Egusi",
//       description: "Smooth pounded yam served with rich egusi soup packed with assorted meats and fish.",
//       price: "₦3,200"
//     },
//     {
//       id: 3,
//       name: "Suya Platter",
//       description: "Grilled spicy beef skewers served with fresh onions, tomatoes, and our special yaji spice.",
//       price: "₦2,800",
//       popular: true
//     },
//     {
//       id: 4,
//       name: "Moi Moi",
//       description: "Steamed bean pudding made with fresh peppers, onions, and fish - a protein-packed delight.",
//       price: "₦1,800"
//     }
//   ];

//   return (
//     <section className="py-12 px-4 bg-amber-50">
//       <div className="max-w-6xl mx-auto">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl md:text-5xl text-[#008753] mb-4">
//             Featured Nigerian Delicacies
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Taste authentic flavors from across Nigeria. Prepared fresh daily with traditional recipes.
//           </p>
//         </div>

//         {/* Meal Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {featuredMeals.map((meal) => (
//             <div
//               key={meal.id}
//               className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-[#008753]/20"
//             >
//               {/* Popular badge */}
//               {meal.popular && (
//                 <div className="absolute bg-[#008753] text-white px-4 py-1 rounded-bl-lg font-bold">
//                   Most Popular
//                 </div>
//               )}

//               {/* Meal Image Placeholder */}
//               <div className="h-48 bg-gradient-to-r from-[#008753]/10 to-[#F5B041]/20 relative">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 border-[#008753]" />
//                 </div>
//               </div>

//               {/* Meal Details */}
//               <div className="p-6">
//                 <div className="flex justify-between items-start">
//                   <h3 className="prata-regular text-2xl text-[#008753]">
//                     {meal.name}
//                   </h3>
//                   <span className="text-xl font-bold text-[#008753]">
//                     {meal.price}
//                   </span>
//                 </div>
//                 <p className="mt-3 mb-4 text-gray-600">
//                   {meal.description}
//                 </p>
//                 <button className="w-full py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors">
//                   Add to Order
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* View All Button */}
//         <div className="text-center mt-12">
//           <button className="px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors">
//             View Full Menu
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeaturedMeals;
