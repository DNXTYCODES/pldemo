import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReviewModal from '../components/ReviewModal';

const PlaceOrder = () => {
    const { 
        navigate, 
        backendUrl, 
        token, 
        cartItems, 
        getCartAmount, 
        delivery_fee, 
        products,
        addRestaurantReview,
        getUserRestaurantReview,
        clearCart,
        setPaymentStatus
    } = useContext(ShopContext);
    
    // Payment method state
    const [method, setMethod] = useState('cod');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
    });
    
    // State for review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasUserReviewed, setHasUserReviewed] = useState(false);
    const [isCheckingReview, setIsCheckingReview] = useState(true);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Currency conversion rates for display only
    const [exchangeRate, setExchangeRate] = useState(1600); // Default EUR to NGN rate

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData((data) => ({ ...data, [name]: value }));
    };

    // Check if user has reviewed the restaurant
    useEffect(() => {
        const checkUserReview = async () => {
            if (token) {
                setIsCheckingReview(true);
                try {
                    const response = await getUserRestaurantReview();
                    setHasUserReviewed(!!response.review);
                } catch (error) {
                    console.error("Error checking user review:", error);
                    setHasUserReviewed(false);
                } finally {
                    setIsCheckingReview(false);
                }
            } else {
                // Guest users haven't reviewed
                setHasUserReviewed(false);
                setIsCheckingReview(false);
            }
        };
        
        checkUserReview();
    }, [token, getUserRestaurantReview]);

    // Fetch exchange rate on component mount for display
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                // For Nigerian users, use fixed NGN rate
                setExchangeRate(1600);
            } catch (error) {
                console.error("Failed to fetch exchange rate", error);
                setExchangeRate(1600); // Fallback rate
            }
        };
        
        fetchExchangeRate();
    }, []);

    const placeOrder = async (orderData) => {
        setIsPlacingOrder(true);
        setPaymentStatus('processing');
        
        try {
            const headers = token ? { headers: { token } } : {};
            
            switch (method) {
                case 'cod':
                    const response = await axios.post(
                        backendUrl + '/api/order/place', 
                        orderData, 
                        headers
                    );
                    if (response.data.success) {
                        await clearCart();
                        navigate('/orders');
                        toast.success("Order placed successfully!");
                    } else {
                        toast.error(response.data.message);
                    }
                    break;

                case 'paystack':
                    // Send original EUR amount to backend
                    const responsePaystack = await axios.post(
                        backendUrl + '/api/order/paystack', 
                        orderData, 
                        headers
                    );
                    
                    if (responsePaystack.data.success) {
                        setPaymentStatus('redirecting');
                        window.location.href = responsePaystack.data.authorization_url;
                    } else {
                        toast.error(responsePaystack.data.message);
                    }
                    break;

                case 'flutterwave':
                    const responseFlutterwave = await axios.post(
                        backendUrl + '/api/order/flutterwave', 
                        orderData, 
                        headers
                    );
                    if (responseFlutterwave.data.success) {
                        setPaymentStatus('redirecting');
                        window.location.href = responseFlutterwave.data.link;
                    } else {
                        toast.error(responseFlutterwave.data.message);
                    }
                    break;

                default:
                    toast.error('Invalid payment method');
                    break;
            }
        } catch (error) {
            console.error('Order placement error:', error);
            setPaymentStatus('failed');
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Order placement failed';
            toast.error(errorMessage);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        // Validate form data
        const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'country', 'phone'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        // Validate phone number (basic validation)
        if (formData.phone.length < 8) {
            toast.error('Please enter a valid phone number');
            return;
        }
        
        // Build order data
        const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
            const itemInfo = products.find((product) => product._id === cartItem.productId);
            if (!itemInfo) return null;
            
            let price = itemInfo.basePrice;
            let variations = {};
            
            if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
                price = itemInfo.variations.wrap.price;
                variations.wrap = cartItem.variations.wrap;
            } 
            else if (cartItem.variations?.size) {
                const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
                if (sizeObj) {
                    price = sizeObj.price;
                    variations.size = cartItem.variations.size;
                }
            }
            
            return {
                productId: itemInfo._id,
                name: itemInfo.name,
                quantity: cartItem.quantity,
                price,
                variations
            };
        }).filter(Boolean);

        // Check if cart has valid items
        if (orderItems.length === 0) {
            toast.error('Your cart is empty or contains invalid items');
            return;
        }

        const orderData = {
            address: formData,
            items: orderItems,
            amount: getCartAmount() + delivery_fee,
        };

        // If user is logged in and hasn't reviewed, show review modal
        if (token && !hasUserReviewed) {
            setPendingOrder(orderData);
            setShowReviewModal(true);
            return;
        }
        
        placeOrder(orderData);
    };

    const handleReviewSubmit = async (rating, comment) => {
        try {
            const response = await addRestaurantReview(rating, comment);
            if (response.success) {
                setHasUserReviewed(true);
                toast.success("Thanks for your review!");
                
                if (pendingOrder) {
                    placeOrder(pendingOrder);
                }
            } else {
                toast.error(response.message || "Failed to submit review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit review");
        } finally {
            setShowReviewModal(false);
            setPendingOrder(null);
        }
    };

    const handleReviewDismiss = () => {
        setShowReviewModal(false);
        if (pendingOrder) {
            placeOrder(pendingOrder);
            setPendingOrder(null);
        }
    };

    return (
        <>
            <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
                {/* Left Side - Delivery Information */}
                <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                    <div className='text-xl sm:text-2xl my-3'>
                        <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                    </div>
                    
                    <div className='flex gap-3'>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>First Name *</label>
                            <input 
                                required 
                                onChange={onChangeHandler} 
                                name='firstName' 
                                value={formData.firstName} 
                                className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                                type="text" 
                                placeholder='First name' 
                            />
                        </div>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name *</label>
                            <input 
                                required 
                                onChange={onChangeHandler} 
                                name='lastName' 
                                value={formData.lastName} 
                                className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                                type="text" 
                                placeholder='Last name' 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='email' 
                            value={formData.email} 
                            className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                            type="email" 
                            placeholder='Email address' 
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Street *</label>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='street' 
                            value={formData.street} 
                            className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                            type="text" 
                            placeholder='Street' 
                        />
                    </div>
                    
                    <div className='flex gap-3'>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
                            <input 
                                required 
                                onChange={onChangeHandler} 
                                name='city' 
                                value={formData.city} 
                                className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                                type="text" 
                                placeholder='City' 
                            />
                        </div>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
                            <input 
                                onChange={onChangeHandler} 
                                name='state' 
                                value={formData.state} 
                                className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                                type="text" 
                                placeholder='State' 
                            />
                        </div>
                    </div>
                    
                    <div className='flex gap-3'>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Zipcode *</label>
                            <input 
                                required 
                                onChange={onChangeHandler} 
                                name='zipcode' 
                                value={formData.zipcode} 
                                className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                                type="number" 
                                placeholder='Zipcode' 
                            />
                        </div>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Country *</label>
                            <input 
                                required 
                                onChange={onChangeHandler} 
                                name='country' 
                                value={formData.country} 
                                className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                                type="text" 
                                placeholder='Country' 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Phone *</label>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='phone' 
                            value={formData.phone} 
                            className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
                            type="tel" 
                            placeholder='Phone' 
                        />
                    </div>
                </div>

                {/* Right Side - Order Summary */}
                <div className='mt-8 w-full sm:max-w-md'>
                    <div className='mt-8'>
                        <CartTotal />
                    </div>
                    
                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                        
                        <div className='flex flex-col gap-3 mt-4'>
                            <div 
                                onClick={() => setMethod('paystack')} 
                                className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
                                    method === 'paystack' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
                                    method === 'paystack' ? 'bg-green-500 border-green-500' : 'border-gray-400'
                                }`}>
                                    {method === 'paystack' && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className='font-medium'>Paystack</p>
                                    <p className='text-sm text-gray-500'>Pay with card, bank transfer, or mobile money</p>
                                    {method === 'paystack' && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            Amount will be converted to NGN at {exchangeRate.toLocaleString()} EUR/NGN
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setMethod('flutterwave')} 
                                className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
                                    method === 'flutterwave' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
                                    method === 'flutterwave' ? 'bg-green-500 border-green-500' : 'border-gray-400'
                                }`}>
                                    {method === 'flutterwave' && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className='font-medium'>Flutterwave</p>
                                    <p className='text-sm text-gray-500'>Pay with card, bank account, or mobile money</p>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setMethod('cod')} 
                                className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
                                    method === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
                                    method === 'cod' ? 'bg-green-500 border-green-500' : 'border-gray-400'
                                }`}>
                                    {method === 'cod' && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className='font-medium'>Cash on Delivery</p>
                                    <p className='text-sm text-gray-500'>Pay when your order arrives</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className='w-full text-end mt-8'>
                            <button 
                                type='submit' 
                                disabled={isPlacingOrder || isCheckingReview}
                                className={`px-8 py-3 text-sm font-medium rounded-md transition-all duration-300 ${
                                    isPlacingOrder || isCheckingReview 
                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {isPlacingOrder ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        PLACING ORDER...
                                    </div>
                                ) : 'PLACE ORDER'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            
            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={handleReviewDismiss}
                onSubmit={handleReviewSubmit}
                hasReviewed={false}
                title="Review Your Experience"
                description="How was your meal with Edirin Chops?"
            />
        </>
    );
};

