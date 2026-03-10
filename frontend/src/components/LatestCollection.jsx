import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { Link } from 'react-router-dom';
import DishLoader from "./DishLoader";

const LatestCollection = () => {
  const { getAvailableProducts } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const availableProducts = await getAvailableProducts();
        // Sort by date (newest first) and take the first 10
        const sortedProducts = [...availableProducts].sort((a, b) => new Date(b.date) - new Date(a.date));
        setLatestProducts(sortedProducts.slice(0, 10));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="py-12 bg-amber-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="prata-regular text-4xl text-[#008753] mb-4">
            Our <span className="text-amber-600">Popular</span> Dishes
          </h2>
          <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
          <p className="mt-6 max-w-2xl mx-auto text-gray-700">
            Customer favorites - the most loved traditional dishes prepared with authentic recipes
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 min-h-[400px]">
            <DishLoader size="lg" message="Preparing our popular dishes..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {latestProducts.map((item, index) => (
                <ProductItem
                  key={index}
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  basePrice={item.basePrice}
                  inStock={item.inStock}
                  variations={item.variations}  // Added variations prop
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                to="/menu" 
                className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
              >
                View Full Menu
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LatestCollection;
























// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";
// import { Link } from 'react-router-dom';
// import DishLoader from "./DishLoader";

// const LatestCollection = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         // Sort by date (newest first) and take the first 10
//         const sortedProducts = [...availableProducts].sort((a, b) => new Date(b.date) - new Date(a.date));
//         setLatestProducts(sortedProducts.slice(0, 10));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Our <span className="text-amber-600">Popular</span> Dishes
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Customer favorites - the most loved traditional dishes prepared with authentic recipes
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20 min-h-[400px]">
//             <DishLoader size="lg" message="Preparing our popular dishes..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//               {latestProducts.map((item, index) => (
//                 <ProductItem
//                   key={index}
//                   id={item._id}
//                   image={item.image}
//                   name={item.name}
//                   basePrice={item.basePrice}
//                   inStock={item.inStock}
//                 />
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
//               >
//                 View Full Menu
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;



















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";
// import { Link } from 'react-router-dom';
// import DishLoader from "./DishLoader";

// const LatestCollection = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         const sortedProducts = [...availableProducts].sort((a, b) => b.date - a.date);
//         setLatestProducts(sortedProducts.slice(0, 10));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Our <span className="text-amber-600">Popular</span> Dishes
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Customer favorites - the most loved traditional dishes prepared with authentic recipes
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Preparing our popular dishes..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//               {latestProducts.map((item, index) => (
//                 <ProductItem
//                   key={index}
//                   id={item._id}
//                   image={item.image}
//                   name={item.name}
//                   basePrice={item.basePrice}
//                   inStock={item.inStock}
//                 />
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
//               >
//                 View Full Menu
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;






















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";
// import { Link } from 'react-router-dom';
// import DishLoader from "./DishLoader";

// const LatestCollection = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         // Sort by date (newest first) and take the first 10
//         const sortedProducts = [...availableProducts].sort((a, b) => b.date - a.date);
//         setLatestProducts(sortedProducts.slice(0, 10));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Our <span className="text-amber-600">Popular</span> Dishes
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Customer favorites - the most loved traditional dishes prepared with authentic recipes
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Preparing our popular dishes..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//               {latestProducts.map((item, index) => (
//                 <ProductItem
//                   key={index}
//                   id={item._id}
//                   image={item.image}
//                   name={item.name}
//                   basePrice={item.basePrice}  // Changed from price to basePrice
//                   inStock={item.inStock}       // Added inStock prop
//                 />
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
//               >
//                 View Full Menu
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";
// import { Link } from 'react-router-dom';
// import DishLoader from "./DishLoader";

// const LatestCollection = () => {
//   const { getAvailableProducts } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         setLatestProducts(availableProducts.slice(0, 10));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, []);

//   return (
//     <div className="py-12 bg-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Our <span className="text-amber-600">Popular</span> Dishes
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Customer favorites - the most loved traditional dishes prepared with authentic recipes
//           </p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Preparing our popular dishes..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//               {latestProducts.map((item, index) => (
//                 <ProductItem
//                   key={index}
//                   id={item._id}
//                   image={item.image}
//                   name={item.name}
//                   price={item.price}
//                 />
//               ))}
//             </div>

//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
//               >
//                 View Full Menu
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;






















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";
// import { Link } from 'react-router-dom';
// import DishLoader from "./DishLoader"; // Import the loader component

// const LatestCollection = () => {
//   const { products } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);
//   const [loading, setLoading] = useState(true); // Add loading state

//   useEffect(() => {
//     // Simulate loading delay (replace with actual API call)
//     const timer = setTimeout(() => {
//       setLatestProducts(products.slice(0, 10));
//       setLoading(false);
//     }, 1500);
    
//     return () => clearTimeout(timer);
//   }, [products]);

//   return (
//     <div className="py-12 bg-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Our <span className="text-amber-600">Popular</span> Dishes
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Customer favorites - the most loved traditional dishes prepared with authentic recipes
//           </p>
//         </div>

//         {/* Products Grid with Loader */}
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <DishLoader size="lg" message="Preparing our popular dishes..." />
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//               {latestProducts.map((item, index) => (
//                 <ProductItem
//                   key={index}
//                   id={item._id}
//                   image={item.image}
//                   name={item.name}
//                   price={item.price}
//                 />
//               ))}
//             </div>

//             {/* View More Button */}
//             <div className="text-center mt-12">
//               <Link 
//                 to="/menu" 
//                 className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
//               >
//                 View Full Menu
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;




















// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";
// import {Link} from 'react-router-dom'

// const LatestCollection = () => {
//   const { products } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);

//   useEffect(() => {
//     setLatestProducts(products.slice(0, 10));
//   }, [products]);

//   return (
//     <div className="py-12 bg-amber-50">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             Our <span className="text-amber-600">Popular</span> Dishes
//           </h2>
//           <div className="w-24 h-1 bg-[#008753] mx-auto"></div>
//           <p className="mt-6 max-w-2xl mx-auto text-gray-700">
//             Customer favorites - the most loved traditional dishes prepared with authentic recipes
//           </p>
//         </div>

//         {/* Products Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//           {latestProducts.map((item, index) => (
//             <ProductItem
//               key={index}
//               id={item._id}
//               image={item.image}
//               name={item.name}
//               price={item.price}
//             />
//           ))}
//         </div>

//         {/* View More Button */}
//         <div className="text-center mt-12">
//           <Link 
//             to="/collection" 
//             className="inline-block px-8 py-3 border-2 border-[#008753] text-[#008753] rounded-lg font-medium hover:bg-[#008753] hover:text-white transition-colors"
//           >
//             View Full Menu
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;














// import React, { useContext, useEffect, useState } from "react";
// import { ShopContext } from "../context/ShopContext";
// import Title from "./Title";
// import ProductItem from "./ProductItem";

// const LatestCollection = () => {
//   const { products } = useContext(ShopContext);
//   const [latestProducts, setLatestProducts] = useState([]);

//   useEffect(() => {
//     setLatestProducts(products.slice(0, 10));
//   }, [products]);

//   return (
//     <div className="my-10">
//       <div className="text-center py-8 text-3xl">
//         <Title text1={"LATEST"} text2={"COLLECTIONS"} />
//         <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-white">
//           {/* Discover our newest arrivals, where luxury meets precision. Our latest collection features exclusive timepieces that embody the perfect blend of craftsmanship. */}
//           Discover the latest luxury watch collections from Rolex, Patek
//           Philippe, Audemars Piguet, Omega, and more. Featuring cutting-edge
//           craftsmanship, exclusive designs, and timeless elegance, these new
//           arrivals redefine sophistication.{" "}
//         </p>
//       </div>

//       {/* Rendering Products */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
//         {latestProducts.map((item, index) => (
//           <ProductItem
//             key={index}
//             id={item._id}
//             image={item.image}
//             name={item.name}
//             price={item.price}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default LatestCollection;
