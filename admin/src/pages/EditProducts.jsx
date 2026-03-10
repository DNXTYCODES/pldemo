import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const EditProducts = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/product/list');
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

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-[#008753]">Edit Products</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link 
              key={product._id} 
              to={`/admin/edit-product/${product._id}`}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative"
            >
              {/* Stock Status Badge */}
              {!product.inStock && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                  OUT OF STOCK
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <img 
                    src={product.image[0]} 
                    alt={product.name} 
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                <p className="text-gray-600 mb-2">Category: {product.category}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#008753]">€{product.basePrice}</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.bestseller 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {product.bestseller ? 'Bestseller' : 'Regular'}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    Available: {product.availableDays?.includes('everyday') 
                      ? 'Everyday' 
                      : product.availableDays?.join(', ')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found</p>
          <button 
            onClick={() => setSearch('')}
            className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
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