export default PlaceOrder;






















// import React, { useContext, useState, useEffect } from 'react';
// import Title from '../components/Title';
// import CartTotal from '../components/CartTotal';
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ReviewModal from '../components/ReviewModal';

// const PlaceOrder = () => {
//     const { 
//         navigate, 
//         backendUrl, 
//         token, 
//         cartItems, 
//         getCartAmount, 
//         delivery_fee, 
//         products,
//         addRestaurantReview,
//         getUserRestaurantReview,
//         clearCart,
//         setPaymentStatus
//     } = useContext(ShopContext);
    
//     // Payment method state
//     const [method, setMethod] = useState('cod');
    
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         street: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         country: '',
//         phone: '',
//     });
    
//     // State for review modal
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [hasUserReviewed, setHasUserReviewed] = useState(false);
//     const [isCheckingReview, setIsCheckingReview] = useState(true);
//     const [pendingOrder, setPendingOrder] = useState(null);
//     const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//     // Currency conversion rates for display only
//     const [exchangeRate, setExchangeRate] = useState(1.07);

//     const onChangeHandler = (event) => {
//         const { name, value } = event.target;
//         setFormData((data) => ({ ...data, [name]: value }));
//     };

//     // Check if user has reviewed the restaurant
//     useEffect(() => {
//         const checkUserReview = async () => {
//             if (token) {
//                 setIsCheckingReview(true);
//                 try {
//                     const response = await getUserRestaurantReview();
//                     setHasUserReviewed(!!response.review);
//                 } catch (error) {
//                     console.error("Error checking user review:", error);
//                     setHasUserReviewed(false);
//                 } finally {
//                     setIsCheckingReview(false);
//                 }
//             } else {
//                 // Guest users haven't reviewed
//                 setHasUserReviewed(false);
//                 setIsCheckingReview(false);
//             }
//         };
        
//         checkUserReview();
//     }, [token, getUserRestaurantReview]);

//     // Fetch exchange rate on component mount for display
//     useEffect(() => {
//         const fetchExchangeRate = async () => {
//             try {
//                 // In production, replace this with a real exchange rate API
//                 // const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
//                 // setExchangeRate(response.data.rates.USD);
                
//                 // For now, use a fixed rate
//                 setExchangeRate(1.07);
//             } catch (error) {
//                 console.error("Failed to fetch exchange rate", error);
//                 setExchangeRate(1.07); // Fallback rate
//             }
//         };
        
//         fetchExchangeRate();
//     }, []);

//     const placeOrder = async (orderData) => {
//         setIsPlacingOrder(true);
//         setPaymentStatus('processing');
        
//         try {
//             const headers = token ? { headers: { token } } : {};
            
//             switch (method) {
//                 case 'cod':
//                     const response = await axios.post(
//                         backendUrl + '/api/order/place', 
//                         orderData, 
//                         headers
//                     );
//                     if (response.data.success) {
//                         await clearCart();
//                         navigate('/orders');
//                         toast.success("Order placed successfully!");
//                     } else {
//                         toast.error(response.data.message);
//                     }
//                     break;

//                 case 'paystack':
//                     // Send original EUR amount to backend
//                     const responsePaystack = await axios.post(
//                         backendUrl + '/api/order/paystack', 
//                         orderData, 
//                         headers
//                     );
                    
//                     if (responsePaystack.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responsePaystack.data.authorization_url;
//                     } else {
//                         toast.error(responsePaystack.data.message);
//                     }
//                     break;

//                 case 'flutterwave':
//                     const responseFlutterwave = await axios.post(
//                         backendUrl + '/api/order/flutterwave', 
//                         orderData, 
//                         headers
//                     );
//                     if (responseFlutterwave.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responseFlutterwave.data.link;
//                     } else {
//                         toast.error(responseFlutterwave.data.message);
//                     }
//                     break;

//                 default:
//                     toast.error('Invalid payment method');
//                     break;
//             }
//         } catch (error) {
//             console.error('Order placement error:', error);
//             setPaymentStatus('failed');
            
//             const errorMessage = error.response?.data?.message || 
//                                 error.message || 
//                                 'Order placement failed';
//             toast.error(errorMessage);
//         } finally {
//             setIsPlacingOrder(false);
//         }
//     };

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
        
//         // Validate form data
//         const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'country', 'phone'];
//         const missingFields = requiredFields.filter(field => !formData[field]);
        
//         if (missingFields.length > 0) {
//             toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
//             return;
//         }
        
//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             toast.error('Please enter a valid email address');
//             return;
//         }
        
//         // Validate phone number (basic validation)
//         if (formData.phone.length < 8) {
//             toast.error('Please enter a valid phone number');
//             return;
//         }
        
//         // Build order data
//         const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
//             const itemInfo = products.find((product) => product._id === cartItem.productId);
//             if (!itemInfo) return null;
            
//             let price = itemInfo.basePrice;
//             let variations = {};
            
//             if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
//                 price = itemInfo.variations.wrap.price;
//                 variations.wrap = cartItem.variations.wrap;
//             } 
//             else if (cartItem.variations?.size) {
//                 const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
//                 if (sizeObj) {
//                     price = sizeObj.price;
//                     variations.size = cartItem.variations.size;
//                 }
//             }
            
//             return {
//                 productId: itemInfo._id,
//                 name: itemInfo.name,
//                 quantity: cartItem.quantity,
//                 price,
//                 variations
//             };
//         }).filter(Boolean);

//         // Check if cart has valid items
//         if (orderItems.length === 0) {
//             toast.error('Your cart is empty or contains invalid items');
//             return;
//         }

//         const orderData = {
//             address: formData,
//             items: orderItems,
//             amount: getCartAmount() + delivery_fee,
//         };

//         // If user is logged in and hasn't reviewed, show review modal
//         if (token && !hasUserReviewed) {
//             setPendingOrder(orderData);
//             setShowReviewModal(true);
//             return;
//         }
        
//         placeOrder(orderData);
//     };

//     const handleReviewSubmit = async (rating, comment) => {
//         try {
//             const response = await addRestaurantReview(rating, comment);
//             if (response.success) {
//                 setHasUserReviewed(true);
//                 toast.success("Thanks for your review!");
                
//                 if (pendingOrder) {
//                     placeOrder(pendingOrder);
//                 }
//             } else {
//                 toast.error(response.message || "Failed to submit review");
//             }
//         } catch (error) {
//             console.error("Error submitting review:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setShowReviewModal(false);
//             setPendingOrder(null);
//         }
//     };

