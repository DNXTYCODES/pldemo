import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const EditProducts = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/product/list");
        if (response.data.success) {
          setProducts(response.data.products.reverse());
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ✏️ Edit Products
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Browse and edit all your products
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-3 sm:top-4 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products by name..."
              className="w-full pl-11 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-gray-100 p-6 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 sm:w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {search ? "No products found" : "No products available"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
              {search
                ? "Try searching with different keywords"
                : "Start by creating your first product"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm sm:text-base"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/admin/edit-product/${product._id}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-100 h-40 sm:h-48">
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock Status Badge */}
                  {!product.inStock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 shadow-md">
                      OUT OF STOCK
                    </div>
                  )}

                  {/* Bestseller Badge */}
                  {product.bestseller && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 shadow-md">
                      ⭐ BESTSELLER
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mb-3">
                    📂 {product.category}
                  </p>

                  {/* Price and Status Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="font-bold text-lg sm:text-xl text-blue-600">
                      €{product.basePrice?.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                        product.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.inStock ? "✓ In Stock" : "✕ Out"}
                    </span>
                  </div>

                  {/* Availability Info */}
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    📅{" "}
                    {product.availableDays?.includes("everyday")
                      ? "Everyday"
                      : product.availableDays?.slice(0, 2).join(", ") +
                        (product.availableDays?.length > 2 ? "..." : "")}
                  </p>

                  {/* Edit Button Hint */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-xs sm:text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                      ✏️ Edit Product
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Results Counter */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProducts;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';
// import { Link } from 'react-router-dom';

// const EditProducts = ({ token }) => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get(backendUrl + '/api/product/list');
//         if (response.data.success) {
//           setProducts(response.data.products.reverse());
//         } else {
//           toast.error(response.data.message);
//         }
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="w-full">
//       <h1 className="text-2xl font-bold mb-6 text-[#008753]">Edit Products</h1>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <input
//           type="text"
//           placeholder="Search products..."
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {filteredProducts.map((product) => (
//             <Link
//               key={product._id}
//               to={`/admin/edit-product/${product._id}`}
//               className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
//             >
//               <div className="p-4">
//                 <div className="flex justify-center mb-4">
//                   <img
//                     src={product.image[0]}
//                     alt={product.name}
//                     className="w-32 h-32 object-cover rounded"
//                   />
//                 </div>
//                 <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
//                 <p className="text-gray-600 mb-2">Category: {product.category}</p>
//                 <div className="flex justify-between items-center">
//                   <span className="font-bold text-[#008753]">${product.price}</span>
//                   <div className="flex items-center">
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       product.bestseller
//                         ? 'bg-amber-500 text-white'
//                         : 'bg-gray-200 text-gray-700'
//                     }`}>
//                       {product.bestseller ? 'Bestseller' : 'Regular'}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <p className="text-xs text-gray-500">
//                     Available: {product.availableDays?.includes('everyday')
//                       ? 'Everyday'
//                       : product.availableDays?.join(', ')}
//                   </p>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}

//       {!loading && filteredProducts.length === 0 && (
//         <div className="text-center py-10">
//           <p className="text-gray-500">No products found</p>
//           <button
//             onClick={() => setSearch('')}
//             className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Clear Search
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EditProducts;
