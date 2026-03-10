import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { 
    products, 
    currency, 
    addToCart, 
    token,
    addReview,
    getReviews,
    getUserReview
  } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isReviewLoading, setIsReviewLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Variation states
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedWrap, setSelectedWrap] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [missingOptions, setMissingOptions] = useState([]);
  
  // Order confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderSummary, setOrderSummary] = useState('');

  useEffect(() => {
    // Find the product when products or productId changes
    const product = products.find(item => item._id === productId);
    if (product) {
      setProductData(product);
      setMainImage(product.image[0]);
      setCalculatedPrice(product.basePrice);
      
      // Fetch reviews for this product
      const fetchReviews = async () => {
        setIsReviewLoading(true);
        
        // Get all reviews for this product
        const reviewsResponse = await getReviews(productId);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.reviews);
        }
        
        // Get user's review if logged in
        if (token) {
          const userReviewResponse = await getUserReview(productId);
          if (userReviewResponse.success && userReviewResponse.review) {
            setUserReview(userReviewResponse.review);
            setRating(userReviewResponse.review.rating);
            setComment(userReviewResponse.review.comment);
          }
        }
        
        setIsReviewLoading(false);
      };
      
      fetchReviews();
    }
  }, [productId, products, token]);

  // Calculate price when selections change
  useEffect(() => {
    if (!productData) return;
    
    let price = productData.basePrice;
    
    if (selectedWrap && productData.variations?.wrap?.available) {
      price = productData.variations.wrap.price;
    } 
    else if (selectedSize) {
      const sizeObj = productData.variations?.sizes?.find(s => s.size === selectedSize);
      if (sizeObj) price = sizeObj.price;
    }
    
    setCalculatedPrice(price);
  }, [selectedBase, selectedSide, selectedSize, selectedWrap, productData]);

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Generate readable order summary
  const generateOrderSummary = useCallback(() => {
    if (!productData) return '';
    
    let summaryParts = [];
    
    // Add size if selected
    if (selectedSize) {
      summaryParts.push(selectedSize.toLowerCase());
    }
    
    // Add base if selected
    if (selectedBase) {
      summaryParts.push(selectedBase.toLowerCase());
    } else {
      // Use product name if no base selected
      summaryParts.push(productData.name.toLowerCase());
    }
    
    // Add side if selected
    if (selectedSide) {
      summaryParts.push(`with ${selectedSide.toLowerCase()}`);
    }
    
    // Add wrap option
    if (selectedWrap) {
      summaryParts.push('to wrap yourself');
    }
    
    // Capitalize first letter
    if (summaryParts.length > 0) {
      summaryParts[0] = summaryParts[0].charAt(0).toUpperCase() + summaryParts[0].slice(1);
    }
    
    return summaryParts.join(' ');
  }, [productData, selectedBase, selectedSide, selectedSize, selectedWrap]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await addReview(productData._id, rating, comment);
      if (response.success) {
        toast.success("Review submitted successfully!");
        
        // Update local state
        if (userReview) {
          // Update existing review in list
          setReviews(reviews.map(r => 
            r._id === userReview._id ? {...r, rating, comment} : r
          ));
        } else {
          // For new review, refetch to get populated user data
          const reviewsResponse = await getReviews(productId);
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.reviews);
          }
          
          // Set user review
          const userReviewResponse = await getUserReview(productId);
          if (userReviewResponse.success && userReviewResponse.review) {
            setUserReview(userReviewResponse.review);
          }
        }
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate and prepare to add to cart
  const validateAndPrepare = () => {
    if (!productData.inStock) return false;
    
    // Check for missing required options
    const missing = [];
    
    if (productData.variations?.base?.options?.length > 0 && !selectedBase) {
      missing.push(productData.variations.base.name);
    }
    
    if (productData.variations?.side?.options?.length > 0 && !selectedSide) {
      missing.push(productData.variations.side.name);
    }
    
    if (productData.variations?.sizes?.length > 0 && !selectedSize && !selectedWrap) {
      missing.push("size");
    }
    
    // If any options are missing, show error modal
    if (missing.length > 0) {
      setMissingOptions(missing);
      
      // Create error message
      let message = "Please select: ";
      message += missing.join(", ");
      message += " before adding to cart.";
      
      setErrorMessage(message);
      setShowErrorModal(true);
      return false;
    }
    
    return true;
  };

  // Show confirmation modal
  const showConfirmation = () => {
    if (!validateAndPrepare()) return;
    
    // Generate order summary
    const summary = generateOrderSummary();
    setOrderSummary(summary);
    setShowConfirmModal(true);
  };

  // Actually add to cart after confirmation
  const confirmAddToCart = async () => {
    if (!productData.inStock) return;
    
    const variations = {
      base: selectedBase,
      side: selectedSide,
      size: selectedSize,
      wrap: selectedWrap
    };
    
    const product = await addToCart(productData._id, quantity, variations);
    if (product) {
      toast.success(`${quantity} ${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#008753',
          color: 'white',
          borderRadius: '8px'
        }
      });
    }
    
    setShowConfirmModal(false);
  };

  if (!productData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-amber-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
          <p className="mt-4 text-lg text-[#008753]">Loading delicious meal details...</p>
        </div>
      </div>
    );
  }

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="bg-amber-50 pt-10 pb-20">
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="prata-regular text-xl text-[#008753]">
                Important Selection Needed
              </h3>
              <button 
                onClick={() => setShowErrorModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-5">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-gray-700 font-medium mb-2">{errorMessage}</p>
                  <p className="text-gray-600 text-sm">
                    Why is this important? These selections help us prepare your meal exactly 
                    how you want it. Without them, we wouldn't know what to serve you!
                  </p>
                </div>
              </div>
              
              <div className="bg-[#008753]/10 p-4 rounded-lg">
                <h4 className="font-medium text-[#008753] mb-2">How to fix:</h4>
                <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                  {missingOptions.includes("Base") && (
                    <li>Select a <span className="font-medium">Base Dish</span> option from the dropdown</li>
                  )}
                  {missingOptions.includes("Side") && (
                    <li>Choose your <span className="font-medium">Side Dish</span> from the available options</li>
                  )}
                  {missingOptions.includes("size") && (
                    <li>Pick either a <span className="font-medium">Meal Size</span> or the <span className="font-medium">Wrap</span> option</li>
                  )}
                  <li>All required options will be highlighted in the form</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="prata-regular text-xl text-[#008753]">
                Confirm Your Order
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              </div>
              
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                {quantity} × {productData.name}
              </h4>
              
              <p className="text-gray-700 mb-4 px-4">
                "{orderSummary}"
              </p>
              
              <div className="flex justify-center items-center gap-2 mb-4">
                <span className="text-lg font-bold text-[#008753]">
                  {currency}
                  {(calculatedPrice * quantity).toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm">
                  ({quantity} × {currency}{calculatedPrice.toFixed(2)})
                </span>
              </div>
              
              <p className="text-gray-600 text-sm">
                Please double-check your selections before adding to cart
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmAddToCart}
                className="flex-1 px-4 py-3 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
              >
                Confirm & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 text-sm text-gray-600" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="hover:text-[#008753] transition-colors">Home</a>
              <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </li>
            <li className="flex items-center">
              <a href="/menu" className="hover:text-[#008753] transition-colors">Menu</a>
              <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </li>
            <li className="flex items-center">
              <span className="text-[#008753] font-medium">{productData.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Data */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="flex-1">
            <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
              <img 
                className="w-full h-auto object-cover" 
                src={mainImage} 
                alt={productData.name} 
                loading="lazy"
              />
            </div>
            
            <div className="flex gap-3 overflow-x-auto py-2">
              {productData.image.map((item, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden ${mainImage === item ? 'border-[#008753]' : 'border-transparent'}`}
                  onClick={() => setMainImage(item)}
                >
                  <img
                    src={item}
                    className="w-20 h-20 object-cover"
                    alt={`${productData.name} - view ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h1 className="prata-regular text-3xl text-[#008753] mb-2">
              {productData.name}
            </h1>
            
            {/* Stock Status */}
            {!productData.inStock && (
              <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-lg text-sm mb-4">
                OUT OF STOCK
              </div>
            )}
            
            {productData.bestseller && (
              <div className="inline-block bg-[#008753] text-white px-3 py-1 rounded-lg text-sm mb-4">
                BESTSELLER
              </div>
            )}
            
            <div className="flex items-center gap-1 mt-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <img 
                  key={i} 
                  src={i < Math.floor(averageRating) ? assets.star_icon : assets.star_dull_icon} 
                  alt="Star rating" 
                  className="w-5" 
                />
              ))}
              <p className="pl-2 text-gray-600">({reviews.length} customer reviews)</p>
            </div>
            
            <p className="text-3xl font-bold text-[#008753] mb-6">
              {currency}
              {calculatedPrice.toFixed(2)}
            </p>
            
            {/* Variation Selectors */}
            <div className="space-y-4 mb-6">
              {/* Base Selector */}
              {productData.variations?.base?.options?.length > 0 && (
                <div>
                  <label className={`block mb-1 font-medium ${!selectedBase && missingOptions.includes("Base") ? 'text-red-500' : ''}`}>
                    {productData.variations.base.name} *
                  </label>
                  <select
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      !selectedBase && missingOptions.includes("Base") 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select {productData.variations.base.name.toLowerCase()}</option>
                    {productData.variations.base.options.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                  {!selectedBase && missingOptions.includes("Base") && (
                    <p className="text-red-500 text-sm mt-1">Please select a base dish option</p>
                  )}
                </div>
              )}
              
              {/* Side Selector */}
              {productData.variations?.side?.options?.length > 0 && (
                <div>
                  <label className={`block mb-1 font-medium ${!selectedSide && missingOptions.includes("Side") ? 'text-red-500' : ''}`}>
                    {productData.variations.side.name} *
                  </label>
                  <select
                    value={selectedSide}
                    onChange={(e) => setSelectedSide(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      !selectedSide && missingOptions.includes("Side") 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select {productData.variations.side.name.toLowerCase()}</option>
                    {productData.variations.side.options.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                  {!selectedSide && missingOptions.includes("Side") && (
                    <p className="text-red-500 text-sm mt-1">Please select a side dish option</p>
                  )}
                </div>
              )}
              
              {/* Size Selector */}
              {productData.variations?.sizes?.length > 0 && (
                <div>
                  <label className={`block mb-1 font-medium ${!selectedSize && !selectedWrap && missingOptions.includes("size") ? 'text-red-500' : ''}`}>
                    Meal Size or Wrap *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {productData.variations.sizes.map((size, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size.size);
                          setSelectedWrap(false);
                        }}
                        disabled={selectedWrap}
                        className={`px-4 py-2 border rounded-lg ${
                          selectedSize === size.size && !selectedWrap
                            ? 'bg-[#008753] text-white border-[#008753]'
                            : 'border-gray-300 hover:border-[#008753]'
                        } ${selectedWrap ? 'opacity-50 cursor-not-allowed' : ''} ${
                          !selectedSize && !selectedWrap && missingOptions.includes("size") 
                            ? 'border-red-500 bg-red-50' 
                            : ''
                        }`}
                      >
                        {size.size} ({currency}{size.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Wrap Option */}
              {productData.variations?.wrap?.available && (
                <div>
                  <label className={`flex items-center gap-2 cursor-pointer ${
                    !selectedSize && !selectedWrap && missingOptions.includes("size") 
                      ? 'text-red-500' 
                      : ''
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedWrap}
                      onChange={(e) => {
                        setSelectedWrap(e.target.checked);
                        if (e.target.checked) setSelectedSize('');
                      }}
                      className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
                    />
                    <span className="font-medium">
                      Wrap it Yourself ({currency}{productData.variations.wrap.price})
                    </span>
                  </label>
                  {!selectedSize && !selectedWrap && missingOptions.includes("size") && (
                    <p className="text-red-500 text-sm mt-1">Please select a size or wrap option</p>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              {productData.description}
            </p>
            
            <div className="mb-8">
              <h3 className="prata-regular text-xl text-[#008753] mb-3">Key Features:</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Prepared with authentic African/Carribean spices</li>
                <li>Made fresh daily with local ingredients</li>
                <li>Family recipe passed down for generations</li>
                <li>Perfectly balanced flavors</li>
              </ul>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Quantity controls */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  onClick={decrementQuantity}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Decrease quantity"
                  disabled={!productData.inStock}
                >
                  -
                </button>
                <span className="px-4 py-2 bg-white border-x border-gray-200 w-12 text-center">
                  {quantity}
                </span>
                <button 
                  onClick={incrementQuantity}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Increase quantity"
                  disabled={!productData.inStock}
                >
                  +
                </button>
              </div>
              
              <button
                onClick={showConfirmation}
                className={`flex-1 px-8 py-3 rounded-lg font-medium transition-colors ${
                  productData.inStock 
                    ? 'bg-[#008753] text-white hover:bg-[#006641]' 
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
                disabled={!productData.inStock}
              >
                {productData.inStock ? "ADD TO CART" : "OUT OF STOCK"}
              </button>
            </div>
            
            <div className="bg-[#008753]/10 p-5 rounded-lg">
              <h3 className="prata-regular text-lg text-[#008753] mb-2">Our Promise:</h3>
              <ul className="text-gray-700 space-y-1">
                <li className="flex items-start">
                  <img src={assets.check_icon} alt="Check" className="w-5 mr-2 mt-0.5" />
                  <span>100% authentic Nigerian recipe</span>
                </li>
                <li className="flex items-start">
                  <img src={assets.check_icon} alt="Check" className="w-5 mr-2 mt-0.5" />
                  <span>Fresh ingredients sourced locally</span>
                </li>
                <li className="flex items-start">
                  <img src={assets.check_icon} alt="Check" className="w-5 mr-2 mt-0.5" />
                  <span>Prepared with love and care</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="prata-regular text-3xl text-[#008753] mb-6">
              Customer Reviews
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Review Summary */}
              <div className="md:w-1/3">
                <div className="bg-[#008753]/10 p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-[#008753]">
                      {averageRating.toFixed(1)}
                    </p>
                    <div className="flex justify-center gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <img 
                          key={i} 
                          src={i < Math.floor(averageRating) ? assets.star_icon : assets.star_dull_icon} 
                          alt="Star rating" 
                          className="w-6" 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">
                      {reviews.length} reviews
                    </p>
                  </div>
                  
                  {!isReviewLoading && reviews.length > 0 && (
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                        const percentage = (count / reviews.length) * 100;
                        
                        return (
                          <div key={star} className="flex items-center">
                            <span className="w-16">{star} stars</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                              <div 
                                className="h-full bg-[#008753] rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-10 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Review Form and List */}
              <div className="md:w-2/3">
                {/* Review Form */}
                <div className="mb-10">
                  <h3 className="prata-regular text-xl text-[#008753] mb-4">
                    {userReview ? "Edit Your Review" : "Write a Review"}
                  </h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Your Rating</label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                            disabled={isSubmitting}
                          >
                            <img
                              src={star <= rating ? assets.star_icon : assets.star_dull_icon}
                              alt={`${star} stars`}
                              className="w-8 h-8 mr-1"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="4"
                        required
                        placeholder="Share your experience with this meal..."
                        disabled={isSubmitting}
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors disabled:opacity-50"
                      disabled={isSubmitting || rating === 0}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                          {userReview ? "Updating..." : "Submitting..."}
                        </span>
                      ) : userReview ? "Update Review" : "Submit Review"}
                    </button>
                    
                    {!token && (
                      <p className="text-gray-600 mt-3">
                        You must be <a href="/login" className="text-[#008753] hover:underline">logged in</a> to submit a review.
                      </p>
                    )}
                  </form>
                </div>
                
                {/* Reviews List */}
                <div>
                  <h3 className="prata-regular text-xl text-[#008753] mb-4">
                    Customer Reviews ({reviews.length})
                  </h3>
                  
                  {isReviewLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008753]"></div>
                      <p className="mt-2 text-gray-600">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-gray-600 py-4 text-center">
                      No reviews yet. Be the first to review!
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-semibold">
                              {review.user?.name || 'Anonymous'}
                            </h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <img 
                                  key={i} 
                                  src={i < review.rating ? assets.star_icon : assets.star_dull_icon} 
                                  alt="Star rating" 
                                  className="w-4" 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="prata-regular text-3xl text-[#008753] mb-8 text-center">
            You Might Also Like
          </h2>
          <RelatedProducts category={productData.category} />
        </div>
      </div>
    </div>
  );
};

export default Product;



































// import React, { useContext, useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { ShopContext } from '../context/ShopContext';
// import { assets } from '../assets/assets';
// import RelatedProducts from '../components/RelatedProducts';
// import { toast } from 'react-toastify';

// const Product = () => {
//   const { productId } = useParams();
//   const { 
//     products, 
//     currency, 
//     addToCart, 
//     token,
//     addReview,
//     getReviews,
//     getUserReview
//   } = useContext(ShopContext);
//   const [productData, setProductData] = useState(null);
//   const [mainImage, setMainImage] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [reviews, setReviews] = useState([]);
//   const [userReview, setUserReview] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState('');
//   const [isReviewLoading, setIsReviewLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Variation states
//   const [selectedBase, setSelectedBase] = useState('');
//   const [selectedSide, setSelectedSide] = useState('');
//   const [selectedSize, setSelectedSize] = useState('');
//   const [selectedWrap, setSelectedWrap] = useState(false);
//   const [calculatedPrice, setCalculatedPrice] = useState(0);
  
//   // Error modal state
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [missingOptions, setMissingOptions] = useState([]);

//   useEffect(() => {
//     // Find the product when products or productId changes
//     const product = products.find(item => item._id === productId);
//     if (product) {
//       setProductData(product);
//       setMainImage(product.image[0]);
//       setCalculatedPrice(product.basePrice);
      
//       // Fetch reviews for this product
//       const fetchReviews = async () => {
//         setIsReviewLoading(true);
        
//         // Get all reviews for this product
//         const reviewsResponse = await getReviews(productId);
//         if (reviewsResponse.success) {
//           setReviews(reviewsResponse.reviews);
//         }
        
//         // Get user's review if logged in
//         if (token) {
//           const userReviewResponse = await getUserReview(productId);
//           if (userReviewResponse.success && userReviewResponse.review) {
//             setUserReview(userReviewResponse.review);
//             setRating(userReviewResponse.review.rating);
//             setComment(userReviewResponse.review.comment);
//           }
//         }
        
//         setIsReviewLoading(false);
//       };
      
//       fetchReviews();
//     }
//   }, [productId, products, token]);

//   // Calculate price when selections change
//   useEffect(() => {
//     if (!productData) return;
    
//     let price = productData.basePrice;
    
//     if (selectedWrap && productData.variations?.wrap?.available) {
//       price = productData.variations.wrap.price;
//     } 
//     else if (selectedSize) {
//       const sizeObj = productData.variations?.sizes?.find(s => s.size === selectedSize);
//       if (sizeObj) price = sizeObj.price;
//     }
    
//     setCalculatedPrice(price);
//   }, [selectedBase, selectedSide, selectedSize, selectedWrap, productData]);

//   const incrementQuantity = () => {
//     setQuantity(prev => prev + 1);
//   };

//   const decrementQuantity = () => {
//     if (quantity > 1) {
//       setQuantity(prev => prev - 1);
//     }
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!token) {
//       toast.error("Please login to submit a review");
//       return;
//     }
    
//     if (rating === 0) {
//       toast.error("Please select a rating");
//       return;
//     }
    
//     setIsSubmitting(true);
    
//     try {
//       const response = await addReview(productData._id, rating, comment);
//       if (response.success) {
//         toast.success("Review submitted successfully!");
        
//         // Update local state
//         if (userReview) {
//           // Update existing review in list
//           setReviews(reviews.map(r => 
//             r._id === userReview._id ? {...r, rating, comment} : r
//           ));
//         } else {
//           // For new review, refetch to get populated user data
//           const reviewsResponse = await getReviews(productId);
//           if (reviewsResponse.success) {
//             setReviews(reviewsResponse.reviews);
//           }
          
//           // Set user review
//           const userReviewResponse = await getUserReview(productId);
//           if (userReviewResponse.success && userReviewResponse.review) {
//             setUserReview(userReviewResponse.review);
//           }
//         }
//       } else {
//         toast.error(response.message || "Failed to submit review");
//       }
//     } catch (error) {
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Validate and add to cart
//   const handleAddToCart = async () => {
//     if (!productData.inStock) return;
    
//     // Check for missing required options
//     const missing = [];
    
//     if (productData.variations?.base?.options?.length > 0 && !selectedBase) {
//       missing.push(productData.variations.base.name);
//     }
    
//     if (productData.variations?.side?.options?.length > 0 && !selectedSide) {
//       missing.push(productData.variations.side.name);
//     }
    
//     if (productData.variations?.sizes?.length > 0 && !selectedSize && !selectedWrap) {
//       missing.push("size");
//     }
    
//     // If any options are missing, show error modal
//     if (missing.length > 0) {
//       setMissingOptions(missing);
      
//       // Create error message
//       let message = "Please select: ";
//       message += missing.join(", ");
//       message += " before adding to cart.";
      
//       setErrorMessage(message);
//       setShowErrorModal(true);
//       return;
//     }
    
//     const variations = {
//       base: selectedBase,
//       side: selectedSide,
//       size: selectedSize,
//       wrap: selectedWrap
//     };
    
//     const product = await addToCart(productData._id, quantity, variations);
//     if (product) {
//       toast.success(`${quantity} ${product.name} added to cart!`, {
//         position: "top-right",
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         style: {
//           backgroundColor: '#008753',
//           color: 'white',
//           borderRadius: '8px'
//         }
//       });
//     }
//   };

//   if (!productData) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-amber-50">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008753]"></div>
//           <p className="mt-4 text-lg text-[#008753]">Loading delicious meal details...</p>
//         </div>
//       </div>
//     );
//   }

//   // Calculate average rating from reviews
//   const calculateAverageRating = () => {
//     if (reviews.length === 0) return 0;
//     const total = reviews.reduce((sum, review) => sum + review.rating, 0);
//     return total / reviews.length;
//   };

//   const averageRating = calculateAverageRating();

//   return (
//     <div className="bg-amber-50 pt-10 pb-20">
//       {/* Error Modal */}
//       {showErrorModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="prata-regular text-xl text-[#008753]">
//                 Important Selection Needed
//               </h3>
//               <button 
//                 onClick={() => setShowErrorModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
            
//             <div className="mb-5">
//               <div className="flex items-start mb-4">
//                 <div className="flex-shrink-0">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-gray-700 font-medium mb-2">{errorMessage}</p>
//                   <p className="text-gray-600 text-sm">
//                     Why is this important? These selections help us prepare your meal exactly 
//                     how you want it. Without them, we wouldn't know what to serve you!
//                   </p>
//                 </div>
//               </div>
              
//               <div className="bg-[#008753]/10 p-4 rounded-lg">
//                 <h4 className="font-medium text-[#008753] mb-2">How to fix:</h4>
//                 <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
//                   {missingOptions.includes("Base") && (
//                     <li>Select a <span className="font-medium">Base Dish</span> option from the dropdown</li>
//                   )}
//                   {missingOptions.includes("Side") && (
//                     <li>Choose your <span className="font-medium">Side Dish</span> from the available options</li>
//                   )}
//                   {missingOptions.includes("size") && (
//                     <li>Pick either a <span className="font-medium">Meal Size</span> or the <span className="font-medium">Wrap</span> option</li>
//                   )}
//                   <li>All required options will be highlighted in the form</li>
//                 </ul>
//               </div>
//             </div>
            
//             <div className="flex justify-end">
//               <button
//                 onClick={() => setShowErrorModal(false)}
//                 className="px-4 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors"
//               >
//                 I Understand
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-6xl mx-auto px-4">
//         {/* Breadcrumb Navigation */}
//         <nav className="mb-8 text-sm text-gray-600" aria-label="Breadcrumb">
//           <ol className="list-none p-0 inline-flex">
//             <li className="flex items-center">
//               <a href="/" className="hover:text-[#008753] transition-colors">Home</a>
//               <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//               </svg>
//             </li>
//             <li className="flex items-center">
//               <a href="/menu" className="hover:text-[#008753] transition-colors">Menu</a>
//               <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//               </svg>
//             </li>
//             <li className="flex items-center">
//               <span className="text-[#008753] font-medium">{productData.name}</span>
//             </li>
//           </ol>
//         </nav>

//         {/* Product Data */}
//         <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
//           {/* Product Images */}
//           <div className="flex-1">
//             <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
//               <img 
//                 className="w-full h-auto object-cover" 
//                 src={mainImage} 
//                 alt={productData.name} 
//                 loading="lazy"
//               />
//             </div>
            
//             <div className="flex gap-3 overflow-x-auto py-2">
//               {productData.image.map((item, index) => (
//                 <div 
//                   key={index}
//                   className={`flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden ${mainImage === item ? 'border-[#008753]' : 'border-transparent'}`}
//                   onClick={() => setMainImage(item)}
//                 >
//                   <img
//                     src={item}
//                     className="w-20 h-20 object-cover"
//                     alt={`${productData.name} - view ${index + 1}`}
//                     loading="lazy"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Product Info */}
//           <div className="flex-1">
//             <h1 className="prata-regular text-3xl text-[#008753] mb-2">
//               {productData.name}
//             </h1>
            
//             {/* Stock Status */}
//             {!productData.inStock && (
//               <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-lg text-sm mb-4">
//                 OUT OF STOCK
//               </div>
//             )}
            
//             {productData.bestseller && (
//               <div className="inline-block bg-[#008753] text-white px-3 py-1 rounded-lg text-sm mb-4">
//                 BESTSELLER
//               </div>
//             )}
            
//             <div className="flex items-center gap-1 mt-2 mb-4">
//               {[...Array(5)].map((_, i) => (
//                 <img 
//                   key={i} 
//                   src={i < Math.floor(averageRating) ? assets.star_icon : assets.star_dull_icon} 
//                   alt="Star rating" 
//                   className="w-5" 
//                 />
//               ))}
//               <p className="pl-2 text-gray-600">({reviews.length} customer reviews)</p>
//             </div>
            
//             <p className="text-3xl font-bold text-[#008753] mb-6">
//               {currency}
//               {calculatedPrice.toFixed(2)}
//             </p>
            
//             {/* Variation Selectors */}
//             <div className="space-y-4 mb-6">
//               {/* Base Selector */}
//               {productData.variations?.base?.options?.length > 0 && (
//                 <div>
//                   <label className={`block mb-1 font-medium ${!selectedBase && missingOptions.includes("Base") ? 'text-red-500' : ''}`}>
//                     {productData.variations.base.name} *
//                   </label>
//                   <select
//                     value={selectedBase}
//                     onChange={(e) => setSelectedBase(e.target.value)}
//                     className={`w-full px-4 py-2 border rounded-lg ${
//                       !selectedBase && missingOptions.includes("Base") 
//                         ? 'border-red-500 bg-red-50' 
//                         : 'border-gray-300'
//                     }`}
//                     required
//                   >
//                     <option value="">Select {productData.variations.base.name.toLowerCase()}</option>
//                     {productData.variations.base.options.map((option, index) => (
//                       <option key={index} value={option}>{option}</option>
//                     ))}
//                   </select>
//                   {!selectedBase && missingOptions.includes("Base") && (
//                     <p className="text-red-500 text-sm mt-1">Please select a base dish option</p>
//                   )}
//                 </div>
//               )}
              
//               {/* Side Selector */}
//               {productData.variations?.side?.options?.length > 0 && (
//                 <div>
//                   <label className={`block mb-1 font-medium ${!selectedSide && missingOptions.includes("Side") ? 'text-red-500' : ''}`}>
//                     {productData.variations.side.name} *
//                   </label>
//                   <select
//                     value={selectedSide}
//                     onChange={(e) => setSelectedSide(e.target.value)}
//                     className={`w-full px-4 py-2 border rounded-lg ${
//                       !selectedSide && missingOptions.includes("Side") 
//                         ? 'border-red-500 bg-red-50' 
//                         : 'border-gray-300'
//                     }`}
//                     required
//                   >
//                     <option value="">Select {productData.variations.side.name.toLowerCase()}</option>
//                     {productData.variations.side.options.map((option, index) => (
//                       <option key={index} value={option}>{option}</option>
//                     ))}
//                   </select>
//                   {!selectedSide && missingOptions.includes("Side") && (
//                     <p className="text-red-500 text-sm mt-1">Please select a side dish option</p>
//                   )}
//                 </div>
//               )}
              
//               {/* Size Selector */}
//               {productData.variations?.sizes?.length > 0 && (
//                 <div>
//                   <label className={`block mb-1 font-medium ${!selectedSize && !selectedWrap && missingOptions.includes("size") ? 'text-red-500' : ''}`}>
//                     Meal Size or Wrap *
//                   </label>
//                   <div className="flex flex-wrap gap-2">
//                     {productData.variations.sizes.map((size, index) => (
//                       <button
//                         key={index}
//                         type="button"
//                         onClick={() => {
//                           setSelectedSize(size.size);
//                           setSelectedWrap(false);
//                         }}
//                         disabled={selectedWrap}
//                         className={`px-4 py-2 border rounded-lg ${
//                           selectedSize === size.size && !selectedWrap
//                             ? 'bg-[#008753] text-white border-[#008753]'
//                             : 'border-gray-300 hover:border-[#008753]'
//                         } ${selectedWrap ? 'opacity-50 cursor-not-allowed' : ''} ${
//                           !selectedSize && !selectedWrap && missingOptions.includes("size") 
//                             ? 'border-red-500 bg-red-50' 
//                             : ''
//                         }`}
//                       >
//                         {size.size} ({currency}{size.price})
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               {/* Wrap Option */}
//               {productData.variations?.wrap?.available && (
//                 <div>
//                   <label className={`flex items-center gap-2 cursor-pointer ${
//                     !selectedSize && !selectedWrap && missingOptions.includes("size") 
//                       ? 'text-red-500' 
//                       : ''
//                   }`}>
//                     <input
//                       type="checkbox"
//                       checked={selectedWrap}
//                       onChange={(e) => {
//                         setSelectedWrap(e.target.checked);
//                         if (e.target.checked) setSelectedSize('');
//                       }}
//                       className="w-5 h-5 text-[#008753] rounded focus:ring-[#008753]"
//                     />
//                     <span className="font-medium">
//                       Wrap it Yourself ({currency}{productData.variations.wrap.price})
//                     </span>
//                   </label>
//                   {!selectedSize && !selectedWrap && missingOptions.includes("size") && (
//                     <p className="text-red-500 text-sm mt-1">Please select a size or wrap option</p>
//                   )}
//                 </div>
//               )}
//             </div>
            
//             <p className="text-gray-700 mb-6 leading-relaxed">
//               {productData.description}
//             </p>
            
//             <div className="mb-8">
//               <h3 className="prata-regular text-xl text-[#008753] mb-3">Key Features:</h3>
//               <ul className="list-disc pl-5 text-gray-700 space-y-1">
//                 <li>Prepared with authentic African/Carribean spices</li>
//                 <li>Made fresh daily with local ingredients</li>
//                 <li>Family recipe passed down for generations</li>
//                 <li>Perfectly balanced flavors</li>
//               </ul>
//             </div>
            
//             <div className="flex flex-wrap items-center gap-4 mb-8">
//               {/* Quantity controls */}
//               <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                 <button 
//                   onClick={decrementQuantity}
//                   className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
//                   aria-label="Decrease quantity"
//                   disabled={!productData.inStock}
//                 >
//                   -
//                 </button>
//                 <span className="px-4 py-2 bg-white border-x border-gray-200 w-12 text-center">
//                   {quantity}
//                 </span>
//                 <button 
//                   onClick={incrementQuantity}
//                   className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
//                   aria-label="Increase quantity"
//                   disabled={!productData.inStock}
//                 >
//                   +
//                 </button>
//               </div>
              
//               <button
//                 onClick={handleAddToCart}
//                 className={`flex-1 px-8 py-3 rounded-lg font-medium transition-colors ${
//                   productData.inStock 
//                     ? 'bg-[#008753] text-white hover:bg-[#006641]' 
//                     : 'bg-gray-400 text-white cursor-not-allowed'
//                 }`}
//                 disabled={!productData.inStock}
//               >
//                 {productData.inStock ? "ADD TO CART" : "OUT OF STOCK"}
//               </button>
//             </div>
            
//             <div className="bg-[#008753]/10 p-5 rounded-lg">
//               <h3 className="prata-regular text-lg text-[#008753] mb-2">Our Promise:</h3>
//               <ul className="text-gray-700 space-y-1">
//                 <li className="flex items-start">
//                   <img src={assets.check_icon} alt="Check" className="w-5 mr-2 mt-0.5" />
//                   <span>100% authentic Nigerian recipe</span>
//                 </li>
//                 <li className="flex items-start">
//                   <img src={assets.check_icon} alt="Check" className="w-5 mr-2 mt-0.5" />
//                   <span>Fresh ingredients sourced locally</span>
//                 </li>
//                 <li className="flex items-start">
//                   <img src={assets.check_icon} alt="Check" className="w-5 mr-2 mt-0.5" />
//                   <span>Prepared with love and care</span>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Customer Reviews Section */}
//         <div className="mt-16 bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-6">
//             <h2 className="prata-regular text-3xl text-[#008753] mb-6">
//               Customer Reviews
//             </h2>
            
//             <div className="flex flex-col md:flex-row gap-8">
//               {/* Review Summary */}
//               <div className="md:w-1/3">
//                 <div className="bg-[#008753]/10 p-6 rounded-lg">
//                   <div className="text-center mb-4">
//                     <p className="text-5xl font-bold text-[#008753]">
//                       {averageRating.toFixed(1)}
//                     </p>
//                     <div className="flex justify-center gap-1 my-2">
//                       {[...Array(5)].map((_, i) => (
//                         <img 
//                           key={i} 
//                           src={i < Math.floor(averageRating) ? assets.star_icon : assets.star_dull_icon} 
//                           alt="Star rating" 
//                           className="w-6" 
//                         />
//                       ))}
//                     </div>
//                     <p className="text-gray-600">
//                       {reviews.length} reviews
//                     </p>
//                   </div>
                  
//                   {!isReviewLoading && reviews.length > 0 && (
//                     <div className="space-y-3">
//                       {[5, 4, 3, 2, 1].map(star => {
//                         const count = reviews.filter(r => Math.floor(r.rating) === star).length;
//                         const percentage = (count / reviews.length) * 100;
                        
//                         return (
//                           <div key={star} className="flex items-center">
//                             <span className="w-16">{star} stars</span>
//                             <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
//                               <div 
//                                 className="h-full bg-[#008753] rounded-full" 
//                                 style={{ width: `${percentage}%` }}
//                               ></div>
//                             </div>
//                             <span className="w-10 text-right">{count}</span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Review Form and List */}
//               <div className="md:w-2/3">
//                 {/* Review Form */}
//                 <div className="mb-10">
//                   <h3 className="prata-regular text-xl text-[#008753] mb-4">
//                     {userReview ? "Edit Your Review" : "Write a Review"}
//                   </h3>
//                   <form onSubmit={handleReviewSubmit}>
//                     <div className="mb-4">
//                       <label className="block text-gray-700 mb-2">Your Rating</label>
//                       <div className="flex">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <button
//                             key={star}
//                             type="button"
//                             onClick={() => setRating(star)}
//                             className="focus:outline-none"
//                             disabled={isSubmitting}
//                           >
//                             <img
//                               src={star <= rating ? assets.star_icon : assets.star_dull_icon}
//                               alt={`${star} stars`}
//                               className="w-8 h-8 mr-1"
//                             />
//                           </button>
//                         ))}
//                       </div>
//                     </div>
                    
//                     <div className="mb-4">
//                       <label htmlFor="comment" className="block text-gray-700 mb-2">
//                         Your Review
//                       </label>
//                       <textarea
//                         id="comment"
//                         value={comment}
//                         onChange={(e) => setComment(e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                         rows="4"
//                         required
//                         placeholder="Share your experience with this meal..."
//                         disabled={isSubmitting}
//                       ></textarea>
//                     </div>
                    
//                     <button
//                       type="submit"
//                       className="px-6 py-2 bg-[#008753] text-white rounded-lg hover:bg-[#006641] transition-colors disabled:opacity-50"
//                       disabled={isSubmitting || rating === 0}
//                     >
//                       {isSubmitting ? (
//                         <span className="flex items-center">
//                           <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
//                           {userReview ? "Updating..." : "Submitting..."}
//                         </span>
//                       ) : userReview ? "Update Review" : "Submit Review"}
//                     </button>
                    
//                     {!token && (
//                       <p className="text-gray-600 mt-3">
//                         You must be <a href="/login" className="text-[#008753] hover:underline">logged in</a> to submit a review.
//                       </p>
//                     )}
//                   </form>
//                 </div>
                
//                 {/* Reviews List */}
//                 <div>
//                   <h3 className="prata-regular text-xl text-[#008753] mb-4">
//                     Customer Reviews ({reviews.length})
//                   </h3>
                  
//                   {isReviewLoading ? (
//                     <div className="text-center py-8">
//                       <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008753]"></div>
//                       <p className="mt-2 text-gray-600">Loading reviews...</p>
//                     </div>
//                   ) : reviews.length === 0 ? (
//                     <p className="text-gray-600 py-4 text-center">
//                       No reviews yet. Be the first to review!
//                     </p>
//                   ) : (
//                     <div className="space-y-6">
//                       {reviews.map((review) => (
//                         <div key={review._id} className="border-b border-gray-200 pb-6">
//                           <div className="flex justify-between mb-2">
//                             <h4 className="font-semibold">
//                               {review.user?.name || 'Anonymous'}
//                             </h4>
//                             <div className="flex">
//                               {[...Array(5)].map((_, i) => (
//                                 <img 
//                                   key={i} 
//                                   src={i < review.rating ? assets.star_icon : assets.star_dull_icon} 
//                                   alt="Star rating" 
//                                   className="w-4" 
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                           <p className="text-gray-600 text-sm mb-2">
//                             {new Date(review.date).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'long',
//                               day: 'numeric'
//                             })}
//                           </p>
//                           <p className="text-gray-700">{review.comment}</p>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Related Products */}
//         <div className="mt-16">
//           <h2 className="prata-regular text-3xl text-[#008753] mb-8 text-center">
//             You Might Also Like
//           </h2>
//           <RelatedProducts category={productData.category} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Product;