//     const handleReviewDismiss = () => {
//         setShowReviewModal(false);
//         if (pendingOrder) {
//             placeOrder(pendingOrder);
//             setPendingOrder(null);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//                 {/* Left Side - Delivery Information */}
//                 <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//                     <div className='text-xl sm:text-2xl my-3'>
//                         <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>First Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='firstName' 
//                                 value={formData.firstName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='First name' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='lastName' 
//                                 value={formData.lastName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Last name' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='email' 
//                             value={formData.email} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="email" 
//                             placeholder='Email address' 
//                         />
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Street *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='street' 
//                             value={formData.street} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="text" 
//                             placeholder='Street' 
//                         />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='city' 
//                                 value={formData.city} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='City' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
//                             <input 
//                                 onChange={onChangeHandler} 
//                                 name='state' 
//                                 value={formData.state} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='State' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Zipcode *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='zipcode' 
//                                 value={formData.zipcode} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="number" 
//                                 placeholder='Zipcode' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Country *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='country' 
//                                 value={formData.country} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Country' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Phone *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='phone' 
//                             value={formData.phone} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="tel" 
//                             placeholder='Phone' 
//                         />
//                     </div>
//                 </div>

//                 {/* Right Side - Order Summary */}
//                 <div className='mt-8 w-full sm:max-w-md'>
//                     <div className='mt-8'>
//                         <CartTotal />
//                     </div>
                    
//                     <div className='mt-12'>
//                         <Title text1={'PAYMENT'} text2={'METHOD'} />
                        
//                         <div className='flex flex-col gap-3 mt-4'>
//                             <div 
//                                 onClick={() => setMethod('paystack')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'paystack' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'paystack' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'paystack' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Paystack</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank transfer, or mobile money</p>
//                                     {method === 'paystack' && (
//                                         <p className="text-xs text-orange-600 mt-1">
//                                             Amount will be converted to USD at {exchangeRate.toFixed(4)} EUR/USD
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('flutterwave')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'flutterwave' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'flutterwave' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'flutterwave' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Flutterwave</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank account, or mobile money</p>
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('cod')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'cod' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'cod' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Cash on Delivery</p>
//                                     <p className='text-sm text-gray-500'>Pay when your order arrives</p>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         <div className='w-full text-end mt-8'>
//                             <button 
//                                 type='submit' 
//                                 disabled={isPlacingOrder || isCheckingReview}
//                                 className={`px-8 py-3 text-sm font-medium rounded-md transition-all duration-300 ${
//                                     isPlacingOrder || isCheckingReview 
//                                         ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
//                                         : 'bg-green-600 text-white hover:bg-green-700'
//                                 }`}
//                             >
//                                 {isPlacingOrder ? (
//                                     <div className="flex items-center justify-center">
//                                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         PLACING ORDER...
//                                     </div>
//                                 ) : 'PLACE ORDER'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
            
//             {/* Review Modal */}
//             <ReviewModal
//                 isOpen={showReviewModal}
//                 onClose={handleReviewDismiss}
//                 onSubmit={handleReviewSubmit}
//                 hasReviewed={false}
//                 title="Review Your Experience"
//                 description="How was your meal with Edirin Chops?"
//             />
//         </>
//     );
// };

// export default PlaceOrder;





























// import React, { useContext, useState, useEffect } from 'react';
// import Title from '../components/Title';
// import CartTotal from '../components/CartTotal';
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ReviewModal from '../components/ReviewModal';

// const PlaceOrder = () => {
//     const { 
//         navigate, 
//         backendUrl, 
//         token, 
//         cartItems, 
//         setCartItems, 
//         getCartAmount, 
//         delivery_fee, 
//         products,
//         addRestaurantReview,
//         getUserRestaurantReview,
//         clearCart,
//         setPaymentStatus
//     } = useContext(ShopContext);
    
//     // Payment method state
//     const [method, setMethod] = useState('cod');
    
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         street: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         country: '',
//         phone: '',
//     });
    
//     // State for review modal
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [hasUserReviewed, setHasUserReviewed] = useState(false);
//     const [isCheckingReview, setIsCheckingReview] = useState(true);
//     const [pendingOrder, setPendingOrder] = useState(null);
//     const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//     // Currency conversion rates (should be fetched from an API in production)
//     const [exchangeRate, setExchangeRate] = useState(1.07); // 1 EUR = 1.07 USD
    
//     const onChangeHandler = (event) => {
//         const { name, value } = event.target;
//         setFormData((data) => ({ ...data, [name]: value }));
//     };

//     // Check if user has reviewed the restaurant
//     useEffect(() => {
//         const checkUserReview = async () => {
//             if (token) {
//                 setIsCheckingReview(true);
//                 try {
//                     const response = await getUserRestaurantReview();
//                     setHasUserReviewed(!!response.review);
//                 } catch (error) {
//                     console.error("Error checking user review:", error);
//                     setHasUserReviewed(false);
//                 } finally {
//                     setIsCheckingReview(false);
//                 }
//             } else {
//                 // Guest users haven't reviewed
//                 setHasUserReviewed(false);
//                 setIsCheckingReview(false);
//             }
//         };
        
//         checkUserReview();
//     }, [token, getUserRestaurantReview]);

//     // Fetch exchange rate on component mount
//     useEffect(() => {
//         const fetchExchangeRate = async () => {
//             try {
//                 // In production, replace this with a real exchange rate API
//                 // const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
//                 // setExchangeRate(response.data.rates.USD);
                
//                 // For now, use a fixed rate
//                 setExchangeRate(1.07);
//             } catch (error) {
//                 console.error("Failed to fetch exchange rate", error);
//                 setExchangeRate(1.07); // Fallback rate
//             }
//         };
        
//         fetchExchangeRate();
//     }, []);

//     const convertToUSD = (eurAmount) => {
//         return eurAmount * exchangeRate;
//     };

//     const placeOrder = async (orderData) => {
//         setIsPlacingOrder(true);
//         setPaymentStatus('processing');
        
//         try {
//             const headers = token ? { headers: { token } } : {};
            
//             switch (method) {
//                 case 'cod':
//                     const response = await axios.post(
//                         backendUrl + '/api/order/place', 
//                         orderData, 
//                         headers
//                     );
//                     if (response.data.success) {
//                         await clearCart();
//                         navigate('/orders');
//                         toast.success("Order placed successfully!");
//                     } else {
//                         toast.error(response.data.message);
//                     }
//                     break;

//                 case 'paystack':
//                     // Convert amount to USD for Paystack
//                     const usdAmount = convertToUSD(orderData.amount);
//                     const paystackData = {
//                         ...orderData,
//                         amount: usdAmount
//                     };

//                     const responsePaystack = await axios.post(
//                         backendUrl + '/api/order/paystack', 
//                         paystackData, 
//                         headers
//                     );
                    
//                     if (responsePaystack.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responsePaystack.data.authorization_url;
//                     } else {
//                         toast.error(responsePaystack.data.message);
//                     }
//                     break;

//                 case 'flutterwave':
//                     const responseFlutterwave = await axios.post(
//                         backendUrl + '/api/order/flutterwave', 
//                         orderData, 
//                         headers
//                     );
//                     if (responseFlutterwave.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responseFlutterwave.data.link;
//                     } else {
//                         toast.error(responseFlutterwave.data.message);
//                     }
//                     break;

//                 default:
//                     toast.error('Invalid payment method');
//                     break;
//             }
//         } catch (error) {
//             console.error('Order placement error:', error);
//             setPaymentStatus('failed');
//             toast.error(error.response?.data?.message || error.message || 'Order placement failed');
//         } finally {
//             setIsPlacingOrder(false);
//         }
//     };

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
        
//         // Validate form data
//         const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'country', 'phone'];
//         const missingFields = requiredFields.filter(field => !formData[field]);
        
//         if (missingFields.length > 0) {
//             toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
//             return;
//         }
        
//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             toast.error('Please enter a valid email address');
//             return;
//         }
        
//         // Build order data
//         const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
//             const itemInfo = products.find((product) => product._id === cartItem.productId);
//             if (!itemInfo) return null;
            
//             let price = itemInfo.basePrice;
//             let variations = {};
            
//             if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
//                 price = itemInfo.variations.wrap.price;
//                 variations.wrap = cartItem.variations.wrap;
//             } 
//             else if (cartItem.variations?.size) {
//                 const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
//                 if (sizeObj) {
//                     price = sizeObj.price;
//                     variations.size = cartItem.variations.size;
//                 }
//             }
            
