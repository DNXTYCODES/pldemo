import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const EditProduct = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [category, setCategory] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [availableDays, setAvailableDays] = useState(['everyday']);
  
  // Variations state
  const [variations, setVariations] = useState({
    base: { name: "Base", options: [] },
    side: { name: "Side", options: [] },
    sizes: [],
    wrap: { available: false, price: "" }
  });

  // Days of week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Validate decimal input
  const validateDecimal = (value) => {
    if (value === "") return true;
    return /^\d*\.?\d*$/.test(value);
  };

  // Format price on blur
  const formatPriceOnBlur = (value) => {
    if (value === "") return value;
    
    // Handle empty string
    if (value === "") return "";
    
    // Add trailing zero if ends with decimal
    if (value.endsWith('.')) {
      return value + '0';
    }
    // Add leading zero if starts with decimal
    else if (value.startsWith('.')) {
      return '0' + value;
    }
    // Format whole numbers consistently
    else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return num.toString();
      }
    }
    return value;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
        if (response.data.success) {
          const product = response.data.product;
          setProduct(product);
          setName(product.name);
          setDescription(product.description);
          // Convert to string for input field
          setBasePrice(product.basePrice.toString());
          setCategory(product.category);
          setBestseller(product.bestseller || false);
          setInStock(product.inStock !== false);
          setAvailableDays(product.availableDays || ['everyday']);
          
          // Set variations and convert prices to strings
          if (product.variations) {
            setVariations({
              base: product.variations.base || { name: "Base", options: [] },
              side: product.variations.side || { name: "Side", options: [] },
              sizes: product.variations.sizes ? product.variations.sizes.map(size => ({
                ...size,
                price: size.price.toString()
              })) : [],
              wrap: {
                ...(product.variations.wrap || { available: false, price: 0 }),
                price: product.variations.wrap?.price?.toString() || "0"
              }
            });
          }
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
    
    fetchProduct();
  }, [id]);

  const handleDayChange = (day) => {
    if (day === 'everyday') {
      setAvailableDays(['everyday']);
      return;
    }
    
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays.filter(d => d !== 'everyday'), day]);
    }
  };

  // Handle variation changes
  const handleVariationChange = (type, key, value) => {
    setVariations(prev => ({
      ...prev,
      [type]: { ...prev[type], [key]: value }
    }));
  };

  // Handle size changes
  const handleSizeChange = (index, field, value) => {
    setVariations(prev => {
      const newSizes = [...prev.sizes];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return { ...prev, sizes: newSizes };
    });
  };

  // Add new size
  const addSize = () => {
    setVariations(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "" }]
    }));
  };

  // Remove size
  const removeSize = (index) => {
    setVariations(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  // Handle options changes (for base/side)
  const handleOptionsChange = (type, value) => {
    const options = value.split(',').map(opt => opt.trim());
    setVariations(prev => ({
      ...prev,
      [type]: { ...prev[type], options }
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Convert prices to numbers
    const numericBasePrice = parseFloat(basePrice) || 0;
    
    const numericVariations = {
      ...variations,
      sizes: variations.sizes.map(size => ({
        ...size,
        price: parseFloat(size.price) || 0
      })),
      wrap: {
        ...variations.wrap,
        price: parseFloat(variations.wrap.price) || 0
      }
    };

    try {
      // Create FormData for update
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("basePrice", numericBasePrice);
      formData.append("category", category);
      formData.append("bestseller", bestseller);
      formData.append("inStock", inStock);
      formData.append("variations", JSON.stringify(numericVariations));
      
      // Append available days
      availableDays.forEach(day => {
        formData.append('availableDays', day);
      });

      const response = await axios.post(
        backendUrl + "/api/product/update",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/edit-products');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Product not found</p>
        <button 
          onClick={() => navigate('/edit-products')}
          className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/edit-products')}
          className="flex items-center text-[#008753] hover:text-[#006641]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Products
        </button>
        <h2 className="text-2xl font-bold ml-4 text-[#008753]">Edit Product</h2>
      </div>
      
      {/* User Guide */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">How to Edit Products</h3>
        <ol className="list-decimal pl-5 space-y-2 text-green-700">
          <li><strong>Name & Description:</strong> Update your product name and description</li>
          <li><strong>Prices:</strong> Enter prices like <span className="bg-green-100 px-1 rounded">5.99</span> or <span className="bg-green-100 px-1 rounded">10.50</span> (decimals allowed!)</li>
          <li><strong>Category:</strong> Update the product category if needed</li>
          <li><strong>Availability:</strong> Modify days when customers can order this</li>
          <li><strong>Options:</strong> For bases/sides, separate options with commas</li>
          <li><strong>Sizes:</strong> Add/remove sizes and update their prices</li>
          <li><strong>Wrap Option:</strong> Toggle wrap availability and update price</li>
          <li><strong>Click Update:</strong> When everything looks good, click "Update Product"</li>
        </ol>
      </div>
      
      <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg shadow-md">
        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-medium">Product name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
              type="text" 
              placeholder="Product name"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Base Price</label>
            <input 
              value={basePrice}
              onChange={(e) => {
                if (validateDecimal(e.target.value)) {
                  setBasePrice(e.target.value);
                }
              }}
              onBlur={(e) => {
                const formatted = formatPriceOnBlur(e.target.value);
                setBasePrice(formatted);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
              type="text" 
              inputMode="decimal"
              placeholder="Ex: 9.99"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              <option value="Main Dishes">Main Dishes</option>
              <option value="Soups">Soups & Stews</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Desserts">Desserts</option>
              <option value="Drinks">Beverages</option>
              <option value="Specials">Specials</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Availability</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAvailableDays(['everyday'])}
                className={`px-3 py-1 text-sm rounded-full ${
                  availableDays.includes('everyday') 
                    ? 'bg-[#008753] text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Everyday
              </button>
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayChange(day)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    availableDays.includes(day) 
                      ? 'bg-[#008753] text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[120px]"
            placeholder="Product description"
            required
          />
        </div>

        {/* Stock Status and Bestseller */}
        <div className="mb-6 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
            />
            <span className="font-medium">In Stock</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={bestseller}
              onChange={(e) => setBestseller(e.target.checked)}
              className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
            />
            <span className="font-medium">Bestseller</span>
          </label>
        </div>

        {/* Variations Section */}
        <div className="mb-6 border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Meal Variations</h3>
          
          {/* Base Options */}
          <div className="mb-4">
            <label className="block mb-2">Base Options (comma separated)</label>
            <input
              value={variations.base.options?.join(', ') || ''}
              onChange={(e) => handleOptionsChange('base', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Jerk Chicken, BBQ Chicken"
            />
          </div>

          {/* Side Options */}
          <div className="mb-4">
            <label className="block mb-2">Side Options (comma separated)</label>
            <input
              value={variations.side.options?.join(', ') || ''}
              onChange={(e) => handleOptionsChange('side', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Jollof Rice, Fried Plantain"
            />
          </div>

          {/* Sizes */}
          <div className="mb-4">
            <label className="block mb-2">Sizes</label>
            {variations.sizes?.map((size, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  value={size.size || ''}
                  onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Size name"
                />
                <input
                  value={size.price}
                  onChange={(e) => {
                    if (validateDecimal(e.target.value)) {
                      handleSizeChange(index, 'price', e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    const formatted = formatPriceOnBlur(e.target.value);
                    handleSizeChange(index, 'price', formatted);
                  }}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Price"
                  type="text"
                  inputMode="decimal"
                />
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSize}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Add Size
            </button>
          </div>

          {/* Wrap Option */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="wrapAvailable"
                checked={variations.wrap.available || false}
                onChange={(e) => handleVariationChange('wrap', 'available', e.target.checked)}
                className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
              />
              <label htmlFor="wrapAvailable" className='cursor-pointer font-medium'>
                Offer Wrap Option
              </label>
            </div>
            {variations.wrap.available && (
              <div className="flex gap-2">
                <input
                  value={variations.wrap.price}
                  onChange={(e) => {
                    if (validateDecimal(e.target.value)) {
                      handleVariationChange('wrap', 'price', e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    const formatted = formatPriceOnBlur(e.target.value);
                    handleVariationChange('wrap', 'price', formatted);
                  }}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Wrap price"
                  type="text"
                  inputMode="decimal"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/edit-products')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
          >
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';
// import { useParams, useNavigate } from 'react-router-dom';
// import { assets } from '../assets/assets';

// const EditProduct = ({ token }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Form state
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [basePrice, setBasePrice] = useState('');
//   const [category, setCategory] = useState('');
//   const [bestseller, setBestseller] = useState(false);
//   const [inStock, setInStock] = useState(true);
//   const [availableDays, setAvailableDays] = useState(['everyday']);
  
//   // Variations state
//   const [variations, setVariations] = useState({
//     base: { name: "Base", options: [] },
//     side: { name: "Side", options: [] },
//     sizes: [],
//     wrap: { available: false, price: "" }
//   });

//   // Days of week
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   // Validate decimal input
//   const validateDecimal = (value) => {
//     if (value === "") return true;
//     return /^\d*\.?\d*$/.test(value);
//   };

//   // Format price for display
//   const formatPrice = (value) => {
//     if (value === "") return "";
//     const num = parseFloat(value);
//     return isNaN(num) ? "" : num.toString();
//   };

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
//         if (response.data.success) {
//           const product = response.data.product;
//           setProduct(product);
//           setName(product.name);
//           setDescription(product.description);
//           // Convert to string for input field
//           setBasePrice(product.basePrice.toString());
//           setCategory(product.category);
//           setBestseller(product.bestseller || false);
//           setInStock(product.inStock !== false);
//           setAvailableDays(product.availableDays || ['everyday']);
          
//           // Set variations and convert prices to strings
//           if (product.variations) {
//             setVariations({
//               base: product.variations.base || { name: "Base", options: [] },
//               side: product.variations.side || { name: "Side", options: [] },
//               sizes: product.variations.sizes ? product.variations.sizes.map(size => ({
//                 ...size,
//                 price: size.price.toString()
//               })) : [],
//               wrap: {
//                 ...(product.variations.wrap || { available: false, price: 0 }),
//                 price: product.variations.wrap?.price?.toString() || "0"
//               }
//             });
//           }
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
    
//     fetchProduct();
//   }, [id]);

//   const handleDayChange = (day) => {
//     if (day === 'everyday') {
//       setAvailableDays(['everyday']);
//       return;
//     }
    
//     if (availableDays.includes(day)) {
//       setAvailableDays(availableDays.filter(d => d !== day));
//     } else {
//       setAvailableDays([...availableDays.filter(d => d !== 'everyday'), day]);
//     }
//   };

//   // Handle variation changes
//   const handleVariationChange = (type, key, value) => {
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], [key]: value }
//     }));
//   };

//   // Handle size changes
//   const handleSizeChange = (index, field, value) => {
//     setVariations(prev => {
//       const newSizes = [...prev.sizes];
//       newSizes[index] = { ...newSizes[index], [field]: value };
//       return { ...prev, sizes: newSizes };
//     });
//   };

//   // Add new size
//   const addSize = () => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: [...prev.sizes, { size: "", price: "" }]
//     }));
//   };

//   // Remove size
//   const removeSize = (index) => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: prev.sizes.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle options changes (for base/side)
//   const handleOptionsChange = (type, value) => {
//     const options = value.split(',').map(opt => opt.trim());
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], options }
//     }));
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
    
//     // Convert prices to numbers
//     const numericBasePrice = parseFloat(basePrice) || 0;
    
//     const numericVariations = {
//       ...variations,
//       sizes: variations.sizes.map(size => ({
//         ...size,
//         price: parseFloat(size.price) || 0
//       })),
//       wrap: {
//         ...variations.wrap,
//         price: parseFloat(variations.wrap.price) || 0
//       }
//     };

//     try {
//       // Create FormData for update
//       const formData = new FormData();
//       formData.append("id", id);
//       formData.append("name", name);
//       formData.append("description", description);
//       formData.append("basePrice", numericBasePrice);
//       formData.append("category", category);
//       formData.append("bestseller", bestseller);
//       formData.append("inStock", inStock);
//       formData.append("variations", JSON.stringify(numericVariations));
      
//       // Append available days
//       availableDays.forEach(day => {
//         formData.append('availableDays', day);
//       });

//       const response = await axios.post(
//         backendUrl + "/api/product/update",
//         formData,
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         navigate('/edit-products');
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="text-center py-10">
//         <p className="text-red-500">Product not found</p>
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <div className="flex items-center mb-6">
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="flex items-center text-[#008753] hover:text-[#006641]"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           Back to Products
//         </button>
//         <h2 className="text-2xl font-bold ml-4 text-[#008753]">Edit Product</h2>
//       </div>
      
//       {/* User Guide */}
//       <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//         <h3 className="font-bold text-green-800 mb-2">How to Upload Products</h3>
//         <ol className="list-decimal pl-5 space-y-2 text-green-700">
//           <li><strong>Name & Description:</strong> Give your product a clear name and description</li>
//           <li><strong>Prices:</strong> Enter prices like <span className="bg-green-100 px-1 rounded">5.99</span> or <span className="bg-green-100 px-1 rounded">10.50</span> (decimals allowed!)</li>
//           <li><strong>Category:</strong> Select the best category for your product</li>
//           <li><strong>Availability:</strong> Select days when customers can order this</li>
//           <li><strong>Options:</strong> For bases/sides, separate options with commas: <span className="bg-green-100 px-1 rounded">Option1, Option2, Option3</span></li>
//           <li><strong>Sizes:</strong> Add different sizes with their prices</li>
//           <li><strong>Wrap Option:</strong> Check if you offer wraps and set the extra price</li>
//           <li><strong>Click Update:</strong> When everything looks good, click "Update Product"</li>
//         </ol>
//       </div>
      
//       <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg shadow-md">
//         {/* Product Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2 font-medium">Product name</label>
//             <input 
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="text" 
//               placeholder="Product name"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Base Price</label>
//             <input 
//               value={formatPrice(basePrice)}
//               onChange={(e) => {
//                 if (validateDecimal(e.target.value)) {
//                   setBasePrice(e.target.value);
//                 }
//               }}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="text" 
//               placeholder="Ex: 9.99"
//               pattern="[0-9]*\.?[0-9]*"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Category</label>
//             <select 
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               required
//             >
//               <option value="">Select category</option>
//               <option value="Main Dishes">Main Dishes</option>
//               <option value="Soups">Soups & Stews</option>
//               <option value="Appetizers">Appetizers</option>
//               <option value="Desserts">Desserts</option>
//               <option value="Drinks">Beverages</option>
//               <option value="Specials">Specials</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Availability</label>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() => setAvailableDays(['everyday'])}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   availableDays.includes('everyday') 
//                     ? 'bg-[#008753] text-white' 
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 Everyday
//               </button>
//               {days.map(day => (
//                 <button
//                   key={day}
//                   type="button"
//                   onClick={() => handleDayChange(day)}
//                   className={`px-3 py-1 text-sm rounded-full ${
//                     availableDays.includes(day) 
//                       ? 'bg-[#008753] text-white' 
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                 >
//                   {day.substring(0, 3)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="mb-6">
//           <label className="block mb-2 font-medium">Description</label>
//           <textarea 
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[120px]"
//             placeholder="Product description"
//             required
//           />
//         </div>

//         {/* Stock Status and Bestseller */}
//         <div className="mb-6 flex items-center gap-6">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={inStock}
//               onChange={(e) => setInStock(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">In Stock</span>
//           </label>
          
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={bestseller}
//               onChange={(e) => setBestseller(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">Bestseller</span>
//           </label>
//         </div>

//         {/* Variations Section */}
//         <div className="mb-6 border-t pt-4">
//           <h3 className="text-lg font-medium mb-4">Meal Variations</h3>
          
//           {/* Base Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Base Options (comma separated)</label>
//             <input
//               value={variations.base.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('base', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jerk Chicken, BBQ Chicken"
//             />
//           </div>

//           {/* Side Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Side Options (comma separated)</label>
//             <input
//               value={variations.side.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('side', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jollof Rice, Fried Plantain"
//             />
//           </div>

//           {/* Sizes */}
//           <div className="mb-4">
//             <label className="block mb-2">Sizes</label>
//             {variations.sizes?.map((size, index) => (
//               <div key={index} className="flex gap-2 mb-2">
//                 <input
//                   value={size.size || ''}
//                   onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Size name"
//                 />
//                 <input
//                   value={formatPrice(size.price)}
//                   onChange={(e) => {
//                     if (validateDecimal(e.target.value)) {
//                       handleSizeChange(index, 'price', e.target.value);
//                     }
//                   }}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Price"
//                   type="text"
//                   pattern="[0-9]*\.?[0-9]*"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => removeSize(index)}
//                   className="px-3 py-2 bg-red-500 text-white rounded-lg"
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={addSize}
//               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
//             >
//               Add Size
//             </button>
//           </div>

//           {/* Wrap Option */}
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <input
//                 type="checkbox"
//                 id="wrapAvailable"
//                 checked={variations.wrap.available || false}
//                 onChange={(e) => handleVariationChange('wrap', 'available', e.target.checked)}
//                 className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//               />
//               <label htmlFor="wrapAvailable" className='cursor-pointer font-medium'>
//                 Offer Wrap Option
//               </label>
//             </div>
//             {variations.wrap.available && (
//               <div className="flex gap-2">
//                 <input
//                   value={formatPrice(variations.wrap.price)}
//                   onChange={(e) => {
//                     if (validateDecimal(e.target.value)) {
//                       handleVariationChange('wrap', 'price', e.target.value);
//                     }
//                   }}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Wrap price"
//                   type="text"
//                   pattern="[0-9]*\.?[0-9]*"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={() => navigate('/edit-products')}
//             className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Update Product
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;




























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';
// import { useParams, useNavigate } from 'react-router-dom';
// import { assets } from '../assets/assets';

// const EditProduct = ({ token }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Form state
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [basePrice, setBasePrice] = useState('');
//   const [category, setCategory] = useState('');
//   const [bestseller, setBestseller] = useState(false);
//   const [inStock, setInStock] = useState(true);
//   const [availableDays, setAvailableDays] = useState(['everyday']);
  
//   // Variations state
//   const [variations, setVariations] = useState({
//     base: { name: "Base", options: [] },
//     side: { name: "Side", options: [] },
//     sizes: [],
//     wrap: { available: false, price: 0 }
//   });

//   // Days of week
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
//         if (response.data.success) {
//           const product = response.data.product;
//           setProduct(product);
//           setName(product.name);
//           setDescription(product.description);
//           setBasePrice(product.basePrice);
//           setCategory(product.category);
//           setBestseller(product.bestseller || false);
//           setInStock(product.inStock !== false); // Default to true if undefined
//           setAvailableDays(product.availableDays || ['everyday']);
          
//           // Set variations if they exist, otherwise use defaults
//           if (product.variations) {
//             setVariations({
//               base: product.variations.base || { name: "Base", options: [] },
//               side: product.variations.side || { name: "Side", options: [] },
//               sizes: product.variations.sizes || [],
//               wrap: product.variations.wrap || { available: false, price: 0 }
//             });
//           }
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
    
//     fetchProduct();
//   }, [id]);

//   const handleDayChange = (day) => {
//     if (day === 'everyday') {
//       setAvailableDays(['everyday']);
//       return;
//     }
    
//     if (availableDays.includes(day)) {
//       setAvailableDays(availableDays.filter(d => d !== day));
//     } else {
//       setAvailableDays([...availableDays.filter(d => d !== 'everyday'), day]);
//     }
//   };

//   // Handle variation changes
//   const handleVariationChange = (type, key, value) => {
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], [key]: value }
//     }));
//   };

//   // Handle size changes
//   const handleSizeChange = (index, field, value) => {
//     setVariations(prev => {
//       const newSizes = [...prev.sizes];
//       newSizes[index] = { ...newSizes[index], [field]: value };
//       return { ...prev, sizes: newSizes };
//     });
//   };

//   // Add new size
//   const addSize = () => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: [...prev.sizes, { size: "", price: "" }]
//     }));
//   };

//   // Remove size
//   const removeSize = (index) => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: prev.sizes.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle options changes (for base/side)
//   const handleOptionsChange = (type, value) => {
//     const options = value.split(',').map(opt => opt.trim());
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], options }
//     }));
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
    
//     try {
//       // Create FormData for update
//       const formData = new FormData();
//       formData.append("id", id);
//       formData.append("name", name);
//       formData.append("description", description);
//       formData.append("basePrice", basePrice);
//       formData.append("category", category);
//       formData.append("bestseller", bestseller);
//       formData.append("inStock", inStock);
//       formData.append("variations", JSON.stringify(variations));
      
//       // Append available days
//       availableDays.forEach(day => {
//         formData.append('availableDays', day);
//       });

//       const response = await axios.post(
//         backendUrl + "/api/product/update",
//         formData,
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         navigate('/edit-products');
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="text-center py-10">
//         <p className="text-red-500">Product not found</p>
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <div className="flex items-center mb-6">
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="flex items-center text-[#008753] hover:text-[#006641]"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           Back to Products
//         </button>
//         <h2 className="text-2xl font-bold ml-4 text-[#008753]">Edit Product</h2>
//       </div>
      
//       <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg shadow-md">
//         {/* Product Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2 font-medium">Product name</label>
//             <input 
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="text" 
//               placeholder="Product name"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Base Price</label>
//             <input 
//               value={basePrice}
//               onChange={(e) => setBasePrice(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="number" 
//               placeholder="Base Price"
//               min="0"
//               step="0.01"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Category</label>
//             <select 
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               required
//             >
//               <option value="">Select category</option>
//               <option value="Main Dishes">Main Dishes</option>
//               <option value="Soups">Soups & Stews</option>
//               <option value="Appetizers">Appetizers</option>
//               <option value="Desserts">Desserts</option>
//               <option value="Drinks">Beverages</option>
//               <option value="Specials">Specials</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Availability</label>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() => setAvailableDays(['everyday'])}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   availableDays.includes('everyday') 
//                     ? 'bg-[#008753] text-white' 
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 Everyday
//               </button>
//               {days.map(day => (
//                 <button
//                   key={day}
//                   type="button"
//                   onClick={() => handleDayChange(day)}
//                   className={`px-3 py-1 text-sm rounded-full ${
//                     availableDays.includes(day) 
//                       ? 'bg-[#008753] text-white' 
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                 >
//                   {day.substring(0, 3)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="mb-6">
//           <label className="block mb-2 font-medium">Description</label>
//           <textarea 
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[120px]"
//             placeholder="Product description"
//             required
//           />
//         </div>

//         {/* Stock Status and Bestseller */}
//         <div className="mb-6 flex items-center gap-6">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={inStock}
//               onChange={(e) => setInStock(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">In Stock</span>
//           </label>
          
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={bestseller}
//               onChange={(e) => setBestseller(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">Bestseller</span>
//           </label>
//         </div>

//         {/* Variations Section */}
//         <div className="mb-6 border-t pt-4">
//           <h3 className="text-lg font-medium mb-4">Meal Variations</h3>
          
//           {/* Base Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Base Options (comma separated)</label>
//             <input
//               value={variations.base.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('base', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jerk Chicken, BBQ Chicken"
//             />
//           </div>

//           {/* Side Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Side Options (comma separated)</label>
//             <input
//               value={variations.side.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('side', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jollof Rice, Fried Plantain"
//             />
//           </div>

//           {/* Sizes */}
//           <div className="mb-4">
//             <label className="block mb-2">Sizes</label>
//             {variations.sizes?.map((size, index) => (
//               <div key={index} className="flex gap-2 mb-2">
//                 <input
//                   value={size.size || ''}
//                   onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Size name"
//                 />
//                 <input
//                   value={size.price || ''}
//                   onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Price"
//                   type="number"
//                   min="0"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => removeSize(index)}
//                   className="px-3 py-2 bg-red-500 text-white rounded-lg"
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={addSize}
//               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
//             >
//               Add Size
//             </button>
//           </div>

//           {/* Wrap Option */}
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <input
//                 type="checkbox"
//                 id="wrapAvailable"
//                 checked={variations.wrap.available || false}
//                 onChange={(e) => handleVariationChange('wrap', 'available', e.target.checked)}
//                 className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//               />
//               <label htmlFor="wrapAvailable" className='cursor-pointer font-medium'>
//                 Offer Wrap Option
//               </label>
//             </div>
//             {variations.wrap.available && (
//               <div className="flex gap-2">
//                 <input
//                   value={variations.wrap.price || 0}
//                   onChange={(e) => handleVariationChange('wrap', 'price', e.target.value)}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Wrap price"
//                   type="number"
//                   min="0"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={() => navigate('/edit-products')}
//             className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Update Product
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';
// import { useParams, useNavigate } from 'react-router-dom';
// import { assets } from '../assets/assets';

// const EditProduct = ({ token }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Form state
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [basePrice, setBasePrice] = useState('');
//   const [category, setCategory] = useState('');
//   const [bestseller, setBestseller] = useState(false);
//   const [inStock, setInStock] = useState(true);
//   const [availableDays, setAvailableDays] = useState(['everyday']);
  
//   // Variations state
//   const [variations, setVariations] = useState({
//     base: { name: "Base", options: [] },
//     side: { name: "Side", options: [] },
//     sizes: [],
//     wrap: { available: false, price: 0 }
//   });

//   // Days of week
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
//         if (response.data.success) {
//           const product = response.data.product;
//           setProduct(product);
//           setName(product.name);
//           setDescription(product.description);
//           setBasePrice(product.basePrice);
//           setCategory(product.category);
//           setBestseller(product.bestseller);
//           setInStock(product.inStock !== false); // Default to true if undefined
//           setAvailableDays(product.availableDays || ['everyday']);
          
//           // Set variations if they exist, otherwise use defaults
//           if (product.variations) {
//             setVariations({
//               base: product.variations.base || { name: "Base", options: [] },
//               side: product.variations.side || { name: "Side", options: [] },
//               sizes: product.variations.sizes || [],
//               wrap: product.variations.wrap || { available: false, price: 0 }
//             });
//           }
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
    
//     fetchProduct();
//   }, [id]);

//   const handleDayChange = (day) => {
//     if (day === 'everyday') {
//       setAvailableDays(['everyday']);
//       return;
//     }
    
//     if (availableDays.includes(day)) {
//       setAvailableDays(availableDays.filter(d => d !== day));
//     } else {
//       setAvailableDays([...availableDays.filter(d => d !== 'everyday'), day]);
//     }
//   };

//   // Handle variation changes
//   const handleVariationChange = (type, key, value) => {
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], [key]: value }
//     }));
//   };

//   // Handle size changes
//   const handleSizeChange = (index, field, value) => {
//     setVariations(prev => {
//       const newSizes = [...prev.sizes];
//       newSizes[index] = { ...newSizes[index], [field]: value };
//       return { ...prev, sizes: newSizes };
//     });
//   };

//   // Add new size
//   const addSize = () => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: [...prev.sizes, { size: "", price: "" }]
//     }));
//   };

//   // Remove size
//   const removeSize = (index) => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: prev.sizes.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle options changes (for base/side)
//   const handleOptionsChange = (type, value) => {
//     const options = value.split(',').map(opt => opt.trim());
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], options }
//     }));
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/product/update",
//         {
//           id,
//           name,
//           description,
//           basePrice,
//           category,
//           bestseller,
//           availableDays,
//           inStock,
//           variations: JSON.stringify(variations)
//         },
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         navigate('/edit-products');
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="text-center py-10">
//         <p className="text-red-500">Product not found</p>
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <div className="flex items-center mb-6">
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="flex items-center text-[#008753] hover:text-[#006641]"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           Back to Products
//         </button>
//         <h2 className="text-2xl font-bold ml-4 text-[#008753]">Edit Product</h2>
//       </div>
      
//       <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg shadow-md">
//         {/* Product Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2 font-medium">Product name</label>
//             <input 
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="text" 
//               placeholder="Product name"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Base Price</label>
//             <input 
//               value={basePrice}
//               onChange={(e) => setBasePrice(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="number" 
//               placeholder="Base Price"
//               min="0"
//               step="0.01"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Category</label>
//             <select 
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               required
//             >
//               <option value="">Select category</option>
//               <option value="Main Dishes">Main Dishes</option>
//               <option value="Soups">Soups & Stews</option>
//               <option value="Appetizers">Appetizers</option>
//               <option value="Desserts">Desserts</option>
//               <option value="Drinks">Beverages</option>
//               <option value="Specials">Specials</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Availability</label>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() => setAvailableDays(['everyday'])}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   availableDays.includes('everyday') 
//                     ? 'bg-[#008753] text-white' 
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 Everyday
//               </button>
//               {days.map(day => (
//                 <button
//                   key={day}
//                   type="button"
//                   onClick={() => handleDayChange(day)}
//                   className={`px-3 py-1 text-sm rounded-full ${
//                     availableDays.includes(day) 
//                       ? 'bg-[#008753] text-white' 
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                 >
//                   {day.substring(0, 3)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="mb-6">
//           <label className="block mb-2 font-medium">Description</label>
//           <textarea 
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[120px]"
//             placeholder="Product description"
//             required
//           />
//         </div>

//         {/* Stock Status */}
//         <div className="mb-6 flex items-center gap-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={inStock}
//               onChange={(e) => setInStock(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">In Stock</span>
//           </label>
          
//           {/* Bestseller */}
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={bestseller}
//               onChange={(e) => setBestseller(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">Bestseller</span>
//           </label>
//         </div>

//         {/* Variations Section */}
//         <div className="mb-6 border-t pt-4">
//           <h3 className="text-lg font-medium mb-4">Meal Variations</h3>
          
//           {/* Base Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Base Options (comma separated)</label>
//             <input
//               value={variations.base.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('base', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jerk Chicken, BBQ Chicken"
//             />
//           </div>

//           {/* Side Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Side Options (comma separated)</label>
//             <input
//               value={variations.side.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('side', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jollof Rice, Fried Plantain"
//             />
//           </div>

//           {/* Sizes */}
//           <div className="mb-4">
//             <label className="block mb-2">Sizes</label>
//             {variations.sizes?.map((size, index) => (
//               <div key={index} className="flex gap-2 mb-2">
//                 <input
//                   value={size.size || ''}
//                   onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Size name"
//                 />
//                 <input
//                   value={size.price || ''}
//                   onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Price"
//                   type="number"
//                   min="0"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => removeSize(index)}
//                   className="px-3 py-2 bg-red-500 text-white rounded-lg"
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={addSize}
//               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
//             >
//               Add Size
//             </button>
//           </div>

//           {/* Wrap Option */}
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <input
//                 type="checkbox"
//                 id="wrapAvailable"
//                 checked={variations.wrap.available || false}
//                 onChange={(e) => handleVariationChange('wrap', 'available', e.target.checked)}
//                 className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//               />
//               <label htmlFor="wrapAvailable" className='cursor-pointer font-medium'>
//                 Offer Wrap Option
//               </label>
//             </div>
//             {variations.wrap.available && (
//               <div className="flex gap-2">
//                 <input
//                   value={variations.wrap.price || 0}
//                   onChange={(e) => handleVariationChange('wrap', 'price', e.target.value)}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Wrap price"
//                   type="number"
//                   min="0"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={() => navigate('/edit-products')}
//             className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Update Product
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;

































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';
// import { useParams, useNavigate } from 'react-router-dom';
// import { assets } from '../assets/assets';

// const EditProduct = ({ token }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Form state
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [basePrice, setBasePrice] = useState('');
//   const [category, setCategory] = useState('');
//   const [bestseller, setBestseller] = useState(false);
//   const [inStock, setInStock] = useState(true);
//   const [availableDays, setAvailableDays] = useState(['everyday']);
  
//   // Variations state
//   const [variations, setVariations] = useState({
//     base: { name: "Base", options: [] },
//     side: { name: "Side", options: [] },
//     sizes: [],
//     wrap: { available: false, price: 0 }
//   });

//   // Days of week
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
//         if (response.data.success) {
//           const product = response.data.product;
//           setProduct(product);
//           setName(product.name);
//           setDescription(product.description);
//           setBasePrice(product.basePrice);
//           setCategory(product.category);
//           setBestseller(product.bestseller);
//           setInStock(product.inStock !== false); // Default to true if undefined
//           setAvailableDays(product.availableDays || ['everyday']);
          
//           // Set variations if they exist, otherwise use defaults
//           if (product.variations) {
//             setVariations({
//               base: product.variations.base || { name: "Base", options: [] },
//               side: product.variations.side || { name: "Side", options: [] },
//               sizes: product.variations.sizes || [],
//               wrap: product.variations.wrap || { available: false, price: 0 }
//             });
//           }
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
    
//     fetchProduct();
//   }, [id]);

//   const handleDayChange = (day) => {
//     if (day === 'everyday') {
//       setAvailableDays(['everyday']);
//       return;
//     }
    
//     if (availableDays.includes(day)) {
//       setAvailableDays(availableDays.filter(d => d !== day));
//     } else {
//       setAvailableDays([...availableDays.filter(d => d !== 'everyday'), day]);
//     }
//   };

//   // Handle variation changes
//   const handleVariationChange = (type, key, value) => {
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], [key]: value }
//     }));
//   };

//   // Handle size changes
//   const handleSizeChange = (index, field, value) => {
//     setVariations(prev => {
//       const newSizes = [...prev.sizes];
//       newSizes[index] = { ...newSizes[index], [field]: value };
//       return { ...prev, sizes: newSizes };
//     });
//   };

//   // Add new size
//   const addSize = () => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: [...prev.sizes, { size: "", price: "" }]
//     }));
//   };

//   // Remove size
//   const removeSize = (index) => {
//     setVariations(prev => ({
//       ...prev,
//       sizes: prev.sizes.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle options changes (for base/side)
//   const handleOptionsChange = (type, value) => {
//     const options = value.split(',').map(opt => opt.trim());
//     setVariations(prev => ({
//       ...prev,
//       [type]: { ...prev[type], options }
//     }));
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/product/update",
//         {
//           id,
//           name,
//           description,
//           basePrice,
//           category,
//           bestseller,
//           availableDays,
//           inStock,
//           variations: JSON.stringify(variations)
//         },
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         navigate('/edit-products');
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="text-center py-10">
//         <p className="text-red-500">Product not found</p>
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <div className="flex items-center mb-6">
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="flex items-center text-[#008753] hover:text-[#006641]"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           Back to Products
//         </button>
//         <h2 className="text-2xl font-bold ml-4 text-[#008753]">Edit Product</h2>
//       </div>
      
//       <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg shadow-md">
//         {/* Product Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2 font-medium">Product name</label>
//             <input 
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="text" 
//               placeholder="Product name"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Base Price</label>
//             <input 
//               value={basePrice}
//               onChange={(e) => setBasePrice(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="number" 
//               placeholder="Base Price"
//               min="0"
//               step="0.01"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Category</label>
//             <select 
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               required
//             >
//               <option value="">Select category</option>
//               <option value="Main Dishes">Main Dishes</option>
//               <option value="Soups">Soups & Stews</option>
//               <option value="Appetizers">Appetizers</option>
//               <option value="Desserts">Desserts</option>
//               <option value="Drinks">Beverages</option>
//               <option value="Specials">Specials</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Availability</label>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() => setAvailableDays(['everyday'])}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   availableDays.includes('everyday') 
//                     ? 'bg-[#008753] text-white' 
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 Everyday
//               </button>
//               {days.map(day => (
//                 <button
//                   key={day}
//                   type="button"
//                   onClick={() => handleDayChange(day)}
//                   className={`px-3 py-1 text-sm rounded-full ${
//                     availableDays.includes(day) 
//                       ? 'bg-[#008753] text-white' 
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                 >
//                   {day.substring(0, 3)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="mb-6">
//           <label className="block mb-2 font-medium">Description</label>
//           <textarea 
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[120px]"
//             placeholder="Product description"
//             required
//           />
//         </div>

//         {/* Stock Status */}
//         <div className="mb-6 flex items-center gap-4">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={inStock}
//               onChange={(e) => setInStock(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">In Stock</span>
//           </label>
          
//           {/* Bestseller */}
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={bestseller}
//               onChange={(e) => setBestseller(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">Bestseller</span>
//           </label>
//         </div>

//         {/* Variations Section */}
//         <div className="mb-6 border-t pt-4">
//           <h3 className="text-lg font-medium mb-4">Meal Variations</h3>
          
//           {/* Base Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Base Options (comma separated)</label>
//             <input
//               value={variations.base.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('base', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jerk Chicken, BBQ Chicken"
//             />
//           </div>

//           {/* Side Options */}
//           <div className="mb-4">
//             <label className="block mb-2">Side Options (comma separated)</label>
//             <input
//               value={variations.side.options?.join(', ') || ''}
//               onChange={(e) => handleOptionsChange('side', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               placeholder="e.g. Jollof Rice, Fried Plantain"
//             />
//           </div>

//           {/* Sizes */}
//           <div className="mb-4">
//             <label className="block mb-2">Sizes</label>
//             {variations.sizes?.map((size, index) => (
//               <div key={index} className="flex gap-2 mb-2">
//                 <input
//                   value={size.size || ''}
//                   onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Size name"
//                 />
//                 <input
//                   value={size.price || ''}
//                   onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Price"
//                   type="number"
//                   min="0"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => removeSize(index)}
//                   className="px-3 py-2 bg-red-500 text-white rounded-lg"
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={addSize}
//               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
//             >
//               Add Size
//             </button>
//           </div>

//           {/* Wrap Option */}
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <input
//                 type="checkbox"
//                 id="wrapAvailable"
//                 checked={variations.wrap.available || false}
//                 onChange={(e) => handleVariationChange('wrap', 'available', e.target.checked)}
//                 className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//               />
//               <label htmlFor="wrapAvailable" className='cursor-pointer font-medium'>
//                 Offer Wrap Option
//               </label>
//             </div>
//             {variations.wrap.available && (
//               <div className="flex gap-2">
//                 <input
//                   value={variations.wrap.price || 0}
//                   onChange={(e) => handleVariationChange('wrap', 'price', e.target.value)}
//                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
//                   placeholder="Wrap price"
//                   type="number"
//                   min="0"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={() => navigate('/edit-products')}
//             className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Update Product
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;



























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';
// import { useParams, useNavigate } from 'react-router-dom';

// const EditProduct = ({ token }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Form state
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [price, setPrice] = useState('');
//   const [category, setCategory] = useState('');
//   const [bestseller, setBestseller] = useState(false);
//   const [availableDays, setAvailableDays] = useState(['everyday']);
  
//   // Days of week
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
//         if (response.data.success) {
//           const product = response.data.product;
//           setProduct(product);
//           setName(product.name);
//           setDescription(product.description);
//           setPrice(product.price);
//           setCategory(product.category);
//           setBestseller(product.bestseller);
//           setAvailableDays(product.availableDays || ['everyday']);
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
    
//     fetchProduct();
//   }, [id]);

//   const handleDayChange = (day) => {
//     if (day === 'everyday') {
//       setAvailableDays(['everyday']);
//       return;
//     }
    
//     if (availableDays.includes(day)) {
//       setAvailableDays(availableDays.filter(d => d !== day));
//     } else {
//       setAvailableDays([...availableDays.filter(d => d !== 'everyday'), day]);
//     }
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/product/update",
//         {
//           id,
//           name,
//           description,
//           price,
//           category,
//           bestseller,
//           availableDays
//         },
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         navigate('/edit-products');
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="text-center py-10">
//         <p className="text-red-500">Product not found</p>
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="mt-4 px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <div className="flex items-center mb-6">
//         <button 
//           onClick={() => navigate('/edit-products')}
//           className="flex items-center text-[#008753] hover:text-[#006641]"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           Back to Products
//         </button>
//         <h2 className="text-2xl font-bold ml-4 text-[#008753]">Edit Product</h2>
//       </div>
      
//       <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg shadow-md">
//         {/* Product Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2 font-medium">Product name</label>
//             <input 
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="text" 
//               placeholder="Product name"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Price</label>
//             <input 
//               value={price}
//               onChange={(e) => setPrice(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               type="number" 
//               placeholder="Price"
//               min="0"
//               step="0.01"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Category</label>
//             <select 
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent"
//               required
//             >
//               <option value="">Select category</option>
//               <option value="Main Dishes">Main Dishes</option>
//               <option value="Soups">Soups & Stews</option>
//               <option value="Appetizers">Appetizers</option>
//               <option value="Desserts">Desserts</option>
//               <option value="Drinks">Beverages</option>
//               <option value="Specials">Specials</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block mb-2 font-medium">Availability</label>
//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() => setAvailableDays(['everyday'])}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   availableDays.includes('everyday') 
//                     ? 'bg-[#008753] text-white' 
//                     : 'bg-gray-200 text-gray-700'
//                 }`}
//               >
//                 Everyday
//               </button>
//               {days.map(day => (
//                 <button
//                   key={day}
//                   type="button"
//                   onClick={() => handleDayChange(day)}
//                   className={`px-3 py-1 text-sm rounded-full ${
//                     availableDays.includes(day) 
//                       ? 'bg-[#008753] text-white' 
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                 >
//                   {day.substring(0, 3)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="mb-6">
//           <label className="block mb-2 font-medium">Description</label>
//           <textarea 
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent min-h-[120px]"
//             placeholder="Product description"
//             required
//           />
//         </div>

//         {/* Bestseller */}
//         <div className="mb-6">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input 
//               type="checkbox" 
//               checked={bestseller}
//               onChange={(e) => setBestseller(e.target.checked)}
//               className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//             />
//             <span className="font-medium">Mark as bestseller</span>
//           </label>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={() => navigate('/edit-products')}
//             className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//           >
//             Update Product
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;