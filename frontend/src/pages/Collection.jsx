import React, { useContext, useEffect, useState, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { FiFilter } from 'react-icons/fi';

const Collection = () => {
  const { getAvailableProducts, search, showSearch } = useContext(ShopContext);
  const [allProducts, setAllProducts] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Extract unique categories from products
  const categories = useMemo(() => 
    [...new Set(allProducts.map(product => product.category))].sort(),
    [allProducts]
  );

  // Compute filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];

    // Apply search filter
    if (showSearch && search) {
      products = products.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      products = products.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    // Apply sorting
    switch (sortType) {
      case 'low-high':
        return [...products].sort((a, b) => a.basePrice - b.basePrice);
      case 'high-low':
        return [...products].sort((a, b) => b.basePrice - a.basePrice);
      default:
        return products;
    }
  }, [allProducts, search, showSearch, selectedCategories, sortType]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const availableProducts = await getAvailableProducts();
        setAllProducts(availableProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [getAvailableProducts]);

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  // Clear all categories
  const clearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className='pt-10 border-t'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex justify-between items-center mb-8'>
          <Title text1={'OUR'} text2={'MENU'} />
          
          <div className='flex items-center gap-3'>
            {/* Mobile filter toggle button */}
            <button 
              className="sm:hidden flex items-center gap-1 text-sm bg-[#008753] text-white px-3 py-2 rounded-lg"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter /> Filter
            </button>
            
            <label htmlFor="sort-select" className='text-sm text-gray-600 hidden sm:block'>
              Sort by:
            </label>
            <select 
              id="sort-select"
              onChange={handleSortChange}
              value={sortType}
              className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
              aria-label="Sort food items"
            >
              <option value="relevant">Most Relevant</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-8'>
          {/* Category Filter Sidebar */}
          <div className={`w-full sm:w-64 ${showFilter ? 'block' : 'hidden'} sm:block`}>
            <div className='border border-gray-300 p-5 rounded-lg'>
              <div className='flex justify-between items-center mb-4'>
                <p className='prata-regular text-base font-medium'>CATEGORIES</p>
                {selectedCategories.length > 0 && (
                  <button 
                    className='text-xs text-[#008753] hover:underline'
                    onClick={clearCategories}
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className='flex flex-col gap-3 text-sm font-light text-gray-700'>
                {categories.map((category, index) => (
                  <label key={index} className='flex items-center gap-2 cursor-pointer'>
                    <input 
                      className='w-4 h-4 accent-[#008753]'
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span className='capitalize'>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className='flex-1'>
            {showSearch && search && (
              <div className='mb-6'>
                <p className='text-lg'>
                  Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
                </p>
                {selectedCategories.length > 0 && (
                  <p className='text-sm text-gray-600 mt-1'>
                    Filtered by: {selectedCategories.join(', ')}
                  </p>
                )}
                <p className='text-sm text-gray-600'>
                  {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'item' : 'items'} found
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {filteredAndSortedProducts.map((item, index) => (
                  <ProductItem 
                    key={index} 
                    name={item.name} 
                    id={item._id} 
                    basePrice={item.basePrice} 
                    image={item.image} 
                    inStock={item.inStock}
                    variations={item.variations}  // Added variations prop
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
                  <img 
                    src={assets.search_icon} 
                    className='w-12 opacity-70' 
                    alt="No results found" 
                  />
                </div>
                <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
                  No Food Items Found
                </h3>
                <p className='text-gray-600 max-w-md mx-auto'>
                  {selectedCategories.length > 0
                    ? "No items match your selected categories. Try different filters."
                    : "We couldn't find any dishes matching your search. Try different keywords."}
                </p>
                {selectedCategories.length > 0 && (
                  <button
                    className="mt-4 text-[#008753] hover:underline"
                    onClick={clearCategories}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;





























// import React, { useContext, useEffect, useState, useMemo } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';
// import { FiFilter } from 'react-icons/fi';

// const Collection = () => {
//   const { getAvailableProducts, search, showSearch } = useContext(ShopContext);
//   const [allProducts, setAllProducts] = useState([]);
//   const [sortType, setSortType] = useState('relevant');
//   const [loading, setLoading] = useState(true);
//   const [showFilter, setShowFilter] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState([]);
  
//   // Extract unique categories from products
//   const categories = useMemo(() => 
//     [...new Set(allProducts.map(product => product.category))].sort(),
//     [allProducts]
//   );

//   // Compute filtered and sorted products
//   const filteredAndSortedProducts = useMemo(() => {
//     let products = [...allProducts];

//     // Apply search filter
//     if (showSearch && search) {
//       products = products.filter(item => 
//         item.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     // Apply category filter
//     if (selectedCategories.length > 0) {
//       products = products.filter(item => 
//         selectedCategories.includes(item.category)
//       );
//     }

//     // Apply sorting
//     switch (sortType) {
//       case 'low-high':
//         return [...products].sort((a, b) => a.basePrice - b.basePrice);
//       case 'high-low':
//         return [...products].sort((a, b) => b.basePrice - a.basePrice);
//       default:
//         return products;
//     }
//   }, [allProducts, search, showSearch, selectedCategories, sortType]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         setAllProducts(availableProducts);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, [getAvailableProducts]);

//   // Toggle category selection
//   const toggleCategory = (category) => {
//     setSelectedCategories(prev => 
//       prev.includes(category) 
//         ? prev.filter(c => c !== category) 
//         : [...prev, category]
//     );
//   };

//   const handleSortChange = (e) => {
//     setSortType(e.target.value);
//   };

//   // Clear all categories
//   const clearCategories = () => {
//     setSelectedCategories([]);
//   };

//   return (
//     <div className='pt-10 border-t'>
//       <div className='max-w-6xl mx-auto px-4'>
//         <div className='flex justify-between items-center mb-8'>
//           <Title text1={'OUR'} text2={'MENU'} />
          
//           <div className='flex items-center gap-3'>
//             {/* Mobile filter toggle button */}
//             <button 
//               className="sm:hidden flex items-center gap-1 text-sm bg-[#008753] text-white px-3 py-2 rounded-lg"
//               onClick={() => setShowFilter(!showFilter)}
//             >
//               <FiFilter /> Filter
//             </button>
            
//             <label htmlFor="sort-select" className='text-sm text-gray-600 hidden sm:block'>
//               Sort by:
//             </label>
//             <select 
//               id="sort-select"
//               onChange={handleSortChange}
//               value={sortType}
//               className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
//               aria-label="Sort food items"
//             >
//               <option value="relevant">Most Relevant</option>
//               <option value="low-high">Price: Low to High</option>
//               <option value="high-low">Price: High to Low</option>
//             </select>
//           </div>
//         </div>

//         <div className='flex flex-col sm:flex-row gap-8'>
//           {/* Category Filter Sidebar */}
//           <div className={`w-full sm:w-64 ${showFilter ? 'block' : 'hidden'} sm:block`}>
//             <div className='border border-gray-300 p-5 rounded-lg'>
//               <div className='flex justify-between items-center mb-4'>
//                 <p className='prata-regular text-base font-medium'>CATEGORIES</p>
//                 {selectedCategories.length > 0 && (
//                   <button 
//                     className='text-xs text-[#008753] hover:underline'
//                     onClick={clearCategories}
//                   >
//                     Clear all
//                   </button>
//                 )}
//               </div>
              
//               <div className='flex flex-col gap-3 text-sm font-light text-gray-700'>
//                 {categories.map((category, index) => (
//                   <label key={index} className='flex items-center gap-2 cursor-pointer'>
//                     <input 
//                       className='w-4 h-4 accent-[#008753]'
//                       type="checkbox" 
//                       checked={selectedCategories.includes(category)}
//                       onChange={() => toggleCategory(category)}
//                     />
//                     <span className='capitalize'>{category}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Product Grid */}
//           <div className='flex-1'>
//             {showSearch && search && (
//               <div className='mb-6'>
//                 <p className='text-lg'>
//                   Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
//                 </p>
//                 {selectedCategories.length > 0 && (
//                   <p className='text-sm text-gray-600 mt-1'>
//                     Filtered by: {selectedCategories.join(', ')}
//                   </p>
//                 )}
//                 <p className='text-sm text-gray-600'>
//                   {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'item' : 'items'} found
//                 </p>
//               </div>
//             )}

//             {loading ? (
//               <div className="flex justify-center py-20">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//               </div>
//             ) : filteredAndSortedProducts.length > 0 ? (
//               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
//                 {filteredAndSortedProducts.map((item, index) => (
//                   <ProductItem 
//                     key={index} 
//                     name={item.name} 
//                     id={item._id} 
//                     basePrice={item.basePrice} 
//                     image={item.image} 
//                     inStock={item.inStock}
//                     category={item.category}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='text-center py-12'>
//                 <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
//                   <img 
//                     src={assets.search_icon} 
//                     className='w-12 opacity-70' 
//                     alt="No results found" 
//                   />
//                 </div>
//                 <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
//                   No Food Items Found
//                 </h3>
//                 <p className='text-gray-600 max-w-md mx-auto'>
//                   {selectedCategories.length > 0
//                     ? "No items match your selected categories. Try different filters."
//                     : "We couldn't find any dishes matching your search. Try different keywords."}
//                 </p>
//                 {selectedCategories.length > 0 && (
//                   <button
//                     className="mt-4 text-[#008753] hover:underline"
//                     onClick={clearCategories}
//                   >
//                     Clear all filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Collection;





















// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';
// import { FiFilter } from 'react-icons/fi';

// const Collection = () => {
//   const { getAvailableProducts, search, showSearch } = useContext(ShopContext);
//   const [filterProducts, setFilterProducts] = useState([]);
//   const [allProducts, setAllProducts] = useState([]);
//   const [sortType, setSortType] = useState('relevant');
//   const [loading, setLoading] = useState(true);
//   const [showFilter, setShowFilter] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState([]);
  
//   // Extract unique categories from products
//   const categories = [...new Set(allProducts.map(product => product.category))].sort();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         setAllProducts(availableProducts);
//         applyFilter(availableProducts);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, [search, showSearch]);

//   // Toggle category selection
//   const toggleCategory = (category) => {
//     setSelectedCategories(prev => 
//       prev.includes(category) 
//         ? prev.filter(c => c !== category) 
//         : [...prev, category]
//     );
//   };

//   // Apply all filters (search and categories)
//   const applyFilter = (products) => {
//     let productsCopy = [...products];

//     // Apply search filter
//     if (showSearch && search) {
//       productsCopy = productsCopy.filter(item => 
//         item.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     // Apply category filter if any categories are selected
//     if (selectedCategories.length > 0) {
//       productsCopy = productsCopy.filter(item => 
//         selectedCategories.includes(item.category)
//       );
//     }

//     setFilterProducts(productsCopy);
//     sortProduct(productsCopy);
//   };

//   // Handle sorting
//   const sortProduct = (productsList) => {
//     let sortedProducts = [...productsList];

//     switch (sortType) {
//       case 'low-high':
//         sortedProducts.sort((a, b) => a.basePrice - b.basePrice);
//         break;
//       case 'high-low':
//         sortedProducts.sort((a, b) => b.basePrice - a.basePrice);
//         break;
//       default:
//         // Keep original order
//         break;
//     }

//     setFilterProducts(sortedProducts);
//   };

//   const handleSortChange = (e) => {
//     const newSortType = e.target.value;
//     setSortType(newSortType);
//     sortProduct(filterProducts);
//   };

//   // Clear all categories
//   const clearCategories = () => {
//     setSelectedCategories([]);
//   };

//   // Update filters when categories change
//   useEffect(() => {
//     if (allProducts.length > 0) {
//       applyFilter(allProducts);
//     }
//   }, [selectedCategories]);

//   return (
//     <div className='pt-10 border-t'>
//       <div className='max-w-6xl mx-auto px-4'>
//         <div className='flex justify-between items-center mb-8'>
//           <Title text1={'OUR'} text2={'MENU'} />
          
//           <div className='flex items-center gap-3'>
//             {/* Mobile filter toggle button */}
//             <button 
//               className="sm:hidden flex items-center gap-1 text-sm bg-[#008753] text-white px-3 py-2 rounded-lg"
//               onClick={() => setShowFilter(!showFilter)}
//             >
//               <FiFilter /> Filter
//             </button>
            
//             <label htmlFor="sort-select" className='text-sm text-gray-600 hidden sm:block'>
//               Sort by:
//             </label>
//             <select 
//               id="sort-select"
//               onChange={handleSortChange}
//               value={sortType}
//               className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
//               aria-label="Sort food items"
//             >
//               <option value="relevant">Most Relevant</option>
//               <option value="low-high">Price: High to Low</option>
//               <option value="high-low">Price: Low to High</option>
//             </select>
//           </div>
//         </div>

//         <div className='flex flex-col sm:flex-row gap-8'>
//           {/* Category Filter Sidebar */}
//           <div className={`w-full sm:w-64 ${showFilter ? 'block' : 'hidden'} sm:block`}>
//             <div className='border border-gray-300 p-5 rounded-lg'>
//               <div className='flex justify-between items-center mb-4'>
//                 <p className='prata-regular text-base font-medium'>CATEGORIES</p>
//                 {selectedCategories.length > 0 && (
//                   <button 
//                     className='text-xs text-[#008753] hover:underline'
//                     onClick={clearCategories}
//                   >
//                     Clear all
//                   </button>
//                 )}
//               </div>
              
//               <div className='flex flex-col gap-3 text-sm font-light text-gray-700'>
//                 {categories.map((category, index) => (
//                   <label key={index} className='flex items-center gap-2 cursor-pointer'>
//                     <input 
//                       className='w-4 h-4 accent-[#008753]'
//                       type="checkbox" 
//                       checked={selectedCategories.includes(category)}
//                       onChange={() => toggleCategory(category)}
//                     />
//                     <span className='capitalize'>{category}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Product Grid */}
//           <div className='flex-1'>
//             {showSearch && search && (
//               <div className='mb-6'>
//                 <p className='text-lg'>
//                   Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
//                 </p>
//                 {selectedCategories.length > 0 && (
//                   <p className='text-sm text-gray-600 mt-1'>
//                     Filtered by: {selectedCategories.join(', ')}
//                   </p>
//                 )}
//                 <p className='text-sm text-gray-600'>
//                   {filterProducts.length} {filterProducts.length === 1 ? 'item' : 'items'} found
//                 </p>
//               </div>
//             )}

//             {loading ? (
//               <div className="flex justify-center py-20">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//               </div>
//             ) : filterProducts.length > 0 ? (
//               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
//                 {filterProducts.map((item, index) => (
//                   <ProductItem 
//                     key={index} 
//                     name={item.name} 
//                     id={item._id} 
//                     basePrice={item.basePrice} 
//                     image={item.image} 
//                     inStock={item.inStock}
//                     category={item.category}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='text-center py-12'>
//                 <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
//                   <img 
//                     src={assets.search_icon} 
//                     className='w-12 opacity-70' 
//                     alt="No results found" 
//                   />
//                 </div>
//                 <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
//                   No Food Items Found
//                 </h3>
//                 <p className='text-gray-600 max-w-md mx-auto'>
//                   {selectedCategories.length > 0
//                     ? "No items match your selected categories. Try different filters."
//                     : "We couldn't find any dishes matching your search. Try different keywords."}
//                 </p>
//                 {selectedCategories.length > 0 && (
//                   <button
//                     className="mt-4 text-[#008753] hover:underline"
//                     onClick={clearCategories}
//                   >
//                     Clear all filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Collection;































// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';
// import { FiFilter } from 'react-icons/fi';

// const Collection = () => {
//   const { getAvailableProducts, search, showSearch } = useContext(ShopContext);
//   const [filterProducts, setFilterProducts] = useState([]);
//   const [allProducts, setAllProducts] = useState([]);
//   const [sortType, setSortType] = useState('relevant');
//   const [loading, setLoading] = useState(true);
//   const [showFilter, setShowFilter] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState([]);
  
//   // Extract unique categories from products
//   const categories = [...new Set(allProducts.map(product => product.category))].sort();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         setAllProducts(availableProducts);
//         applyFilter(availableProducts);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, [search, showSearch]);

//   // Toggle category selection
//   const toggleCategory = (category) => {
//     setSelectedCategories(prev => 
//       prev.includes(category) 
//         ? prev.filter(c => c !== category) 
//         : [...prev, category]
//     );
//   };

//   // Apply all filters (search and categories)
//   const applyFilter = (products) => {
//     let productsCopy = [...products];

//     // Apply search filter
//     if (showSearch && search) {
//       productsCopy = productsCopy.filter(item => 
//         item.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     // Apply category filter if any categories are selected
//     if (selectedCategories.length > 0) {
//       productsCopy = productsCopy.filter(item => 
//         selectedCategories.includes(item.category)
//       );
//     }

//     setFilterProducts(productsCopy);
//     sortProduct(productsCopy);
//   };

//   // Handle sorting
//   const sortProduct = (productsList) => {
//     let sortedProducts = [...productsList];

//     switch (sortType) {
//       case 'low-high':
//         sortedProducts.sort((a, b) => a.price - b.price);
//         break;
//       case 'high-low':
//         sortedProducts.sort((a, b) => b.price - a.price);
//         break;
//       default:
//         // Keep original order
//         break;
//     }

//     setFilterProducts(sortedProducts);
//   };

//   const handleSortChange = (e) => {
//     const newSortType = e.target.value;
//     setSortType(newSortType);
//     sortProduct(filterProducts);
//   };

//   // Clear all categories
//   const clearCategories = () => {
//     setSelectedCategories([]);
//   };

//   // Update filters when categories change
//   useEffect(() => {
//     if (allProducts.length > 0) {
//       applyFilter(allProducts);
//     }
//   }, [selectedCategories]);

//   return (
//     <div className='pt-10 border-t'>
//       <div className='max-w-6xl mx-auto px-4'>
//         <div className='flex justify-between items-center mb-8'>
//           <Title text1={'OUR'} text2={'MENU'} />
          
//           <div className='flex items-center gap-3'>
//             {/* Mobile filter toggle button */}
//             <button 
//               className="sm:hidden flex items-center gap-1 text-sm bg-[#008753] text-white px-3 py-2 rounded-lg"
//               onClick={() => setShowFilter(!showFilter)}
//             >
//               <FiFilter /> Filter
//             </button>
            
//             <label htmlFor="sort-select" className='text-sm text-gray-600 hidden sm:block'>
//               Sort by:
//             </label>
//             <select 
//               id="sort-select"
//               onChange={handleSortChange}
//               value={sortType}
//               className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
//               aria-label="Sort food items"
//             >
//               <option value="relevant">Most Relevant</option>
//               <option value="low-high">Price: Low to High</option>
//               <option value="high-low">Price: High to Low</option>
//             </select>
//           </div>
//         </div>

//         <div className='flex flex-col sm:flex-row gap-8'>
//           {/* Category Filter Sidebar */}
//           <div className={`w-full sm:w-64 ${showFilter ? 'block' : 'hidden'} sm:block`}>
//             <div className='border border-gray-300 p-5 rounded-lg'>
//               <div className='flex justify-between items-center mb-4'>
//                 <p className='prata-regular text-base font-medium'>CATEGORIES</p>
//                 {selectedCategories.length > 0 && (
//                   <button 
//                     className='text-xs text-[#008753] hover:underline'
//                     onClick={clearCategories}
//                   >
//                     Clear all
//                   </button>
//                 )}
//               </div>
              
//               <div className='flex flex-col gap-3 text-sm font-light text-gray-700'>
//                 {categories.map((category, index) => (
//                   <label key={index} className='flex items-center gap-2 cursor-pointer'>
//                     <input 
//                       className='w-4 h-4 accent-[#008753]'
//                       type="checkbox" 
//                       checked={selectedCategories.includes(category)}
//                       onChange={() => toggleCategory(category)}
//                     />
//                     <span className='capitalize'>{category}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Product Grid */}
//           <div className='flex-1'>
//             {showSearch && search && (
//               <div className='mb-6'>
//                 <p className='text-lg'>
//                   Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
//                 </p>
//                 {selectedCategories.length > 0 && (
//                   <p className='text-sm text-gray-600 mt-1'>
//                     Filtered by: {selectedCategories.join(', ')}
//                   </p>
//                 )}
//                 <p className='text-sm text-gray-600'>
//                   {filterProducts.length} {filterProducts.length === 1 ? 'item' : 'items'} found
//                 </p>
//               </div>
//             )}

//             {loading ? (
//               <div className="flex justify-center py-20">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//               </div>
//             ) : filterProducts.length > 0 ? (
//               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
//                 {filterProducts.map((item, index) => (
//                   <ProductItem 
//                     key={index} 
//                     name={item.name} 
//                     id={item._id} 
//                     price={item.price} 
//                     image={item.image} 
//                     category={item.category}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className='text-center py-12'>
//                 <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
//                   <img 
//                     src={assets.search_icon} 
//                     className='w-12 opacity-70' 
//                     alt="No results found" 
//                   />
//                 </div>
//                 <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
//                   No Food Items Found
//                 </h3>
//                 <p className='text-gray-600 max-w-md mx-auto'>
//                   {selectedCategories.length > 0
//                     ? "No items match your selected categories. Try different filters."
//                     : "We couldn't find any dishes matching your search. Try different keywords."}
//                 </p>
//                 {selectedCategories.length > 0 && (
//                   <button
//                     className="mt-4 text-[#008753] hover:underline"
//                     onClick={clearCategories}
//                   >
//                     Clear all filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Collection;
























// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';

// const Collection = () => {
//   const { getAvailableProducts, search, showSearch } = useContext(ShopContext);
//   const [filterProducts, setFilterProducts] = useState([]);
//   const [allProducts, setAllProducts] = useState([]);
//   const [sortType, setSortType] = useState('relevant');
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [showFilter, setShowFilter] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Available categories from your Add.jsx
//   const categories = [
//     "Main Dishes", 
//     "Soups & Stews", 
//     "Appetizers", 
//     "Desserts", 
//     "Beverages"
//   ];

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         setAllProducts(availableProducts);
//         applyFilters(availableProducts);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, [search, showSearch]);

//   // Handle category selection
//   const toggleCategory = (category) => {
//     setSelectedCategories(prev => {
//       if (prev.includes(category)) {
//         return prev.filter(c => c !== category);
//       } else {
//         return [...prev, category];
//       }
//     });
//   };

//   // Apply all filters (search and categories)
//   const applyFilters = (products) => {
//     let filtered = [...products];

//     // Apply search filter
//     if (showSearch && search) {
//       filtered = filtered.filter(item => 
//         item.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     // Apply category filter
//     if (selectedCategories.length > 0) {
//       filtered = filtered.filter(item => 
//         selectedCategories.includes(item.category)
//       );
//     }

//     setFilterProducts(filtered);
//     sortProduct(filtered);
//   };

//   // Sort products
//   const sortProduct = (productsList) => {
//     let sortedProducts = [...productsList];

//     switch (sortType) {
//       case 'low-high':
//         sortedProducts.sort((a, b) => a.price - b.price);
//         break;
//       case 'high-low':
//         sortedProducts.sort((a, b) => b.price - a.price);
//         break;
//       default:
//         // Keep original order
//         break;
//     }

//     setFilterProducts(sortedProducts);
//   };

//   // Handle sort change
//   const handleSortChange = (e) => {
//     const newSortType = e.target.value;
//     setSortType(newSortType);
//     sortProduct(filterProducts);
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setSelectedCategories([]);
//     setSortType('relevant');
//     applyFilters(allProducts);
//   };

//   // Apply filters when categories change
//   useEffect(() => {
//     if (allProducts.length > 0) {
//       applyFilters(allProducts);
//     }
//   }, [selectedCategories]);

//   return (
//     <div className='pt-10 border-t'>
//       <div className='max-w-6xl mx-auto px-4'>
//         <div className='flex justify-between items-center mb-8'>
//           <Title text1={'OUR'} text2={'MENU'} />
          
//           <div className='flex items-center gap-3'>
//             <button 
//               onClick={() => setShowFilter(!showFilter)}
//               className='sm:hidden flex items-center gap-1 border border-gray-300 px-3 py-2 rounded'
//             >
//               <img className='w-4' src={assets.filter} alt="Filter" />
//               Filter
//             </button>
            
//             <div className='hidden sm:flex items-center gap-3'>
//               <label htmlFor="sort-select" className='text-sm text-gray-600'>
//                 Sort by:
//               </label>
//               <select 
//                 id="sort-select"
//                 onChange={handleSortChange}
//                 value={sortType}
//                 className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
//                 aria-label="Sort food items"
//               >
//                 <option value="relevant">Most Relevant</option>
//                 <option value="low-high">Price: Low to High</option>
//                 <option value="high-low">Price: High to Low</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className='flex flex-col md:flex-row gap-8'>
//           {/* Filter Sidebar */}
//           <div className={`w-full md:w-64 ${showFilter ? 'block' : 'hidden'} md:block`}>
//             <div className='border border-gray-300 p-5 rounded-lg'>
//               <div className='flex justify-between items-center mb-4'>
//                 <h3 className='font-medium'>Filters</h3>
//                 <button 
//                   onClick={resetFilters}
//                   className='text-sm text-[#008753] hover:underline'
//                 >
//                   Reset all
//                 </button>
//               </div>
              
//               {/* Category Filter */}
//               <div className='mb-6'>
//                 <p className='prata-regular mb-3 text-sm font-medium'>CATEGORIES</p>
//                 <div className='flex flex-col gap-3 text-sm text-gray-700'>
//                   {categories.map((category, index) => (
//                     <label key={index} className='flex items-center gap-2 cursor-pointer'>
//                       <input 
//                         className='w-4 h-4 text-[#008753] rounded focus:ring-[#008753]'
//                         type="checkbox" 
//                         checked={selectedCategories.includes(category)}
//                         onChange={() => toggleCategory(category)}
//                       />
//                       {category}
//                     </label>
//                   ))}
//                 </div>
//               </div>
              
//               {/* Sorting for mobile */}
//               <div className='md:hidden mb-4'>
//                 <p className='prata-regular mb-3 text-sm font-medium'>SORT BY</p>
//                 <div className='flex flex-col gap-3'>
//                   <label className='flex items-center gap-2 cursor-pointer'>
//                     <input 
//                       type="radio" 
//                       name="sort" 
//                       value="relevant"
//                       checked={sortType === 'relevant'}
//                       onChange={handleSortChange}
//                       className='w-4 h-4 text-[#008753]'
//                     />
//                     Most Relevant
//                   </label>
//                   <label className='flex items-center gap-2 cursor-pointer'>
//                     <input 
//                       type="radio" 
//                       name="sort" 
//                       value="low-high"
//                       checked={sortType === 'low-high'}
//                       onChange={handleSortChange}
//                       className='w-4 h-4 text-[#008753]'
//                     />
//                     Price: Low to High
//                   </label>
//                   <label className='flex items-center gap-2 cursor-pointer'>
//                     <input 
//                       type="radio" 
//                       name="sort" 
//                       value="high-low"
//                       checked={sortType === 'high-low'}
//                       onChange={handleSortChange}
//                       className='w-4 h-4 text-[#008753]'
//                     />
//                     Price: High to Low
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Product Grid */}
//           <div className='flex-1'>
//             {showSearch && search && (
//               <div className='mb-6'>
//                 <p className='text-lg'>
//                   Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
//                 </p>
//                 <p className='text-sm text-gray-600'>
//                   {filterProducts.length} {filterProducts.length === 1 ? 'item' : 'items'} found
//                 </p>
//               </div>
//             )}

//             {/* Category tags */}
//             {selectedCategories.length > 0 && (
//               <div className='mb-4 flex flex-wrap gap-2'>
//                 {selectedCategories.map((category, index) => (
//                   <span 
//                     key={index} 
//                     className='bg-[#008753] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1'
//                   >
//                     {category}
//                     <button 
//                       onClick={() => toggleCategory(category)}
//                       className='text-white hover:text-gray-200'
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             )}

//             {loading ? (
//               <div className="flex justify-center py-20">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//               </div>
//             ) : filterProducts.length > 0 ? (
//               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6'>
//                 {filterProducts.map((item, index) => (
//                   <ProductItem 
//                     key={index} 
//                     name={item.name} 
//                     id={item._id} 
//                     price={item.price} 
//                     image={item.image} 
//                     category={item.category}
//                   />
//             ))}
//               </div>
//             ) : (
//               <div className='text-center py-12'>
//                 <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
//                   <img 
//                     src={assets.search_icon} 
//                     className='w-12 opacity-70' 
//                     alt="No results found" 
//                   />
//                 </div>
//                 <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
//                   No Food Items Found
//                 </h3>
//                 <p className='text-gray-600 max-w-md mx-auto mb-4'>
//                   We couldn't find any dishes matching your filters.
//                 </p>
//                 <button 
//                   onClick={resetFilters}
//                   className='px-4 py-2 bg-[#008753] text-white rounded hover:bg-[#006641] transition-colors'
//                 >
//                   Clear All Filters
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Collection;





















// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';

// const Collection = () => {
//   const { getAvailableProducts, search, showSearch } = useContext(ShopContext);
//   const [filterProducts, setFilterProducts] = useState([]);
//   const [sortType, setSortType] = useState('relevant');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const availableProducts = await getAvailableProducts();
//         applyFilter(availableProducts);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProducts();
//   }, [search, showSearch]);

//   const applyFilter = (products) => {
//     let productsCopy = [...products];

//     // Apply search filter
//     if (showSearch && search) {
//       productsCopy = productsCopy.filter(item => 
//         item.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     setFilterProducts(productsCopy);
//     sortProduct(productsCopy);
//   };

//   const sortProduct = (productsList) => {
//     let sortedProducts = [...productsList];

//     switch (sortType) {
//       case 'low-high':
//         sortedProducts.sort((a, b) => a.price - b.price);
//         break;
//       case 'high-low':
//         sortedProducts.sort((a, b) => b.price - a.price);
//         break;
//       default:
//         // Keep original order
//         break;
//     }

//     setFilterProducts(sortedProducts);
//   };

//   const handleSortChange = (e) => {
//     const newSortType = e.target.value;
//     setSortType(newSortType);
//     sortProduct(filterProducts);
//   };

//   return (
//     <div className='pt-10 border-t'>
//       <div className='max-w-6xl mx-auto px-4'>
//         <div className='flex justify-between items-center mb-8'>
//           <Title text1={'OUR'} text2={'MENU'} />
          
//           <div className='flex items-center gap-3'>
//             <label htmlFor="sort-select" className='text-sm text-gray-600'>
//               Sort by:
//             </label>
//             <select 
//               id="sort-select"
//               onChange={handleSortChange}
//               value={sortType}
//               className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
//               aria-label="Sort food items"
//             >
//               <option value="relevant">Most Relevant</option>
//               <option value="low-high">Price: Low to High</option>
//               <option value="high-low">Price: High to Low</option>
//             </select>
//           </div>
//         </div>

//         {showSearch && search && (
//           <div className='mb-6'>
//             <p className='text-lg'>
//               Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
//             </p>
//             <p className='text-sm text-gray-600'>
//               {filterProducts.length} {filterProducts.length === 1 ? 'item' : 'items'} found
//             </p>
//           </div>
//         )}

//         {loading ? (
//           <div className="flex justify-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//           </div>
//         ) : filterProducts.length > 0 ? (
//           <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
//             {filterProducts.map((item, index) => (
//               <ProductItem 
//                 key={index} 
//                 name={item.name} 
//                 id={item._id} 
//                 price={item.price} 
//                 image={item.image} 
//               />
//             ))}
//           </div>
//         ) : (
//           <div className='text-center py-12'>
//             <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
//               <img 
//                 src={assets.search_icon} 
//                 className='w-12 opacity-70' 
//                 alt="No results found" 
//               />
//             </div>
//             <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
//               No Food Items Found
//             </h3>
//             <p className='text-gray-600 max-w-md mx-auto'>
//               We couldn't find any dishes matching your search. Try different keywords.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Collection;


























// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';

// const Collection = () => {

//   const { products , search , showSearch } = useContext(ShopContext);
//   const [filterProducts, setFilterProducts] = useState([]);
//   const [sortType, setSortType] = useState('relavent')

//   // Food categories filtering - temporarily commented out
//   /*
//   const [showFilter, setShowFilter] = useState(false);
//   const [category, setCategory] = useState([]);
  
//   const toggleCategory = (e) => {
//     if (category.includes(e.target.value)) {
//         setCategory(prev=> prev.filter(item => item !== e.target.value))
//     }
//     else{
//       setCategory(prev => [...prev,e.target.value])
//     }
//   }
//   */

//   const applyFilter = () => {
//     let productsCopy = products.slice();

//     // Apply search filter
//     if (showSearch && search) {
//       productsCopy = productsCopy.filter(item => 
//         item.name.toLowerCase().includes(search.toLowerCase())
//       )
//     }

//     /*
//     // Food category filtering - temporarily commented out
//     if (category.length > 0) {
//       productsCopy = productsCopy.filter(item => category.includes(item.category));
//     }
//     */

//     setFilterProducts(productsCopy)
//   }

//   const sortProduct = () => {
//     let fpCopy = [...filterProducts];

//     switch (sortType) {
//       case 'low-high':
//         setFilterProducts(fpCopy.sort((a,b) => (a.price - b.price)));
//         break;

//       case 'high-low':
//         setFilterProducts(fpCopy.sort((a,b) => (b.price - a.price)));
//         break;

//       default:
//         // Keep original order
//         break;
//     }
//   }

//   useEffect(() => {
//     applyFilter();
//   }, [search, showSearch, products])
//   // Remove category from dependencies since it's commented out

//   useEffect(() => {
//     sortProduct();
//   }, [sortType])

//   return (
//     <div className='pt-10 border-t'>
//       <div className='max-w-6xl mx-auto px-4'>
//         {/* Header with Title and Sorting */}
//         <div className='flex justify-between items-center mb-8'>
//           <Title text1={'OUR'} text2={'MENU'} />
          
//           {/* Product Sort */}
//           <div className='flex items-center gap-3'>
//             <label htmlFor="sort-select" className='text-sm text-gray-600'>
//               Sort by:
//             </label>
//             <select 
//               id="sort-select"
//               onChange={(e) => setSortType(e.target.value)} 
//               className='border-2 border-[#008753] text-sm px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008753]'
//               aria-label="Sort food items"
//             >
//               <option value="relavent">Most Relevant</option>
//               <option value="low-high">Price: Low to High</option>
//               <option value="high-low">Price: High to Low</option>
//             </select>
//           </div>
//         </div>

//         {/* Food Category Filter - Temporarily Commented Out */}
//         {/*
//         <div className='mb-8 bg-amber-50 p-4 rounded-lg'>
//           <p 
//             onClick={() => setShowFilter(!showFilter)} 
//             className='prata-regular text-xl flex items-center cursor-pointer gap-2'
//           >
//             FILTER BY CATEGORY
//             <img 
//               className={`h-3 ${showFilter ? 'rotate-90' : ''}`} 
//               src={assets.dropdown_icon} 
//               alt="Toggle filters" 
//             />
//           </p>
          
//           <div className={`mt-4 ${showFilter ? 'block' : 'hidden'}`}>
//             <p className='prata-regular mb-3 text-base text-[#008753]'>FOOD CATEGORIES</p>
//             <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700'>
//               <label className='flex items-center gap-2 cursor-pointer'>
//                 <input 
//                   className='w-4 h-4 accent-[#008753]' 
//                   type="checkbox" 
//                   value={'Main Dishes'} 
//                   onChange={toggleCategory}
//                 /> 
//                 Main Dishes
//               </label>
//               <label className='flex items-center gap-2 cursor-pointer'>
//                 <input 
//                   className='w-4 h-4 accent-[#008753]' 
//                   type="checkbox" 
//                   value={'Soups'} 
//                   onChange={toggleCategory}
//                 /> 
//                 Soups & Stews
//               </label>
//               <label className='flex items-center gap-2 cursor-pointer'>
//                 <input 
//                   className='w-4 h-4 accent-[#008753]' 
//                   type="checkbox" 
//                   value={'Appetizers'} 
//                   onChange={toggleCategory}
//                 /> 
//                 Appetizers
//               </label>
//               <label className='flex items-center gap-2 cursor-pointer'>
//                 <input 
//                   className='w-4 h-4 accent-[#008753]' 
//                   type="checkbox" 
//                   value={'Desserts'} 
//                   onChange={toggleCategory}
//                 /> 
//                 Desserts
//               </label>
//               <label className='flex items-center gap-2 cursor-pointer'>
//                 <input 
//                   className='w-4 h-4 accent-[#008753]' 
//                   type="checkbox" 
//                   value={'Drinks'} 
//                   onChange={toggleCategory}
//                 /> 
//                 Beverages
//               </label>
//             </div>
//           </div>
//         </div>
//         */}

//         {/* Search Results Indicator */}
//         {showSearch && search && (
//           <div className='mb-6'>
//             <p className='text-lg'>
//               Showing results for: <span className='font-semibold text-[#008753]'>"{search}"</span>
//             </p>
//             <p className='text-sm text-gray-600'>
//               {filterProducts.length} {filterProducts.length === 1 ? 'item' : 'items'} found
//             </p>
//           </div>
//         )}

//         {/* Map Products */}
//         {filterProducts.length > 0 ? (
//           <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
//             {filterProducts.map((item, index) => (
//               <ProductItem 
//                 key={index} 
//                 name={item.name} 
//                 id={item._id} 
//                 price={item.price} 
//                 image={item.image} 
//               />
//             ))}
//           </div>
//         ) : (
//           <div className='text-center py-12'>
//             <div className='bg-[#008753]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
//               <img 
//                 src={assets.search_icon} 
//                 className='w-12 opacity-70' 
//                 alt="No results found" 
//               />
//             </div>
//             <h3 className='prata-regular text-2xl text-[#008753] mb-2'>
//               No Food Items Found
//             </h3>
//             <p className='text-gray-600 max-w-md mx-auto'>
//               We couldn't find any dishes matching your search. Try different keywords or browse our full menu.
//             </p>
//             <button 
//               onClick={() => window.location.reload()}
//               className='mt-6 px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors'
//             >
//               View Full Menu
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Collection;


























// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { assets } from '../assets/assets';
// import Title from '../components/Title';
// import ProductItem from '../components/ProductItem';

// const Collection = () => {

//   const { products , search , showSearch } = useContext(ShopContext);
//   const [showFilter,setShowFilter] = useState(false);
//   const [filterProducts,setFilterProducts] = useState([]);
//   const [category,setCategory] = useState([]);
//   // const [subCategory,setSubCategory] = useState([]);
//   const [sortType,setSortType] = useState('relavent')

//   const toggleCategory = (e) => {

//     if (category.includes(e.target.value)) {
//         setCategory(prev=> prev.filter(item => item !== e.target.value))
//     }
//     else{
//       setCategory(prev => [...prev,e.target.value])
//     }

//   }

//   // const toggleSubCategory = (e) => {

//   //   if (subCategory.includes(e.target.value)) {
//   //     setSubCategory(prev=> prev.filter(item => item !== e.target.value))
//   //   }
//   //   else{
//   //     setSubCategory(prev => [...prev,e.target.value])
//   //   }
//   // }

//   const applyFilter = () => {

//     let productsCopy = products.slice();

//     if (showSearch && search) {
//       productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
//     }

//     if (category.length > 0) {
//       productsCopy = productsCopy.filter(item => category.includes(item.category));
//     }

//     // if (subCategory.length > 0 ) {
//     //   productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
//     // }

//     setFilterProducts(productsCopy)

//   }

//   const sortProduct = () => {

//     let fpCopy = filterProducts.slice();

//     switch (sortType) {
//       case 'low-high':
//         setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
//         break;

//       case 'high-low':
//         setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
//         break;

//       default:
//         applyFilter();
//         break;
//     }

//   }

//   useEffect(()=>{
//       applyFilter();
//   },[category,search,showSearch,products])
//   // },[category,subCategory,search,showSearch,products])

//   useEffect(()=>{
//     sortProduct();
//   },[sortType])

//   return (
//     <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      
//       {/* Filter Options */}
//       <div className='min-w-60'>
//         <p onClick={()=>setShowFilter(!showFilter)} className='prata-regular my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
//           <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
//         </p>
//         {/* Category Filter */}
//         <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
//           <p className='prata-regular mb-3 text-sm font-medium'>CATEGORIES</p>
//           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory}/> Men
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory}/> Women
//             </p>
//             {/* <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory}/> kids
//             </p> */}
//           </div>
//         </div>
//         {/* SubCategory Filter */}
//         {/* <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
//           <p className='mb-3 text-sm font-medium'>TYPE</p>
//           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory}/> Topwear
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory}/> Bottomwear
//             </p>
//             <p className='flex gap-2'>
//               <input className='w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory}/> Winterwear
//             </p>
//           </div>
//         </div> */}
//       </div>

//       {/* Right Side */}
//       <div className='flex-1'>

//         <div className='flex justify-between text-base sm:text-2xl mb-4'>
//             <Title text1={'ALL'} text2={'COLLECTIONS'} />
//             {/* Porduct Sort */}
//             <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2 text-black'>
//               <option value="relavent">Sort by: Relavent</option>
//               <option value="low-high">Sort by: Low to High</option>
//               <option value="high-low">Sort by: High to Low</option>
//             </select>
//         </div>

//         {/* Map Products */}
//         <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
//           {
//             filterProducts.map((item,index)=>(
//               <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} />
//             ))
//           }
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Collection