//             return {
//                 productId: itemInfo._id,
//                 name: itemInfo.name,
//                 quantity: cartItem.quantity,
//                 price,
//                 variations
//             };
//         }).filter(Boolean);

//         // Check if cart has valid items
//         if (orderItems.length === 0) {
//             toast.error('Your cart is empty or contains invalid items');
//             return;
//         }

//         const orderData = {
//             address: formData,
//             items: orderItems,
//             amount: getCartAmount() + delivery_fee,
//         };

//         // If user is logged in and hasn't reviewed, show review modal
//         if (token && !hasUserReviewed) {
//             setPendingOrder(orderData);
//             setShowReviewModal(true);
//             return;
//         }
        
//         placeOrder(orderData);
//     };

//     const handleReviewSubmit = async (rating, comment) => {
//         try {
//             const response = await addRestaurantReview(rating, comment);
//             if (response.success) {
//                 setHasUserReviewed(true);
//                 toast.success("Thanks for your review!");
                
//                 if (pendingOrder) {
//                     placeOrder(pendingOrder);
//                 }
//             } else {
//                 toast.error(response.message || "Failed to submit review");
//             }
//         } catch (error) {
//             console.error("Error submitting review:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setShowReviewModal(false);
//             setPendingOrder(null);
//         }
//     };

//     const handleReviewDismiss = () => {
//         setShowReviewModal(false);
//         if (pendingOrder) {
//             placeOrder(pendingOrder);
//             setPendingOrder(null);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//                 {/* Left Side - Delivery Information */}
//                 <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//                     <div className='text-xl sm:text-2xl my-3'>
//                         <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>First Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='firstName' 
//                                 value={formData.firstName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='First name' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='lastName' 
//                                 value={formData.lastName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Last name' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='email' 
//                             value={formData.email} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="email" 
//                             placeholder='Email address' 
//                         />
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Street *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='street' 
//                             value={formData.street} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="text" 
//                             placeholder='Street' 
//                         />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='city' 
//                                 value={formData.city} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='City' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
//                             <input 
//                                 onChange={onChangeHandler} 
//                                 name='state' 
//                                 value={formData.state} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='State' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Zipcode *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='zipcode' 
//                                 value={formData.zipcode} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="number" 
//                                 placeholder='Zipcode' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Country *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='country' 
//                                 value={formData.country} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Country' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Phone *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='phone' 
//                             value={formData.phone} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="tel" 
//                             placeholder='Phone' 
//                         />
//                     </div>
//                 </div>

//                 {/* Right Side - Order Summary */}
//                 <div className='mt-8 w-full sm:max-w-md'>
//                     <div className='mt-8'>
//                         <CartTotal />
//                     </div>
                    
//                     <div className='mt-12'>
//                         <Title text1={'PAYMENT'} text2={'METHOD'} />
                        
//                         <div className='flex flex-col gap-3 mt-4'>
//                             <div 
//                                 onClick={() => setMethod('paystack')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'paystack' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'paystack' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'paystack' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Paystack</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank transfer, or mobile money</p>
//                                     {method === 'paystack' && (
//                                         <p className="text-xs text-orange-600 mt-1">
//                                             Amount will be converted to USD at {exchangeRate.toFixed(4)} EUR/USD
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('flutterwave')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'flutterwave' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'flutterwave' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'flutterwave' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Flutterwave</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank account, or mobile money</p>
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('cod')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'cod' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'cod' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Cash on Delivery</p>
//                                     <p className='text-sm text-gray-500'>Pay when your order arrives</p>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         <div className='w-full text-end mt-8'>
//                             <button 
//                                 type='submit' 
//                                 disabled={isPlacingOrder || isCheckingReview}
//                                 className={`px-8 py-3 text-sm font-medium rounded-md transition-all duration-300 ${
//                                     isPlacingOrder || isCheckingReview 
//                                         ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
//                                         : 'bg-green-600 text-white hover:bg-green-700'
//                                 }`}
//                             >
//                                 {isPlacingOrder ? (
//                                     <div className="flex items-center justify-center">
//                                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         PLACING ORDER...
//                                     </div>
//                                 ) : 'PLACE ORDER'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
            
//             {/* Review Modal */}
//             <ReviewModal
//                 isOpen={showReviewModal}
//                 onClose={handleReviewDismiss}
//                 onSubmit={handleReviewSubmit}
//                 hasReviewed={false}
//                 title="Review Your Experience"
//                 description="How was your meal with Edirin Chops?"
//             />
//         </>
//     );
// };

// export default PlaceOrder;



























// import React, { useContext, useState, useEffect } from 'react';
// import Title from '../components/Title';
// import CartTotal from '../components/CartTotal';
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ReviewModal from '../components/ReviewModal';

// const PlaceOrder = () => {
//     const { 
//         navigate, 
//         backendUrl, 
//         token, 
//         cartItems, 
//         setCartItems, 
//         getCartAmount, 
//         delivery_fee, 
//         products,
//         addRestaurantReview,
//         getUserRestaurantReview,
//         clearCart,
//         setPaymentStatus
//     } = useContext(ShopContext);
    
//     // Add this state for payment method selection
//     const [method, setMethod] = useState('cod');
    
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         street: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         country: '',
//         phone: '',
//     });
    
//     // State for review modal
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [hasUserReviewed, setHasUserReviewed] = useState(false);
//     const [isCheckingReview, setIsCheckingReview] = useState(true);
//     const [pendingOrder, setPendingOrder] = useState(null);
//     const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//     const onChangeHandler = (event) => {
//         const { name, value } = event.target;
//         setFormData((data) => ({ ...data, [name]: value }));
//     };

//     // Check if user has reviewed the restaurant
//     useEffect(() => {
//         const checkUserReview = async () => {
//             if (token) {
//                 setIsCheckingReview(true);
//                 try {
//                     const response = await getUserRestaurantReview();
//                     setHasUserReviewed(!!response.review);
//                 } catch (error) {
//                     console.error("Error checking user review:", error);
//                     setHasUserReviewed(false);
//                 } finally {
//                     setIsCheckingReview(false);
//                 }
//             } else {
//                 // Guest users haven't reviewed
//                 setHasUserReviewed(false);
//                 setIsCheckingReview(false);
//             }
//         };
        
//         checkUserReview();
//     }, [token, getUserRestaurantReview]);

//     const placeOrder = async (orderData) => {
//         setIsPlacingOrder(true);
//         setPaymentStatus('processing');
        
//         try {
//             const headers = token ? { headers: { token } } : {};
            
//             switch (method) {
//                 case 'cod':
//                     const response = await axios.post(
//                         backendUrl + '/api/order/place', 
//                         orderData, 
//                         headers
//                     );
//                     if (response.data.success) {
//                         await clearCart();
//                         navigate('/orders');
//                         toast.success("Order placed successfully!");
//                     } else {
//                         toast.error(response.data.message);
//                     }
//                     break;

//                 // case 'paystack':
//                 //     const responsePaystack = await axios.post(
//                 //         backendUrl + '/api/order/paystack', 
//                 //         orderData, 
//                 //         headers
//                 //     );
//                 //     if (responsePaystack.data.success) {
//                 //         setPaymentStatus('redirecting');
//                 //         window.location.href = responsePaystack.data.authorization_url;
//                 //     } else {
//                 //         toast.error(responsePaystack.data.message);
//                 //     }
//                 //     break;


                
        
//       case 'paystack':
//         const responsePaystack = await axios.post(
//           backendUrl + '/api/order/paystack', 
//           orderData, 
//           headers
//         );
        
//         // Handle different response structures
//         let paystackUrl = responsePaystack.data.authorization_url || 
//                           responsePaystack.data.data?.authorization_url;
        
//         if (!paystackUrl) {
//           throw new Error('Payment gateway did not provide redirect URL');
//         }
        
//         if (responsePaystack.data.success && paystackUrl) {
//           setPaymentStatus('redirecting');
//           window.location.href = paystackUrl;
//         }
//         break;


