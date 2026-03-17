import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  // Image states
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [category, setCategory] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [inStock, setInStock] = useState(true);

  // Availability by day states
  const [availableDays, setAvailableDays] = useState(["everyday"]);
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Variations state
  const [variations, setVariations] = useState({
    base: { name: "Base", options: [] },
    side: { name: "Side", options: [] },
    sizes: [],
    wrap: { available: false, price: "" },
  });

  // Validate decimal input
  const validateDecimal = (value) => {
    if (value === "") return true;
    return /^\d*\.?\d*$/.test(value);
  };

  // Handle day selection
  const handleDayChange = (day) => {
    if (day === "everyday") {
      setAvailableDays(["everyday"]);
      return;
    }

    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays.filter((d) => d !== "everyday"), day]);
    }
  };

  // Handle variation changes
  const handleVariationChange = (type, key, value) => {
    setVariations((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));
  };

  // Handle size changes
  const handleSizeChange = (index, field, value) => {
    setVariations((prev) => {
      const newSizes = [...prev.sizes];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return { ...prev, sizes: newSizes };
    });
  };

  // Add new size
  const addSize = () => {
    setVariations((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "" }],
    }));
  };

  // Remove size
  const removeSize = (index) => {
    setVariations((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // Handle options changes (for base/side)
  const handleOptionsChange = (type, value) => {
    const options = value.split(",").map((opt) => opt.trim());
    setVariations((prev) => ({
      ...prev,
      [type]: { ...prev[type], options },
    }));
  };

  // Format price on blur
  const formatPriceOnBlur = (value, setter) => {
    if (value === "") return;

    // Add trailing zero if ends with decimal
    if (value.endsWith(".")) {
      setter(value + "0");
    }
    // Add leading zero if starts with decimal
    else if (value.startsWith(".")) {
      setter("0" + value);
    }
    // Format whole numbers consistently
    else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setter(num.toString());
      }
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Convert price strings to numbers
    const numericBasePrice = basePrice ? parseFloat(basePrice) : 0;

    const numericVariations = {
      ...variations,
      sizes: variations.sizes.map((size) => ({
        ...size,
        price: size.price ? parseFloat(size.price) : 0,
      })),
      wrap: {
        ...variations.wrap,
        price: variations.wrap.price ? parseFloat(variations.wrap.price) : 0,
      },
    };

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("basePrice", numericBasePrice);
      formData.append("category", category);
      formData.append("bestseller", bestseller);
      formData.append("inStock", inStock);
      formData.append("variations", JSON.stringify(numericVariations));

      // Append each available day individually
      availableDays.forEach((day) => {
        formData.append("availableDays", day);
      });

      // Append images
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setName("");
        setDescription("");
        setBasePrice("");
        setCategory("");
        setBestseller(false);
        setInStock(true);
        setAvailableDays(["everyday"]);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setVariations({
          base: { name: "Base", options: [] },
          side: { name: "Side", options: [] },
          sizes: [],
          wrap: { available: false, price: "" },
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Add New Product
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Create a new product with images, pricing, and variations
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              📸 Product Images
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload up to 4 images (recommended: at least 2)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((num) => (
                <label
                  key={num}
                  htmlFor={`image${num}`}
                  className="cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all bg-gray-50">
                    <img
                      className="w-full aspect-square object-cover"
                      src={
                        !eval(`image${num}`)
                          ? assets.upload_area
                          : URL.createObjectURL(eval(`image${num}`))
                      }
                      alt={`Product ${num}`}
                    />
                  </div>
                  <input
                    onChange={(e) => eval(`setImage${num}`)(e.target.files[0])}
                    type="file"
                    accept="image/*"
                    id={`image${num}`}
                    hidden
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              📝 Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm sm:text-base font-medium text-gray-900 mb-2 block">
                  Product Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  type="text"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="text-sm sm:text-base font-medium text-gray-900 mb-2 block">
                  Description
                </label>
                <textarea
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base h-24 sm:h-28 resize-none"
                  placeholder="Write a detailed description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm sm:text-base font-medium text-gray-900 mb-2 block">
                    Base Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      onChange={(e) => {
                        if (validateDecimal(e.target.value)) {
                          setBasePrice(e.target.value);
                        }
                      }}
                      onBlur={() => formatPriceOnBlur(basePrice, setBasePrice)}
                      value={basePrice}
                      className="w-full pl-8 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      inputMode="decimal"
                      placeholder="9.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm sm:text-base font-medium text-gray-900 mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Main Dishes">Main Dishes</option>
                    <option value="Soups">Soups & Stews</option>
                    <option value="Appetizers">Appetizers</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Beverages</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Availability Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              ⏰ Availability & Status
            </h2>

            <div className="space-y-4">
              {/* Availability Days */}
              <div>
                <label className="text-sm sm:text-base font-medium text-gray-900 mb-3 block">
                  Which days is this available?
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAvailableDays(["everyday"])}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all ${
                      availableDays.includes("everyday")
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Everyday
                  </button>
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayChange(day)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all ${
                        availableDays.includes(day)
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-blue-600"
                  />
                  <label
                    htmlFor="inStock"
                    className="cursor-pointer text-sm sm:text-base text-gray-900 font-medium"
                  >
                    ✅ In Stock
                  </label>
                </div>

                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    id="bestseller"
                    checked={bestseller}
                    onChange={(e) => setBestseller(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-blue-600"
                  />
                  <label
                    htmlFor="bestseller"
                    className="cursor-pointer text-sm sm:text-base text-gray-900 font-medium"
                  >
                    ⭐ Add to bestseller
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Variations Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              🍽️ Meal Variations (Optional)
            </h2>

            <div className="space-y-6">
              {/* Base Options */}
              <div>
                <label className="text-sm sm:text-base font-medium text-gray-900 mb-2 block">
                  Base Options
                  <span className="text-gray-500 text-xs">
                    (comma separated)
                  </span>
                </label>
                <input
                  value={variations.base.options.join(", ")}
                  onChange={(e) => handleOptionsChange("base", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g. Jerk Chicken, BBQ Chicken"
                />
              </div>

              {/* Side Options */}
              <div>
                <label className="text-sm sm:text-base font-medium text-gray-900 mb-2 block">
                  Side Options
                  <span className="text-gray-500 text-xs">
                    (comma separated)
                  </span>
                </label>
                <input
                  value={variations.side.options.join(", ")}
                  onChange={(e) => handleOptionsChange("side", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g. Jollof Rice, Fried Plantain"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="text-sm sm:text-base font-medium text-gray-900 mb-3 block">
                  Sizes
                </label>
                <div className="space-y-2">
                  {variations.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        value={size.size}
                        onChange={(e) =>
                          handleSizeChange(index, "size", e.target.value)
                        }
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Size name (e.g., Small)"
                      />
                      <div className="relative flex-1 sm:flex-none sm:w-28">
                        <span className="absolute left-4 top-3 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          value={size.price}
                          onChange={(e) => {
                            if (validateDecimal(e.target.value)) {
                              handleSizeChange(index, "price", e.target.value);
                            }
                          }}
                          onBlur={() => {
                            formatPriceOnBlur(size.price, (value) =>
                              handleSizeChange(index, "price", value),
                            );
                          }}
                          className="w-full pl-8 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Price"
                          type="text"
                          inputMode="decimal"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg font-medium transition-all text-sm sm:text-base"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSize}
                  className="mt-3 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm sm:text-base"
                >
                  + Add Size
                </button>
              </div>

              {/* Wrap Option */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-3 items-center mb-3">
                  <input
                    type="checkbox"
                    id="wrapAvailable"
                    checked={variations.wrap.available}
                    onChange={(e) =>
                      handleVariationChange(
                        "wrap",
                        "available",
                        e.target.checked,
                      )
                    }
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-blue-600"
                  />
                  <label
                    htmlFor="wrapAvailable"
                    className="cursor-pointer text-sm sm:text-base text-gray-900 font-medium"
                  >
                    🌯 Offer Wrap Option
                  </label>
                </div>
                {variations.wrap.available && (
                  <div className="relative inline-block">
                    <span className="absolute left-4 top-3 text-gray-500">
                      $
                    </span>
                    <input
                      value={variations.wrap.price}
                      onChange={(e) => {
                        if (validateDecimal(e.target.value)) {
                          handleVariationChange(
                            "wrap",
                            "price",
                            e.target.value,
                          );
                        }
                      }}
                      onBlur={() => {
                        formatPriceOnBlur(variations.wrap.price, (value) =>
                          handleVariationChange("wrap", "price", value),
                        );
                      }}
                      className="w-32 pl-8 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Price"
                      type="text"
                      inputMode="decimal"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-base sm:text-lg"
            >
              ✓ ADD Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;

// import React, { useState } from 'react';
// import { assets } from '../assets/assets';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';

// const Add = ({ token }) => {
//   // Image states
//   const [image1, setImage1] = useState(false);
//   const [image2, setImage2] = useState(false);
//   const [image3, setImage3] = useState(false);
//   const [image4, setImage4] = useState(false);

//   // Form states
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [basePrice, setBasePrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [bestseller, setBestseller] = useState(false);
//   const [inStock, setInStock] = useState(true);

//   // Availability by day states
//   const [availableDays, setAvailableDays] = useState(['everyday']);
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   // Variations state
//   const [variations, setVariations] = useState({
//     base: { name: "Base", options: [] },
//     side: { name: "Side", options: [] },
//     sizes: [],
//     wrap: { available: false, price: 0 }
//   });

//   // Handle day selection
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
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("description", description);
//       formData.append("basePrice", basePrice);
//       formData.append("category", category);
//       formData.append("bestseller", bestseller);
//       formData.append("inStock", inStock);
//       formData.append("variations", JSON.stringify(variations));

//       // Append each available day individually
//       availableDays.forEach(day => {
//         formData.append('availableDays', day);
//       });

//       // Append images
//       image1 && formData.append("image1", image1);
//       image2 && formData.append("image2", image2);
//       image3 && formData.append("image3", image3);
//       image4 && formData.append("image4", image4);

//       const response = await axios.post(
//         backendUrl + "/api/product/add",
//         formData,
//         { headers: { token } }
//       );

//       if (response.data.success) {
//         toast.success(response.data.message);
//         // Reset form
//         setName('');
//         setDescription('');
//         setBasePrice('');
//         setCategory('');
//         setBestseller(false);
//         setInStock(true);
//         setAvailableDays(['everyday']);
//         setImage1(false);
//         setImage2(false);
//         setImage3(false);
//         setImage4(false);
//         setVariations({
//           base: { name: "Base", options: [] },
//           side: { name: "Side", options: [] },
//           sizes: [],
//           wrap: { available: false, price: 0 }
//         });
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   return (
//     <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
//       <div>
//         <p className='mb-2'>Upload Image</p>
//         <div className='flex gap-2'>
//           {[1, 2, 3, 4].map((num) => (
//             <label key={num} htmlFor={`image${num}`}>
//               <img
//                 className='w-20'
//                 src={!eval(`image${num}`) ? assets.upload_area : URL.createObjectURL(eval(`image${num}`))}
//                 alt=""
//               />
//               <input
//                 onChange={(e) => eval(`setImage${num}`)(e.target.files[0])}
//                 type="file"
//                 id={`image${num}`}
//                 hidden
//               />
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>Product name</p>
//         <input
//           onChange={(e) => setName(e.target.value)}
//           value={name}
//           className='w-full max-w-[500px] px-3 py-2 border rounded'
//           type="text"
//           placeholder='Type here'
//           required
//         />
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>Product description</p>
//         <textarea
//           onChange={(e) => setDescription(e.target.value)}
//           value={description}
//           className='w-full max-w-[500px] px-3 py-2 border rounded'
//           placeholder='Write content here'
//           required
//         />
//       </div>

//       <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
//         <div>
//           <p className='mb-2'>Base Price</p>
//           <input
//             onChange={(e) => setBasePrice(e.target.value)}
//             value={basePrice}
//             className='w-full px-3 py-2 sm:w-[120px] border rounded'
//             type="Number"
//             placeholder='25'
//             min="0"
//           />
//         </div>

//         <div>
//           <p className='mb-2'>Product Category</p>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className='w-full px-3 py-2 border rounded'
//             required
//           >
//             <option value="">Select category</option>
//             <option value="Main Dishes">Main Dishes</option>
//             <option value="Soups">Soups & Stews</option>
//             <option value="Appetizers">Appetizers</option>
//             <option value="Desserts">Desserts</option>
//             <option value="Drinks">Beverages</option>
//             <option value="Specials">Specials</option>
//           </select>
//         </div>
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>Availability</p>
//         <div className='flex flex-wrap gap-2'>
//           <button
//             type="button"
//             onClick={() => setAvailableDays(['everyday'])}
//             className={`px-3 py-1 text-sm rounded-full ${
//               availableDays.includes('everyday')
//                 ? 'bg-green-500 text-white'
//                 : 'bg-gray-200 text-gray-700'
//             }`}
//           >
//             Everyday
//           </button>
//           {days.map(day => (
//             <button
//               key={day}
//               type="button"
//               onClick={() => handleDayChange(day)}
//               className={`px-3 py-1 text-sm rounded-full ${
//                 availableDays.includes(day)
//                   ? 'bg-green-500 text-white'
//                   : 'bg-gray-200 text-gray-700'
//               }`}
//             >
//               {day.substring(0, 3)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Stock Status */}
//       <div className='flex gap-2 mt-2 items-center'>
//         <input
//           type="checkbox"
//           id="inStock"
//           checked={inStock}
//           onChange={(e) => setInStock(e.target.checked)}
//           className="w-5 h-5"
//         />
//         <label htmlFor="inStock" className='cursor-pointer'>
//           In Stock
//         </label>
//       </div>

//       {/* Bestseller */}
//       <div className='flex gap-2 mt-2 items-center'>
//         <input
//           type="checkbox"
//           id='bestseller'
//           checked={bestseller}
//           onChange={(e) => setBestseller(e.target.checked)}
//           className="w-5 h-5"
//         />
//         <label htmlFor="bestseller" className='cursor-pointer'>
//           Add to bestseller
//         </label>
//       </div>

//       {/* Variations Section */}
//       <div className="w-full mt-6 border-t pt-4">
//         <h3 className="text-lg font-medium mb-4">Meal Variations</h3>

//         {/* Base Options */}
//         <div className="mb-4">
//           <label className="block mb-2">Base Options (comma separated)</label>
//           <input
//             value={variations.base.options.join(', ')}
//             onChange={(e) => handleOptionsChange('base', e.target.value)}
//             className="w-full max-w-[500px] px-3 py-2 border rounded"
//             placeholder="e.g. Jerk Chicken, BBQ Chicken"
//           />
//         </div>

//         {/* Side Options */}
//         <div className="mb-4">
//           <label className="block mb-2">Side Options (comma separated)</label>
//           <input
//             value={variations.side.options.join(', ')}
//             onChange={(e) => handleOptionsChange('side', e.target.value)}
//             className="w-full max-w-[500px] px-3 py-2 border rounded"
//             placeholder="e.g. Jollof Rice, Fried Plantain"
//           />
//         </div>

//         {/* Sizes */}
//         <div className="mb-4">
//           <label className="block mb-2">Sizes</label>
//           {variations.sizes.map((size, index) => (
//             <div key={index} className="flex gap-2 mb-2">
//               <input
//                 value={size.size}
//                 onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
//                 className="flex-1 px-3 py-2 border rounded"
//                 placeholder="Size name"
//               />
//               <input
//                 value={size.price}
//                 onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
//                 className="w-32 px-3 py-2 border rounded"
//                 placeholder="Price"
//                 type="number"
//                 min="0"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeSize(index)}
//                 className="px-3 py-2 bg-red-500 text-white rounded"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addSize}
//             className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Add Size
//           </button>
//         </div>

//         {/* Wrap Option */}
//         <div className="mb-4">
//           <div className="flex items-center gap-2 mb-2">
//             <input
//               type="checkbox"
//               id="wrapAvailable"
//               checked={variations.wrap.available}
//               onChange={(e) => handleVariationChange('wrap', 'available', e.target.checked)}
//               className="w-5 h-5"
//             />
//             <label htmlFor="wrapAvailable" className='cursor-pointer'>
//               Offer Wrap Option
//             </label>
//           </div>
//           {variations.wrap.available && (
//             <div className="flex gap-2">
//               <input
//                 value={variations.wrap.price}
//                 onChange={(e) => handleVariationChange('wrap', 'price', e.target.value)}
//                 className="w-32 px-3 py-2 border rounded"
//                 placeholder="Wrap price"
//                 type="number"
//                 min="0"
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       <button
//         type="submit"
//         className='w-28 py-3 mt-4 bg-black text-white rounded'
//       >
//         ADD
//       </button>
//     </form>
//   );
// };

// export default Add;

// import React, { useState } from 'react';
// import { assets } from '../assets/assets';
// import axios from 'axios';
// import { backendUrl } from '../App';
// import { toast } from 'react-toastify';

// const Add = ({ token }) => {
//   // Image states
//   const [image1, setImage1] = useState(false);
//   const [image2, setImage2] = useState(false);
//   const [image3, setImage3] = useState(false);
//   const [image4, setImage4] = useState(false);

//   // Form states
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [bestseller, setBestseller] = useState(false);

//   // Availability by day states
//   const [availableDays, setAvailableDays] = useState(['everyday']);
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   // Handle day selection
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

//   // old Submit handler
//   // const onSubmitHandler = async (e) => {
//   //   e.preventDefault();

//   //   try {
//   //     const formData = new FormData();
//   //     formData.append("name", name);
//   //     formData.append("description", description);
//   //     formData.append("price", price);
//   //     formData.append("category", category);
//   //     formData.append("bestseller", bestseller);
//   //     formData.append("availableDays", JSON.stringify(availableDays));

//   //     // Append images if they exist
//   //     image1 && formData.append("image1", image1);
//   //     image2 && formData.append("image2", image2);
//   //     image3 && formData.append("image3", image3);
//   //     image4 && formData.append("image4", image4);

//   //     const response = await axios.post(
//   //       backendUrl + "/api/product/add",
//   //       formData,
//   //       { headers: { token } }
//   //     );

//   //     if (response.data.success) {
//   //       toast.success(response.data.message);
//   //       // Reset form
//   //       setName('');
//   //       setDescription('');
//   //       setPrice('');
//   //       setCategory('');
//   //       setBestseller(false);
//   //       setAvailableDays(['everyday']);
//   //       setImage1(false);
//   //       setImage2(false);
//   //       setImage3(false);
//   //       setImage4(false);
//   //     } else {
//   //       toast.error(response.data.message);
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //     toast.error(error.message);
//   //   }
//   // };

//   // new submit handler

//   const onSubmitHandler = async (e) => {
//   e.preventDefault();

//   try {
//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("description", description);
//     formData.append("price", price);
//     formData.append("category", category);
//     formData.append("bestseller", bestseller);

//     // Append each available day individually
//     availableDays.forEach(day => {
//       formData.append('availableDays', day);
//     });

//     // Append images
//     image1 && formData.append("image1", image1);
//     image2 && formData.append("image2", image2);
//     image3 && formData.append("image3", image3);
//     image4 && formData.append("image4", image4);

//     const response = await axios.post(
//       backendUrl + "/api/product/add",
//       formData,
//       { headers: { token } }
//     );

//     if (response.data.success) {
//       toast.success(response.data.message);
//       // Reset form
//       setName('');
//       setDescription('');
//       setPrice('');
//       setCategory('');
//       setBestseller(false);
//       setAvailableDays(['everyday']);
//       setImage1(false);
//       setImage2(false);
//       setImage3(false);
//       setImage4(false);
//     } else {
//       toast.error(response.data.message);
//     }
//   } catch (error) {
//     console.log(error);
//     toast.error(error.message);
//   }
// };

//   return (
//     <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
//       <div>
//         <p className='mb-2'>Upload Image</p>
//         <div className='flex gap-2'>
//           {[1, 2, 3, 4].map((num) => (
//             <label key={num} htmlFor={`image${num}`}>
//               <img
//                 className='w-20'
//                 src={!eval(`image${num}`) ? assets.upload_area : URL.createObjectURL(eval(`image${num}`))}
//                 alt=""
//               />
//               <input
//                 onChange={(e) => eval(`setImage${num}`)(e.target.files[0])}
//                 type="file"
//                 id={`image${num}`}
//                 hidden
//               />
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>Product name</p>
//         <input
//           onChange={(e) => setName(e.target.value)}
//           value={name}
//           className='w-full max-w-[500px] px-3 py-2 border rounded'
//           type="text"
//           placeholder='Type here'
//           required
//         />
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>Product description</p>
//         <textarea
//           onChange={(e) => setDescription(e.target.value)}
//           value={description}
//           className='w-full max-w-[500px] px-3 py-2 border rounded'
//           placeholder='Write content here'
//           required
//         />
//       </div>

//       <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
//         <div>
//           <p className='mb-2'>Product Price</p>
//           <input
//             onChange={(e) => setPrice(e.target.value)}
//             value={price}
//             className='w-full px-3 py-2 sm:w-[120px] border rounded'
//             type="Number"
//             placeholder='1'
//             min="0"
//           />
//         </div>

//         <div>
//           <p className='mb-2'>Product Category</p>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className='w-full px-3 py-2 border rounded'
//             required
//           >
//             <option value="">Select category</option>
//             <option value="Main Dishes">Main Dishes</option>
//             <option value="Soups">Soups & Stews</option>
//             <option value="Appetizers">Appetizers</option>
//             <option value="Desserts">Desserts</option>
//             <option value="Drinks">Beverages</option>
//             <option value="Specials">Specials</option>
//           </select>
//         </div>
//       </div>

//       <div className='w-full'>
//         <p className='mb-2'>Availability</p>
//         <div className='flex flex-wrap gap-2'>
//           <button
//             type="button"
//             onClick={() => setAvailableDays(['everyday'])}
//             className={`px-3 py-1 text-sm rounded-full ${
//               availableDays.includes('everyday')
//                 ? 'bg-green-500 text-white'
//                 : 'bg-gray-200 text-gray-700'
//             }`}
//           >
//             Everyday
//           </button>
//           {days.map(day => (
//             <button
//               key={day}
//               type="button"
//               onClick={() => handleDayChange(day)}
//               className={`px-3 py-1 text-sm rounded-full ${
//                 availableDays.includes(day)
//                   ? 'bg-green-500 text-white'
//                   : 'bg-gray-200 text-gray-700'
//               }`}
//             >
//               {day.substring(0, 3)}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className='flex gap-2 mt-2'>
//         <input
//           onChange={() => setBestseller(prev => !prev)}
//           checked={bestseller}
//           type="checkbox"
//           id='bestseller'
//         />
//         <label className='cursor-pointer' htmlFor="bestseller">
//           Add to bestseller
//         </label>
//       </div>

//       <button
//         type="submit"
//         className='w-28 py-3 mt-4 bg-black text-white rounded'
//       >
//         ADD
//       </button>
//     </form>
//   );
// };

// export default Add;

// import React, { useState } from 'react'
// import {assets} from '../assets/assets'
// import axios from 'axios'
// import { backendUrl } from '../App'
// import { toast } from 'react-toastify'

// const Add = ({token}) => {

//   const [image1,setImage1] = useState(false)
//   const [image2,setImage2] = useState(false)
//   const [image3,setImage3] = useState(false)
//   const [image4,setImage4] = useState(false)

//    const [name, setName] = useState("");
//    const [description, setDescription] = useState("");
//    const [price, setPrice] = useState("");
//    const [category, setCategory] = useState("Men");
//   //  const [subCategory, setSubCategory] = useState("Topwear");
//    const [bestseller, setBestseller] = useState(false);
//   //  const [sizes, setSizes] = useState([]);

//    const onSubmitHandler = async (e) => {
//     e.preventDefault();

//     try {

//       const formData = new FormData()

//       formData.append("name",name)
//       formData.append("description",description)
//       formData.append("price",price)
//       formData.append("category",category)
//       // formData.append("subCategory",subCategory)
//       formData.append("bestseller",bestseller)
//       // formData.append("sizes",JSON.stringify(sizes))

//       image1 && formData.append("image1",image1)
//       image2 && formData.append("image2",image2)
//       image3 && formData.append("image3",image3)
//       image4 && formData.append("image4",image4)

//       const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

//       if (response.data.success) {
//         toast.success(response.data.message)
//         setName('')
//         setDescription('')
//         setImage1(false)
//         setImage2(false)
//         setImage3(false)
//         setImage4(false)
//         setPrice('')
//       } else {
//         toast.error(response.data.message)
//       }

//     } catch (error) {
//       console.log(error);
//       toast.error(error.message)
//     }
//    }

//   return (
//     <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
//         <div>
//           <p className='mb-2'>Upload Image</p>

//           <div className='flex gap-2'>
//             <label htmlFor="image1">
//               <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
//               <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
//             </label>
//             <label htmlFor="image2">
//               <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
//               <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
//             </label>
//             <label htmlFor="image3">
//               <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
//               <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
//             </label>
//             <label htmlFor="image4">
//               <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
//               <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
//             </label>
//           </div>
//         </div>

//         <div className='w-full'>
//           <p className='mb-2'>Product name</p>
//           <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
//         </div>

//         <div className='w-full'>
//           <p className='mb-2'>Product description</p>
//           <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required/>
//         </div>

//         <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

//             {/* <div>
//               <p className='mb-2'>Product category</p>
//               <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
//                   <option value="Men">Men</option>
//                   <option value="Women">Women</option>
//               </select>
//             </div> */}
// {/*
//             <div>
//               <p className='mb-2'>Sub category</p>
//               <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
//                   <option value="Topwear">Topwear</option>
//                   <option value="Bottomwear">Bottomwear</option>
//                   <option value="Winterwear">Winterwear</option>
//               </select>
//             </div> */}

//             <div>
//               <p className='mb-2'>Product Price</p>
//               <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
//             </div>

//         </div>
// {/*
//         <div>
//           <p className='mb-2'>Product Sizes</p>
//           <div className='flex gap-3'>
//             <div onClick={()=>setSizes(prev => prev.includes("S") ? prev.filter( item => item !== "S") : [...prev,"S"])}>
//               <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>S</p>
//             </div>

//             <div onClick={()=>setSizes(prev => prev.includes("M") ? prev.filter( item => item !== "M") : [...prev,"M"])}>
//               <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>M</p>
//             </div>

//             <div onClick={()=>setSizes(prev => prev.includes("L") ? prev.filter( item => item !== "L") : [...prev,"L"])}>
//               <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>L</p>
//             </div>

//             <div onClick={()=>setSizes(prev => prev.includes("XL") ? prev.filter( item => item !== "XL") : [...prev,"XL"])}>
//               <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XL</p>
//             </div>

//             <div onClick={()=>setSizes(prev => prev.includes("XXL") ? prev.filter( item => item !== "XXL") : [...prev,"XXL"])}>
//               <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
//             </div>
//           </div>
//         </div> */}

//         <div className='flex gap-2 mt-2'>
//           <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
//           <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
//         </div>

//         <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>

//     </form>
//   )
// }

// export default Add
