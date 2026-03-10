import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import { Link } from "react-router-dom";
import DishLoader from "./DishLoader";

const BestSeller = () => {
  const { getAvailableProducts } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const availableProducts = await getAvailableProducts();
        const bestProducts = availableProducts.filter(item => item.bestseller);
        setBestSeller(bestProducts.slice(0, 5));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="prata-regular text-4xl text-[#008753] mb-4">
            Customer <span className="text-amber-600">Favorites</span>
          </h2>
          <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
          <p className="mt-6 max-w-2xl mx-auto text-gray-700">
            The dishes our customers love the most - tried, tested, and highly recommended
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 min-h-[400px]">
            <DishLoader size="lg" message="Loading customer favorites..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {bestSeller.map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
                    Bestseller
                  </div>
                  <ProductItem
                    id={item._id}
                    name={item.name}
                    image={item.image}
                    basePrice={item.basePrice}
                    inStock={item.inStock}
                    variations={item.variations}  // Added variations prop
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                to="/menu" 
                className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
              >
                Explore All Dishes
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BestSeller;






















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductItem from "./ProductItem";
// import { Link } from "react-router-dom";
// import DishLoader from "./DishLoader";

// const BestSeller = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         const bestProducts = availableProducts.filter(item => item.bestseller);
//         setBestSeller(bestProducts.slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Customer <span className="text-amber-600">Favorites</span>
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             The dishes our customers love the most - tried, tested, and highly recommended
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20 min-h-[400px]">
//             <DishLoader size="lg" message="Loading customer favorites..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
//               {bestSeller.map((item, index) => (
//                 <div key={index} className="relative">
//                   <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
//                     Bestseller
//                   </div>
//                   <ProductItem
//                     id={item._id}
//                     name={item.name}
//                     image={item.image}
//                     basePrice={item.basePrice}
//                     inStock={item.inStock}
//                   />
//                 </div>
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//               >
//                 Explore All Dishes
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;






















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductItem from "./ProductItem";
// import { Link } from "react-router-dom";
// import DishLoader from "./DishLoader";

// const BestSeller = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         const bestProducts = availableProducts.filter(item => item.bestseller);
//         setBestSeller(bestProducts.slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Customer <span className="text-amber-600">Favorites</span>
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             The dishes our customers love the most - tried, tested, and highly recommended
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Loading customer favorites..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
//               {bestSeller.map((item, index) => (
//                 <div key={index} className="relative">
//                   <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
//                     Bestseller
//                   </div>
//                   <ProductItem
//                     id={item._id}
//                     name={item.name}
//                     image={item.image}
//                     basePrice={item.basePrice}
//                     inStock={item.inStock}
//                   />
//                 </div>
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//               >
//                 Explore All Dishes
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;



















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductItem from "./ProductItem";
// import { Link } from "react-router-dom";
// import DishLoader from "./DishLoader";

// const BestSeller = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         const bestProducts = availableProducts.filter(item => item.bestseller);
//         setBestSeller(bestProducts.slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Customer <span className="text-amber-600">Favorites</span>
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             The dishes our customers love the most - tried, tested, and highly recommended
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Loading customer favorites..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
//               {bestSeller.map((item, index) => (
//                 <div key={index} className="relative">
//                   <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
//                     Bestseller
//                   </div>
//                   <ProductItem
//                     id={item._id}
//                     name={item.name}
//                     image={item.image}
//                     basePrice={item.basePrice}  // Changed from price to basePrice
//                     inStock={item.inStock}      // Added inStock prop
//                   />
//                 </div>
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//               >
//                 Explore All Dishes
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;



















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductItem from "./ProductItem";
// import { Link } from "react-router-dom";
// import DishLoader from "./DishLoader";

// const BestSeller = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         const bestProducts = availableProducts.filter(item => item.bestseller);
//         setBestSeller(bestProducts.slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Customer <span className="text-amber-600">Favorites</span>
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             The dishes our customers love the most - tried, tested, and highly recommended
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Loading customer favorites..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
//               {bestSeller.map((item, index) => (
//                 <div key={index} className="relative">
//                   <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
//                     Bestseller
//                   </div>
//                   <ProductItem
//                     id={item._id}
//                     name={item.name}
//                     image={item.image}
//                     price={item.price}
//                   />
//                 </div>
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//               >
//                 Explore All Dishes
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;



















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductItem from "./ProductItem";
// import { Link } from "react-router-dom";
// import DishLoader from "./DishLoader"; // Import the loader component

// const BestSeller = () => {
//   const { products } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);
//   const [loading, setLoading] = useState(true); // Add loading state

//   useEffect(() => {
//     // Simulate loading delay (replace with actual API call)
//     const timer = setTimeout(() => {
//       const bestProduct = products.filter((item) => item.bestseller);
//       setBestSeller(bestProduct.slice(0, 5));
//       setLoading(false);
//     }, 1500);
    
//     return () => clearTimeout(timer);
//   }, [products]);

//   return (
//     <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Customer <span className="text-amber-600">Favorites</span>
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             The dishes our customers love the most - tried, tested, and highly recommended
//           </p>
//         </div>

//         {/* Products Grid with Loader */}
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Loading customer favorites..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
//               {bestSeller.map((item, index) => (
//                 <div key={index} className="relative">
//                   {/* Bestseller Badge */}
//                   <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
//                     Bestseller
//                   </div>
//                   <ProductItem
//                     id={item._id}
//                     name={item.name}
//                     image={item.image}
//                     price={item.price}
//                   />
//                 </div>
//               ))}
//             </div>

//             {/* View More Button */}
//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//               >
//                 Explore All Dishes
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;


























// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import ProductItem from "./ProductItem";
// import { Link } from "react-router-dom";

// const BestSeller = () => {
//   const { products } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);

//   useEffect(() => {
//     const bestProduct = products.filter((item) => item.bestseller);
//     setBestSeller(bestProduct.slice(0, 5));
//   }, [products]);

//   return (
//     <div className="py-12 bg-gradient-to-b from-[#008753]/10 to-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Customer <span className="text-amber-600">Favorites</span>
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             The dishes our customers love the most - tried, tested, and highly recommended
//           </p>
//         </div>

//         {/* Products Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
//           {bestSeller.map((item, index) => (
//             <div key={index} className="relative">
//               {/* Bestseller Badge */}
//               <div className="absolute top-0 right-0 bg-[#008753] text-white px-3 py-1 rounded-bl-lg z-10">
//                 Bestseller
//               </div>
//               <ProductItem
//                 id={item._id}
//                 name={item.name}
//                 image={item.image}
//                 price={item.price}
//               />
//             </div>
//           ))}
//         </div>

//         {/* View More Button */}
//         <div className="text-center mt-12">
//           <Link 
//             to="/menu" 
//             className="inline-block px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors"
//           >
//             Explore All Dishes
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BestSeller;



























// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";

// const BestSeller = () => {
//   const { products } = useContext(ShopContext);
//   const [bestSeller, setBestSeller] = useState([]);

//   useEffect(() => {
//     const bestProduct = products.filter((item) => item.bestseller);
//     setBestSeller(bestProduct.slice(0, 5));
//   }, [products]);

//   return (
//     <div className="my-10">
//       <div className="text-center text-3xl py-8">
//         <Title text1={"BEST"} text2={"SELLERS"} />
//         <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-[white]">
//           {/* Explore our most sought-after timepieces, loved by watch enthusiasts worldwide. These best sellers combine enduring style, unmatched quality, and precision engineering, making them the perfect choice for those who appreciate the art of horology. */}
//           Discover our best-selling luxury watches, featuring iconic timepieces
//           from Rolex, Patek Philippe, Audemars Piguet, Omega, and more. These
//           highly sought-after models are celebrated for their timeless elegance,
//           investment value, and precision craftsmanship.
//         </p>
//         <p className="hidden">Top Luxury Watches | Collector’s Favorites | Iconic Timepieces </p>
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
//         {bestSeller.map((item, index) => (
//           <ProductItem
//             key={index}
//             id={item._id}
//             name={item.name}
//             image={item.image}
//             price={item.price}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;