//                 case 'flutterwave':
//                     const responseFlutterwave = await axios.post(
//                         backendUrl + '/api/order/flutterwave', 
//                         orderData, 
//                         headers
//                     );
//                     if (responseFlutterwave.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responseFlutterwave.data.link;
//                     } else {
//                         toast.error(responseFlutterwave.data.message);
//                     }
//                     break;

//                 default:
//                     toast.error('Invalid payment method');
//                     break;
//             }
//         } catch (error) {
//             console.error('Order placement error:', error);
//             setPaymentStatus('failed');
//             toast.error(error.response?.data?.message || error.message || 'Order placement failed');
//         } finally {
//             setIsPlacingOrder(false);
//         }
//     };

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
        
//         // Validate form data
//         const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'country', 'phone'];
//         const missingFields = requiredFields.filter(field => !formData[field]);
        
//         if (missingFields.length > 0) {
//             toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
//             return;
//         }
        
//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             toast.error('Please enter a valid email address');
//             return;
//         }
        
//         // Build order data
//         const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
//             const itemInfo = products.find((product) => product._id === cartItem.productId);
//             if (!itemInfo) return null;
            
//             let price = itemInfo.basePrice;
//             let variations = {};
            
//             if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
//                 price = itemInfo.variations.wrap.price;
//                 variations.wrap = cartItem.variations.wrap;
//             } 
//             else if (cartItem.variations?.size) {
//                 const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
//                 if (sizeObj) {
//                     price = sizeObj.price;
//                     variations.size = cartItem.variations.size;
//                 }
//             }
            
//             return {
//                 productId: itemInfo._id,
//                 name: itemInfo.name,
//                 quantity: cartItem.quantity,
//                 price,
//                 variations
//             };
//         }).filter(Boolean);

//         // Check if cart has valid items
//         if (orderItems.length === 0) {
//             toast.error('Your cart is empty or contains invalid items');
//             return;
//         }

//         const orderData = {
//             address: formData,
//             items: orderItems,
//             amount: getCartAmount() + delivery_fee,
//         };

//         // If user is logged in and hasn't reviewed, show review modal
//         if (token && !hasUserReviewed) {
//             setPendingOrder(orderData);
//             setShowReviewModal(true);
//             return;
//         }
        
//         placeOrder(orderData);
//     };

//     const handleReviewSubmit = async (rating, comment) => {
//         try {
//             const response = await addRestaurantReview(rating, comment);
//             if (response.success) {
//                 setHasUserReviewed(true);
//                 toast.success("Thanks for your review!");
                
//                 if (pendingOrder) {
//                     placeOrder(pendingOrder);
//                 }
//             } else {
//                 toast.error(response.message || "Failed to submit review");
//             }
//         } catch (error) {
//             console.error("Error submitting review:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setShowReviewModal(false);
//             setPendingOrder(null);
//         }
//     };

//     const handleReviewDismiss = () => {
//         setShowReviewModal(false);
//         if (pendingOrder) {
//             placeOrder(pendingOrder);
//             setPendingOrder(null);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//                 {/* Left Side - Delivery Information */}
//                 <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//                     <div className='text-xl sm:text-2xl my-3'>
//                         <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>First Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='firstName' 
//                                 value={formData.firstName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='First name' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='lastName' 
//                                 value={formData.lastName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Last name' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='email' 
//                             value={formData.email} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="email" 
//                             placeholder='Email address' 
//                         />
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Street *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='street' 
//                             value={formData.street} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="text" 
//                             placeholder='Street' 
//                         />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='city' 
//                                 value={formData.city} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='City' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
//                             <input 
//                                 onChange={onChangeHandler} 
//                                 name='state' 
//                                 value={formData.state} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='State' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Zipcode *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='zipcode' 
//                                 value={formData.zipcode} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="number" 
//                                 placeholder='Zipcode' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Country *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='country' 
//                                 value={formData.country} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Country' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Phone *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='phone' 
//                             value={formData.phone} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="tel" 
//                             placeholder='Phone' 
//                         />
//                     </div>
//                 </div>

//                 {/* Right Side - Order Summary */}
//                 <div className='mt-8 w-full sm:max-w-md'>
//                     <div className='mt-8'>
//                         <CartTotal />
//                     </div>
                    
//                     <div className='mt-12'>
//                         <Title text1={'PAYMENT'} text2={'METHOD'} />
                        
//                         <div className='flex flex-col gap-3 mt-4'>
//                             <div 
//                                 onClick={() => setMethod('paystack')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'paystack' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'paystack' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'paystack' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Paystack</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank transfer, or mobile money</p>
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('flutterwave')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'flutterwave' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'flutterwave' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'flutterwave' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Flutterwave</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank account, or mobile money</p>
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('cod')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'cod' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'cod' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Cash on Delivery</p>
//                                     <p className='text-sm text-gray-500'>Pay when your order arrives</p>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         <div className='w-full text-end mt-8'>
//                             <button 
//                                 type='submit' 
//                                 disabled={isPlacingOrder || isCheckingReview}
//                                 className={`px-8 py-3 text-sm font-medium rounded-md transition-all duration-300 ${
//                                     isPlacingOrder || isCheckingReview 
//                                         ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
//                                         : 'bg-green-600 text-white hover:bg-green-700'
//                                 }`}
//                             >
//                                 {isPlacingOrder ? (
//                                     <div className="flex items-center justify-center">
//                                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         PLACING ORDER...
//                                     </div>
//                                 ) : 'PLACE ORDER'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
            
//             {/* Review Modal */}
//             <ReviewModal
//                 isOpen={showReviewModal}
//                 onClose={handleReviewDismiss}
//                 onSubmit={handleReviewSubmit}
//                 hasReviewed={false}
//                 title="Review Your Experience"
//                 description="How was your meal with Edirin Chops?"
//             />
//         </>
//     );
// };

// export default PlaceOrder;






















// import React, { useContext, useState, useEffect } from 'react';
// import Title from '../components/Title';
// import CartTotal from '../components/CartTotal';
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ReviewModal from '../components/ReviewModal';

// const PlaceOrder = () => {
//     const { 
//         navigate, 
//         backendUrl, 
//         token, 
//         cartItems, 
//         setCartItems, 
//         getCartAmount, 
//         delivery_fee, 
//         products,
//         addRestaurantReview,
//         getUserRestaurantReview,
//         clearCart,
//         setPaymentStatus
//     } = useContext(ShopContext);
    
//     // Add this state for payment method selection
//     const [method, setMethod] = useState('cod');
    
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         street: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         country: '',
//         phone: '',
//     });
    
//     // State for review modal
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [hasUserReviewed, setHasUserReviewed] = useState(false);
//     const [isCheckingReview, setIsCheckingReview] = useState(true);
//     const [pendingOrder, setPendingOrder] = useState(null);
//     const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//     const onChangeHandler = (event) => {
//         const { name, value } = event.target;
//         setFormData((data) => ({ ...data, [name]: value }));
//     };

//     // Check if user has reviewed the restaurant
//     useEffect(() => {
//         const checkUserReview = async () => {
//             if (token) {
//                 setIsCheckingReview(true);
//                 try {
//                     const response = await getUserRestaurantReview();
//                     setHasUserReviewed(!!response.review);
//                 } catch (error) {
//                     console.error("Error checking user review:", error);
//                     setHasUserReviewed(false);
//                 } finally {
//                     setIsCheckingReview(false);
//                 }
//             } else {
//                 // Guest users haven't reviewed
//                 setHasUserReviewed(false);
//                 setIsCheckingReview(false);
//             }
//         };
        
//         checkUserReview();
//     }, [token, getUserRestaurantReview]);

//     const placeOrder = async (orderData) => {
//         setIsPlacingOrder(true);
//         setPaymentStatus('processing');
        
//         try {
//             const headers = token ? { headers: { token } } : {};
            
//             switch (method) {
//                 case 'cod':
//                     const response = await axios.post(
//                         backendUrl + '/api/order/place', 
//                         orderData, 
//                         headers
//                     );
//                     if (response.data.success) {
//                         await clearCart();
//                         navigate('/orders');
//                         toast.success("Order placed successfully!");
//                     } else {
//                         toast.error(response.data.message);
//                     }
//                     break;

//                 case 'paystack':
//                     const responsePaystack = await axios.post(
//                         backendUrl + '/api/order/paystack', 
//                         orderData, 
//                         headers
//                     );
//                     if (responsePaystack.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responsePaystack.data.authorization_url;
//                     } else {
//                         toast.error(responsePaystack.data.message);
//                     }
//                     break;

//                 case 'flutterwave':
//                     const responseFlutterwave = await axios.post(
//                         backendUrl + '/api/order/flutterwave', 
//                         orderData, 
//                         headers
//                     );
//                     if (responseFlutterwave.data.success) {
//                         setPaymentStatus('redirecting');
//                         window.location.href = responseFlutterwave.data.link;
//                     } else {
//                         toast.error(responseFlutterwave.data.message);
//                     }
//                     break;

//                 default:
//                     toast.error('Invalid payment method');
//                     break;
//             }
//         } catch (error) {
//             console.error('Order placement error:', error);
//             setPaymentStatus('failed');
//             toast.error(error.response?.data?.message || error.message || 'Order placement failed');
//         } finally {
//             setIsPlacingOrder(false);
//         }
//     };

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
        
//         // Validate form data
//         const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'zipcode', 'country', 'phone'];
//         const missingFields = requiredFields.filter(field => !formData[field]);
        
//         if (missingFields.length > 0) {
//             toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
//             return;
//         }
        
//         // Validate email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formData.email)) {
//             toast.error('Please enter a valid email address');
//             return;
//         }
        
//         // Build order data
//         const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
//             const itemInfo = products.find((product) => product._id === cartItem.productId);
//             if (!itemInfo) return null;
            
//             let price = itemInfo.basePrice;
//             let variations = {};
            
//             if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
//                 price = itemInfo.variations.wrap.price;
//                 variations.wrap = cartItem.variations.wrap;
//             } 
//             else if (cartItem.variations?.size) {
//                 const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
//                 if (sizeObj) {
//                     price = sizeObj.price;
//                     variations.size = cartItem.variations.size;
//                 }
//             }
            
//             return {
//                 productId: itemInfo._id,
//                 name: itemInfo.name,
//                 quantity: cartItem.quantity,
//                 price,
//                 variations
//             };
//         }).filter(Boolean);

//         // Check if cart has valid items
//         if (orderItems.length === 0) {
//             toast.error('Your cart is empty or contains invalid items');
//             return;
//         }

//         const orderData = {
//             address: formData,
//             items: orderItems,
//             amount: getCartAmount() + delivery_fee,
//         };

//         // If user is logged in and hasn't reviewed, show review modal
//         if (token && !hasUserReviewed) {
//             setPendingOrder(orderData);
//             setShowReviewModal(true);
//             return;
//         }
        
//         placeOrder(orderData);
//     };

//     const handleReviewSubmit = async (rating, comment) => {
//         try {
//             const response = await addRestaurantReview(rating, comment);
//             if (response.success) {
//                 setHasUserReviewed(true);
//                 toast.success("Thanks for your review!");
                
//                 if (pendingOrder) {
//                     placeOrder(pendingOrder);
//                 }
//             } else {
//                 toast.error(response.message || "Failed to submit review");
//             }
//         } catch (error) {
//             console.error("Error submitting review:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setShowReviewModal(false);
//             setPendingOrder(null);
//         }
//     };

//     const handleReviewDismiss = () => {
//         setShowReviewModal(false);
//         if (pendingOrder) {
//             placeOrder(pendingOrder);
//             setPendingOrder(null);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//                 {/* Left Side - Delivery Information */}
//                 <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//                     <div className='text-xl sm:text-2xl my-3'>
//                         <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>First Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='firstName' 
//                                 value={formData.firstName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='First name' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='lastName' 
//                                 value={formData.lastName} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Last name' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='email' 
//                             value={formData.email} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="email" 
//                             placeholder='Email address' 
//                         />
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Street *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='street' 
//                             value={formData.street} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="text" 
//                             placeholder='Street' 
//                         />
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='city' 
//                                 value={formData.city} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='City' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
//                             <input 
//                                 onChange={onChangeHandler} 
//                                 name='state' 
//                                 value={formData.state} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='State' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div className='flex gap-3'>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Zipcode *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='zipcode' 
//                                 value={formData.zipcode} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="number" 
//                                 placeholder='Zipcode' 
//                             />
//                         </div>
//                         <div className='w-full'>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>Country *</label>
//                             <input 
//                                 required 
//                                 onChange={onChangeHandler} 
//                                 name='country' 
//                                 value={formData.country} 
//                                 className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                                 type="text" 
//                                 placeholder='Country' 
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>Phone *</label>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='phone' 
//                             value={formData.phone} 
//                             className='border border-gray-300 rounded py-2 px-3 w-full text-black' 
//                             type="tel" 
//                             placeholder='Phone' 
//                         />
//                     </div>
//                 </div>

//                 {/* Right Side - Order Summary */}
//                 <div className='mt-8 w-full sm:max-w-md'>
//                     <div className='mt-8'>
//                         <CartTotal />
//                     </div>
                    
//                     <div className='mt-12'>
//                         <Title text1={'PAYMENT'} text2={'METHOD'} />
                        
//                         <div className='flex flex-col gap-3 mt-4'>
//                             <div 
//                                 onClick={() => setMethod('paystack')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'paystack' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'paystack' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'paystack' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Paystack</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank transfer, or mobile money</p>
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('flutterwave')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'flutterwave' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'flutterwave' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'flutterwave' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Flutterwave</p>
//                                     <p className='text-sm text-gray-500'>Pay with card, bank account, or mobile money</p>
//                                 </div>
//                             </div>
                            
//                             <div 
//                                 onClick={() => setMethod('cod')} 
//                                 className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all ${
//                                     method === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
//                                 }`}
//                             >
//                                 <div className={`min-w-5 h-5 border rounded-full flex items-center justify-center ${
//                                     method === 'cod' ? 'bg-green-500 border-green-500' : 'border-gray-400'
//                                 }`}>
//                                     {method === 'cod' && (
//                                         <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <p className='font-medium'>Cash on Delivery</p>
//                                     <p className='text-sm text-gray-500'>Pay when your order arrives</p>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         <div className='w-full text-end mt-8'>
//                             <button 
//                                 type='submit' 
//                                 disabled={isPlacingOrder || isCheckingReview}
//                                 className={`px-8 py-3 text-sm font-medium rounded-md transition-all duration-300 ${
//                                     isPlacingOrder || isCheckingReview 
//                                         ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
//                                         : 'bg-green-600 text-white hover:bg-green-700'
//                                 }`}
//                             >
//                                 {isPlacingOrder ? (
//                                     <div className="flex items-center justify-center">
//                                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         PLACING ORDER...
//                                     </div>
//                                 ) : 'PLACE ORDER'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
            
//             {/* Review Modal */}
//             <ReviewModal
//                 isOpen={showReviewModal}
//                 onClose={handleReviewDismiss}
//                 onSubmit={handleReviewSubmit}
//                 hasReviewed={false}
//                 title="Review Your Experience"
//                 description="How was your meal with Edirin Chops?"
//             />
//         </>
//     );
// };

// export default PlaceOrder;





















// import React, { useContext, useState, useEffect } from 'react';
// import Title from '../components/Title';
// import CartTotal from '../components/CartTotal';
// import { assets } from '../assets/assets';
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ReviewModal from '../components/ReviewModal';

// const PlaceOrder = () => {
//     const [method, setMethod] = useState('cod');
//     const { 
//         navigate, 
//         backendUrl, 
//         token, 
//         cartItems, 
//         setCartItems, 
//         getCartAmount, 
//         delivery_fee, 
//         products,
//         addRestaurantReview,
//         getUserRestaurantReview
//     } = useContext(ShopContext);
    
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         street: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         country: '',
//         phone: '',
//     });
    
//     // State for review modal
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [hasUserReviewed, setHasUserReviewed] = useState(true);
//     const [isCheckingReview, setIsCheckingReview] = useState(false);
//     const [pendingOrder, setPendingOrder] = useState(null);
//     const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//     const onChangeHandler = (event) => {
//         const { name, value } = event.target;
//         setFormData((data) => ({ ...data, [name]: value }));
//     };

//     // Check if user has reviewed the restaurant
//     useEffect(() => {
//         const checkUserReview = async () => {
//             if (token) {
//                 setIsCheckingReview(true);
//                 try {
//                     const response = await getUserRestaurantReview();
//                     setHasUserReviewed(!!response.review);
//                 } catch (error) {
//                     console.error("Error checking user review:", error);
//                     setHasUserReviewed(false);
//                 } finally {
//                     setIsCheckingReview(false);
//                 }
//             }
//         };
        
//         checkUserReview();
//     }, [token, getUserRestaurantReview]);

//     const placeOrder = async (orderData) => {
//         setIsPlacingOrder(true);
//         try {
//             switch (method) {
//                 case 'cod':
//                     const response = await axios.post(
//                         backendUrl + '/api/order/place', 
//                         orderData, 
//                         { headers: { token } }
//                     );
//                     if (response.data.success) {
//                         setCartItems({});
//                         navigate('/orders');
//                     } else {
//                         toast.error(response.data.message);
//                     }
//                     break;

//                 case 'paystack':
//                     const responsePaystack = await axios.post(
//                         backendUrl + '/api/order/paystack', 
//                         orderData, 
//                         { headers: { token } }
//                     );
//                     if (responsePaystack.data.success) {
//                         window.location.href = responsePaystack.data.authorization_url;
//                     }
//                     break;

//                 case 'flutterwave':
//                     const responseFlutterwave = await axios.post(
//                         backendUrl + '/api/order/flutterwave', 
//                         orderData, 
//                         { headers: { token } }
//                     );
//                     if (responseFlutterwave.data.success) {
//                         window.location.href = responseFlutterwave.data.link;
//                     }
//                     break;

//                 default:
//                     break;
//             }
//         } catch (error) {
//             console.log(error);
//             toast.error(error.response?.data?.message || error.message);
//         } finally {
//             setIsPlacingOrder(false);
//         }
//     };

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
        
//         // Build order data
//         const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
//             const itemInfo = structuredClone(products.find((product) => product._id === cartItem.productId));
//             if (itemInfo) {
//                 let price = itemInfo.basePrice;
                
//                 if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
//                     price = itemInfo.variations.wrap.price;
//                 } 
//                 else if (cartItem.variations?.size) {
//                     const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
//                     if (sizeObj) price = sizeObj.price;
//                 }
                
//                 return {
//                     ...itemInfo,
//                     quantity: cartItem.quantity,
//                     variations: cartItem.variations,
//                     price
//                 };
//             }
//             return null;
//         }).filter(Boolean);

//         const orderData = {
//             address: formData,
//             items: orderItems,
//             amount: getCartAmount() + delivery_fee,
//         };

//         // If user is logged in and hasn't reviewed, show review modal
//         if (token && !hasUserReviewed) {
//             setPendingOrder(orderData);
//             setShowReviewModal(true);
//             return;
//         }
        
//         placeOrder(orderData);
//     };

//     const handleReviewSubmit = async (rating, comment) => {
//         try {
//             const response = await addRestaurantReview(rating, comment);
//             if (response.success) {
//                 setHasUserReviewed(true);
//                 toast.success("Thanks for your review!");
                
//                 if (pendingOrder) {
//                     placeOrder(pendingOrder);
//                 }
//             } else {
//                 toast.error(response.message || "Failed to submit review");
//             }
//         } catch (error) {
//             console.error("Error submitting review:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setShowReviewModal(false);
//             setPendingOrder(null);
//         }
//     };

//     const handleReviewDismiss = () => {
//         setShowReviewModal(false);
//         if (pendingOrder) {
//             placeOrder(pendingOrder);
//             setPendingOrder(null);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//                 {/* Left Side */}
//                 <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//                     <div className='text-xl sm:text-2xl my-3'>
//                         <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//                     </div>
//                     <div className='flex gap-3'>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='firstName' 
//                             value={formData.firstName} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='First name' 
//                         />
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='lastName' 
//                             value={formData.lastName} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='Last name' 
//                         />
//                     </div>
//                     <input 
//                         required 
//                         onChange={onChangeHandler} 
//                         name='email' 
//                         value={formData.email} 
//                         className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                         type="email" 
//                         placeholder='Email address' 
//                     />
//                     <input 
//                         required 
//                         onChange={onChangeHandler} 
//                         name='street' 
//                         value={formData.street} 
//                         className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                         type="text" 
//                         placeholder='Street' 
//                     />
//                     <div className='flex gap-3'>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='city' 
//                             value={formData.city} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='City' 
//                         />
//                         <input 
//                             onChange={onChangeHandler} 
//                             name='state' 
//                             value={formData.state} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='State' 
//                         />
//                     </div>
//                     <div className='flex gap-3'>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='zipcode' 
//                             value={formData.zipcode} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="number" 
//                             placeholder='Zipcode' 
//                         />
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='country' 
//                             value={formData.country} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='Country' 
//                         />
//                     </div>
//                     <input 
//                         required 
//                         onChange={onChangeHandler} 
//                         name='phone' 
//                         value={formData.phone} 
//                         className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                         type="number" 
//                         placeholder='Phone' 
//                     />
//                 </div>

//                 {/* Right Side */}
//                 <div className='mt-8'>
//                     <div className='mt-8 min-w-80'>
//                         <CartTotal />
//                     </div>
//                     <div className='mt-12'>
//                         <Title text1={'PAYMENT'} text2={'METHOD'} />
//                         <div className='flex gap-3 flex-col lg:flex-row'>
//                             <div onClick={() => setMethod('paystack')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//                                 <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'paystack' ? 'bg-green-400' : ''}`}></div>
//                                 <p className='text-gray-500 text-sm font-medium'>PAYSTACK</p>
//                             </div>
//                             <div onClick={() => setMethod('flutterwave')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//                                 <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'flutterwave' ? 'bg-green-400' : ''}`}></div>
//                                 <p className='text-gray-500 text-sm font-medium'>FLUTTERWAVE</p>
//                             </div>
//                             <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//                                 <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></div>
//                                 <p className='text-gray-500 text-sm font-medium'>CASH ON DELIVERY</p>
//                             </div>
//                         </div>
//                         <div className='w-full text-end mt-8'>
//                             <button 
//                                 type='submit' 
//                                 disabled={isPlacingOrder || isCheckingReview}
//                                 className={`border border-white text-white px-8 py-4 text-sm transition-all duration-500 bg-[#333333] ${
//                                     isPlacingOrder || isCheckingReview 
//                                         ? 'opacity-50 cursor-not-allowed' 
//                                         : 'hover:bg-black hover:text-white'
//                                 }`}
//                             >
//                                 {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
            
//             {/* Review Modal */}
//             <ReviewModal
//                 isOpen={showReviewModal}
//                 onClose={handleReviewDismiss}
//                 onSubmit={handleReviewSubmit}
//                 hasReviewed={false}
//                 title="Review Your Experience"
//                 description="How was your meal with Edirin Chops?"
//             />
//         </>
//     );
// };

// export default PlaceOrder;






















// before p and f




// import React, { useContext, useState, useEffect } from 'react';
// import Title from '../components/Title';
// import CartTotal from '../components/CartTotal';
// import { assets } from '../assets/assets';
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import ReviewModal from '../components/ReviewModal';

// const PlaceOrder = () => {
//     const [method, setMethod] = useState('cod');
//     const { 
//         navigate, 
//         backendUrl, 
//         token, 
//         cartItems, 
//         setCartItems, 
//         getCartAmount, 
//         delivery_fee, 
//         products,
//         addRestaurantReview,
//         getUserRestaurantReview
//     } = useContext(ShopContext);
    
//     const [formData, setFormData] = useState({
//         firstName: '',
//         lastName: '',
//         email: '',
//         street: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         country: '',
//         phone: '',
//     });
    
//     // State for review modal
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [hasUserReviewed, setHasUserReviewed] = useState(true);
//     const [isCheckingReview, setIsCheckingReview] = useState(false);
//     const [pendingOrder, setPendingOrder] = useState(null);
//     const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//     const onChangeHandler = (event) => {
//         const { name, value } = event.target;
//         setFormData((data) => ({ ...data, [name]: value }));
//     };

//     // Check if user has reviewed the restaurant
//     useEffect(() => {
//         const checkUserReview = async () => {
//             if (token) {
//                 setIsCheckingReview(true);
//                 try {
//                     const response = await getUserRestaurantReview();
//                     setHasUserReviewed(!!response.review);
//                 } catch (error) {
//                     console.error("Error checking user review:", error);
//                     // Assume they haven't reviewed if there's an error
//                     setHasUserReviewed(false);
//                 } finally {
//                     setIsCheckingReview(false);
//                 }
//             }
//         };
        
//         checkUserReview();
//     }, [token, getUserRestaurantReview]);

//     const initPay = (order) => {
//         const options = {
//             key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//             amount: order.amount,
//             currency: order.currency,
//             name: 'Order Payment',
//             description: 'Order Payment',
//             order_id: order.id,
//             receipt: order.receipt,
//             handler: async (response) => {
//                 try {
//                     const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, { headers: { token } });
//                     if (data.success) {
//                         navigate('/orders');
//                         setCartItems({});
//                     }
//                 } catch (error) {
//                     console.log(error);
//                     toast.error(error.message);
//                 }
//             },
//         };
//         const rzp = new window.Razorpay(options);
//         rzp.open();
//     };

//     const placeOrder = async (orderData) => {
//         setIsPlacingOrder(true);
//         try {
//             switch (method) {
//                 case 'cod':
//                     const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
//                     if (response.data.success) {
//                         setCartItems({});
//                         navigate('/orders');
//                     } else {
//                         toast.error(response.data.message);
//                     }
//                     break;

//                 case 'stripe':
//                     const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
//                     if (responseStripe.data.success) {
//                         const { session_url } = responseStripe.data;
//                         window.location.replace(session_url);
//                     } else {
//                         toast.error(responseStripe.data.message);
//                     }
//                     break;

//                 case 'razorpay':
//                     const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } });
//                     if (responseRazorpay.data.success) {
//                         initPay(responseRazorpay.data.order);
//                     }
//                     break;

//                 default:
//                     break;
//             }
//         } catch (error) {
//             console.log(error);
//             toast.error(error.message);
//         } finally {
//             setIsPlacingOrder(false);
//         }
//     };

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
        
//         // Build order data
//         const orderItems = Object.entries(cartItems).map(([cartItemKey, cartItem]) => {
//             const itemInfo = structuredClone(products.find((product) => product._id === cartItem.productId));
//             if (itemInfo) {
//                 // Calculate price based on variations
//                 let price = itemInfo.basePrice;
                
//                 if (cartItem.variations?.wrap && itemInfo.variations?.wrap?.available) {
//                     price = itemInfo.variations.wrap.price;
//                 } 
//                 else if (cartItem.variations?.size) {
//                     const sizeObj = itemInfo.variations?.sizes?.find(s => s.size === cartItem.variations.size);
//                     if (sizeObj) price = sizeObj.price;
//                 }
                
//                 return {
//                     ...itemInfo,
//                     quantity: cartItem.quantity,
//                     variations: cartItem.variations,
//                     price // Override with calculated price
//                 };
//             }
//             return null;
//         }).filter(Boolean);

//         const orderData = {
//             address: formData,
//             items: orderItems,
//             amount: getCartAmount() + delivery_fee,
//         };

//         // If user is logged in and hasn't reviewed, show review modal
//         if (token && !hasUserReviewed) {
//             setPendingOrder(orderData);
//             setShowReviewModal(true);
//             return;
//         }
        
//         // Otherwise place order immediately
//         placeOrder(orderData);
//     };

//     const handleReviewSubmit = async (rating, comment) => {
//         try {
//             const response = await addRestaurantReview(rating, comment);
//             if (response.success) {
//                 setHasUserReviewed(true);
//                 toast.success("Thanks for your review!");
                
//                 // Place pending order after review
//                 if (pendingOrder) {
//                     placeOrder(pendingOrder);
//                 }
//             } else {
//                 toast.error(response.message || "Failed to submit review");
//             }
//         } catch (error) {
//             console.error("Error submitting review:", error);
//             toast.error("Failed to submit review");
//         } finally {
//             setShowReviewModal(false);
//             setPendingOrder(null);
//         }
//     };

//     const handleReviewDismiss = () => {
//         setShowReviewModal(false);
//         // Place order if user dismisses the modal
//         if (pendingOrder) {
//             placeOrder(pendingOrder);
//             setPendingOrder(null);
//         }
//     };

//     return (
//         <>
//             <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//                 {/* Left Side */}
//                 <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//                     <div className='text-xl sm:text-2xl my-3'>
//                         <Title text1={'DELIVERY'} text2={'INFORMATION'} />
//                     </div>
//                     <div className='flex gap-3'>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='firstName' 
//                             value={formData.firstName} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='First name' 
//                         />
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='lastName' 
//                             value={formData.lastName} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='Last name' 
//                         />
//                     </div>
//                     <input 
//                         required 
//                         onChange={onChangeHandler} 
//                         name='email' 
//                         value={formData.email} 
//                         className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                         type="email" 
//                         placeholder='Email address' 
//                     />
//                     <input 
//                         required 
//                         onChange={onChangeHandler} 
//                         name='street' 
//                         value={formData.street} 
//                         className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                         type="text" 
//                         placeholder='Street' 
//                     />
//                     <div className='flex gap-3'>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='city' 
//                             value={formData.city} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='City' 
//                         />
//                         <input 
//                             onChange={onChangeHandler} 
//                             name='state' 
//                             value={formData.state} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='State' 
//                         />
//                     </div>
//                     <div className='flex gap-3'>
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='zipcode' 
//                             value={formData.zipcode} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="number" 
//                             placeholder='Zipcode' 
//                         />
//                         <input 
//                             required 
//                             onChange={onChangeHandler} 
//                             name='country' 
//                             value={formData.country} 
//                             className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                             type="text" 
//                             placeholder='Country' 
//                         />
//                     </div>
//                     <input 
//                         required 
//                         onChange={onChangeHandler} 
//                         name='phone' 
//                         value={formData.phone} 
//                         className='border border-gray-300 rounded py-1.5 px-3.5 w-full text-black' 
//                         type="number" 
//                         placeholder='Phone' 
//                     />
//                 </div>

//                 {/* Right Side */}
//                 <div className='mt-8'>
//                     <div className='mt-8 min-w-80'>
//                         <CartTotal />
//                     </div>
//                     <div className='mt-12'>
//                         <Title text1={'PAYMENT'} text2={'METHOD'} />
//                         <div className='flex gap-3 flex-col lg:flex-row'>
//                             <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//                                 <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
//                                 <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
//                             </div>
//                             <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//                                 <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
//                                 <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
//                             </div>
//                         </div>
//                         <div className='w-full text-end mt-8'>
//                             <button 
//                                 type='submit' 
//                                 disabled={isPlacingOrder || isCheckingReview}
//                                 className={`border border-white text-white px-8 py-4 text-sm transition-all duration-500 bg-[#333333] ${
//                                     isPlacingOrder || isCheckingReview 
//                                         ? 'opacity-50 cursor-not-allowed' 
//                                         : 'hover:bg-black hover:text-white'
//                                 }`}
//                             >
//                                 {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </form>
            
//             {/* Review Modal */}
//             <ReviewModal
//                 isOpen={showReviewModal}
//                 onClose={handleReviewDismiss}
//                 onSubmit={handleReviewSubmit}
//                 hasReviewed={false}
//                 title="Review Your Experience"
//                 description="How was your meal with Edirin Chops?"
//             />
//         </>
//     );
// };

// export default PlaceOrder;


