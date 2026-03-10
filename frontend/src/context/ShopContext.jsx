import { createContext, useContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

// Create the custom hook for accessing context
export const useShopContext = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShopContext must be used within a ShopContextProvider');
  }
  return context;
};

const ShopContextProvider = (props) => {
  const currency = "€";
  const delivery_fee = 1.5;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Payment status tracking
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  // Popup state
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const popupMessageRef = useRef("");

  // Keep ref updated
  useEffect(() => {
    popupMessageRef.current = popupMessage;
  }, [popupMessage]);

  // Fetch popup message
  const fetchPopup = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/popup");
      if (response.data.popup) {
        setPopupMessage(response.data.popup);

        // Check if user has dismissed this message
        const dismissedPopup = localStorage.getItem("dismissedPopup");
        if (dismissedPopup !== response.data.popup) {
          setShowPopup(true);
        }
      }
    } catch (error) {
      console.log("Error fetching popup:", error);
    }
  };

  const dismissPopup = () => {
    setShowPopup(false);
    localStorage.setItem("dismissedPopup", popupMessageRef.current);
  };

  // Updated addToCart function with variations and stock check
  const addToCart = async (itemId, quantity = 1, variations = {}) => {
    const product = products.find((item) => item._id === itemId);
    
    if (!product || !product.inStock) {
      toast.error("This product is out of stock");
      return null;
    }
    
    // Create a unique key for this combination of variations
    const variationKey = JSON.stringify(variations);
    const cartItemKey = `${itemId}-${variationKey}`;

    let cartData = structuredClone(cartItems);
    
    if (cartData[cartItemKey]) {
      const newQuantity = cartData[cartItemKey].quantity + quantity;
      
      // Check stock availability
      if (product.stock && newQuantity > product.stock) {
        toast.error(`Only ${product.stock} available in stock`);
        return null;
      }
      
      cartData[cartItemKey] = {
        ...cartData[cartItemKey],
        quantity: newQuantity
      };
    } else {
      // Check stock availability
      if (product.stock && quantity > product.stock) {
        toast.error(`Only ${product.stock} available in stock`);
        return null;
      }
      
      cartData[cartItemKey] = {
        productId: itemId,
        quantity,
        variations
      };
    }
    
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { 
            itemId, 
            quantity,
            variations
          },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

    return product;
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + item.quantity,
      0
    );
  };

  const updateQuantity = async (cartItemKey, quantity) => {
    let cartData = structuredClone(cartItems);
    
    if (!cartData[cartItemKey]) return;

    // Get product for stock check
    const item = cartData[cartItemKey];
    const product = products.find(p => p._id === item.productId);
    
    if (product?.stock && quantity > product.stock) {
      toast.error(`Only ${product.stock} available in stock`);
      return;
    }

    if (quantity > 0) {
      cartData[cartItemKey] = {
        ...cartData[cartItemKey],
        quantity
      };
    } else {
      delete cartData[cartItemKey];
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { 
            cartItemKey, 
            quantity 
          },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // Robust cart amount calculation with variation handling
  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [cartItemKey, item]) => {
      const product = products.find(p => p._id === item.productId);
      if (!product || !product.inStock) return total;
      
      // Calculate price based on variations
      let price = product.basePrice;
      
      if (item.variations?.wrap && product.variations?.wrap?.available) {
        price = product.variations.wrap.price;
      } 
      else if (item.variations?.size) {
        const sizeObj = product.variations?.sizes?.find(s => s.size === item.variations.size);
        if (sizeObj) price = sizeObj.price;
      }
      
      return total + price * item.quantity;
    }, 0);
  };

  const getProductsData = async () => {
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
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
    fetchPopup();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  // Add product review
  const addReview = async (productId, rating, comment) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/review",
        { productId, rating, comment },
        { headers: { token } }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
      return { success: false };
    }
  };

  // Get product reviews
  const getReviews = async (productId) => {
    try {
      const response = await axios.get(
        backendUrl + `/api/review/product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return { success: false, reviews: [] };
    }
  };

  // Get user's product review
  const getUserReview = async (productId) => {
    try {
      const response = await axios.get(
        backendUrl + `/api/review/user/${productId}`,
        { headers: { token } }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return { success: false, review: null };
    }
  };

  const getAvailableProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/available");
      if (response.data.success) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Add restaurant review
  const addRestaurantReview = async (rating, comment) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/restaurant-review',
        { rating, comment },
        { headers: { token } }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
      return { success: false };
    }
  };

  // Get restaurant reviews
  const getRestaurantReviews = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/restaurant-review');
      return response.data;
    } catch (error) {
      console.log(error);
      return { success: false, reviews: [] };
    }
  };

  // Get user's restaurant review
  const getUserRestaurantReview = async () => {
    try {
      const response = await axios.get(
        backendUrl + '/api/restaurant-review/user',
        { headers: { token } }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return { success: false, review: null };
    }
  };

  // Clear cart after successful payment
  const clearCart = async () => {
    setCartItems({});
    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/clear",
          {},
          { headers: { token } }
        );
      } catch (error) {
        console.log("Error clearing cart:", error);
      }
    }
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    popupMessage,
    showPopup,
    setShowPopup,
    dismissPopup,
    fetchPopup,
    addReview,
    getReviews,
    getUserReview,
    getAvailableProducts,
    addRestaurantReview,
    getRestaurantReviews,
    getUserRestaurantReview,
    paymentStatus,
    setPaymentStatus,
    clearCart
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;

















// import { createContext, useEffect, useState, useRef } from "react";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   const currency = "€";
//   const delivery_fee = 1.5;
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [search, setSearch] = useState("");
//   const [showSearch, setShowSearch] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const [products, setProducts] = useState([]);
//   const [token, setToken] = useState("");
//   const navigate = useNavigate();

//   // Payment status tracking
//   const [paymentStatus, setPaymentStatus] = useState(null);
  
//   // Popup state
//   const [popupMessage, setPopupMessage] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const popupMessageRef = useRef("");

//   // Keep ref updated
//   useEffect(() => {
//     popupMessageRef.current = popupMessage;
//   }, [popupMessage]);

//   // Fetch popup message
//   const fetchPopup = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/popup");
//       if (response.data.popup) {
//         setPopupMessage(response.data.popup);

//         // Check if user has dismissed this message
//         const dismissedPopup = localStorage.getItem("dismissedPopup");
//         if (dismissedPopup !== response.data.popup) {
//           setShowPopup(true);
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching popup:", error);
//     }
//   };

//   const dismissPopup = () => {
//     setShowPopup(false);
//     localStorage.setItem("dismissedPopup", popupMessageRef.current);
//   };

//   // Updated addToCart function with variations and stock check
//   const addToCart = async (itemId, quantity = 1, variations = {}) => {
//     const product = products.find((item) => item._id === itemId);
    
//     if (!product || !product.inStock) {
//       toast.error("This product is out of stock");
//       return null;
//     }
    
//     // Create a unique key for this combination of variations
//     const variationKey = JSON.stringify(variations);
//     const cartItemKey = `${itemId}-${variationKey}`;

//     let cartData = structuredClone(cartItems);
    
//     if (cartData[cartItemKey]) {
//       const newQuantity = cartData[cartItemKey].quantity + quantity;
      
//       // Check stock availability
//       if (product.stock && newQuantity > product.stock) {
//         toast.error(`Only ${product.stock} available in stock`);
//         return null;
//       }
      
//       cartData[cartItemKey] = {
//         ...cartData[cartItemKey],
//         quantity: newQuantity
//       };
//     } else {
//       // Check stock availability
//       if (product.stock && quantity > product.stock) {
//         toast.error(`Only ${product.stock} available in stock`);
//         return null;
//       }
      
//       cartData[cartItemKey] = {
//         productId: itemId,
//         quantity,
//         variations
//       };
//     }
    
//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/add",
//           { 
//             itemId, 
//             quantity,
//             variations
//           },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }

//     return product;
//   };

//   const getCartCount = () => {
//     return Object.values(cartItems).reduce(
//       (total, item) => total + item.quantity,
//       0
//     );
//   };

//   const updateQuantity = async (cartItemKey, quantity) => {
//     let cartData = structuredClone(cartItems);
    
//     if (!cartData[cartItemKey]) return;

//     // Get product for stock check
//     const item = cartData[cartItemKey];
//     const product = products.find(p => p._id === item.productId);
    
//     if (product?.stock && quantity > product.stock) {
//       toast.error(`Only ${product.stock} available in stock`);
//       return;
//     }

//     if (quantity > 0) {
//       cartData[cartItemKey] = {
//         ...cartData[cartItemKey],
//         quantity
//       };
//     } else {
//       delete cartData[cartItemKey];
//     }

//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/update",
//           { 
//             cartItemKey, 
//             quantity 
//           },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }
//   };

//   // Robust cart amount calculation with variation handling
//   const getCartAmount = () => {
//     return Object.entries(cartItems).reduce((total, [cartItemKey, item]) => {
//       const product = products.find(p => p._id === item.productId);
//       if (!product || !product.inStock) return total;
      
//       // Calculate price based on variations
//       let price = product.basePrice;
      
//       if (item.variations?.wrap && product.variations?.wrap?.available) {
//         price = product.variations.wrap.price;
//       } 
//       else if (item.variations?.size) {
//         const sizeObj = product.variations?.sizes?.find(s => s.size === item.variations.size);
//         if (sizeObj) price = sizeObj.price;
//       }
      
//       return total + price * item.quantity;
//     }, 0);
//   };

//   const getProductsData = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/list");
//       if (response.data.success) {
//         setProducts(response.data.products.reverse());
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const getUserCart = async (token) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/cart/get",
//         {},
//         { headers: { token } }
//       );
//       if (response.data.success) {
//         setCartItems(response.data.cartData);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     getProductsData();
//     fetchPopup();
//   }, []);

//   useEffect(() => {
//     if (!token && localStorage.getItem("token")) {
//       setToken(localStorage.getItem("token"));
//       getUserCart(localStorage.getItem("token"));
//     }
//     if (token) {
//       getUserCart(token);
//     }
//   }, [token]);

//   // Add product review
//   const addReview = async (productId, rating, comment) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/review",
//         { productId, rating, comment },
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || error.message);
//       return { success: false };
//     }
//   };

//   // Get product reviews
//   const getReviews = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/product/${productId}`
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, reviews: [] };
//     }
//   };

//   // Get user's product review
//   const getUserReview = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/user/${productId}`,
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, review: null };
//     }
//   };

//   const getAvailableProducts = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/available");
//       if (response.data.success) {
//         return response.data.products;
//       }
//       return [];
//     } catch (error) {
//       console.log(error);
//       return [];
//     }
//   };

//   // Add restaurant review
//   const addRestaurantReview = async (rating, comment) => {
//     try {
//       const response = await axios.post(
//         backendUrl + '/api/restaurant-review',
//         { rating, comment },
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || error.message);
//       return { success: false };
//     }
//   };

//   // Get restaurant reviews
//   const getRestaurantReviews = async () => {
//     try {
//       const response = await axios.get(backendUrl + '/api/restaurant-review');
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, reviews: [] };
//     }
//   };

//   // Get user's restaurant review
//   const getUserRestaurantReview = async () => {
//     try {
//       const response = await axios.get(
//         backendUrl + '/api/restaurant-review/user',
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, review: null };
//     }
//   };

//   // Clear cart after successful payment
//   const clearCart = async () => {
//     setCartItems({});
//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/clear",
//           {},
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log("Error clearing cart:", error);
//       }
//     }
//   };

//   const value = {
//     products,
//     currency,
//     delivery_fee,
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     cartItems,
//     addToCart,
//     setCartItems,
//     getCartCount,
//     updateQuantity,
//     getCartAmount,
//     navigate,
//     backendUrl,
//     setToken,
//     token,
//     popupMessage,
//     showPopup,
//     setShowPopup,
//     dismissPopup,
//     fetchPopup,
//     addReview,
//     getReviews,
//     getUserReview,
//     getAvailableProducts,
//     addRestaurantReview,
//     getRestaurantReviews,
//     getUserRestaurantReview,
//     paymentStatus,
//     setPaymentStatus,
//     clearCart
//   };

//   return (
//     <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;






























// import { createContext, useEffect, useState, useRef } from "react";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   const currency = "€";
//   const delivery_fee = 1.5;
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [search, setSearch] = useState("");
//   const [showSearch, setShowSearch] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const [products, setProducts] = useState([]);
//   const [token, setToken] = useState("");
//   const navigate = useNavigate();

//   // Popup state
//   const [popupMessage, setPopupMessage] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const popupMessageRef = useRef(""); // Ref to track current popup message

//   // Keep ref updated
//   useEffect(() => {
//     popupMessageRef.current = popupMessage;
//   }, [popupMessage]);

//   // Fetch popup message
//   const fetchPopup = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/popup");
//       if (response.data.popup) {
//         setPopupMessage(response.data.popup);

//         // Check if user has dismissed this message
//         const dismissedPopup = localStorage.getItem("dismissedPopup");
//         if (dismissedPopup !== response.data.popup) {
//           setShowPopup(true);
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching popup:", error);
//     }
//   };

//   const dismissPopup = () => {
//     setShowPopup(false);
//     localStorage.setItem("dismissedPopup", popupMessageRef.current);
//   };

//   // Updated addToCart function with variations
//   const addToCart = async (itemId, quantity = 1, variations = {}) => {
//     // Find the product to get its name
//     const product = products.find((item) => item._id === itemId);
    
//     if (!product || !product.inStock) {
//       toast.error("This product is out of stock");
//       return null;
//     }
    
//     // Create a unique key for this combination of variations
//     const variationKey = JSON.stringify(variations);
//     const cartItemKey = `${itemId}-${variationKey}`;

//     let cartData = structuredClone(cartItems);
    
//     if (cartData[cartItemKey]) {
//       cartData[cartItemKey] = {
//         ...cartData[cartItemKey],
//         quantity: cartData[cartItemKey].quantity + quantity
//       };
//     } else {
//       cartData[cartItemKey] = {
//         productId: itemId,
//         quantity,
//         variations
//       };
//     }
    
//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/add",
//           { 
//             itemId, 
//             quantity,
//             variations
//           },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }

//     // Return product for toast notification
//     return product;
//   };

//   const getCartCount = () => {
//     return Object.values(cartItems).reduce(
//       (total, item) => total + item.quantity,
//       0
//     );
//   };

//   const updateQuantity = async (cartItemKey, quantity) => {
//     let cartData = structuredClone(cartItems);
    
//     if (!cartData[cartItemKey]) return;

//     if (quantity > 0) {
//       cartData[cartItemKey] = {
//         ...cartData[cartItemKey],
//         quantity
//       };
//     } else {
//       delete cartData[cartItemKey];
//     }

//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/update",
//           { 
//             cartItemKey, 
//             quantity 
//           },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }
//   };

//   const getCartAmount = () => {
//     return Object.entries(cartItems).reduce((total, [cartItemKey, item]) => {
//       const product = products.find(p => p._id === item.productId);
//       if (!product) return total;
      
//       // Calculate price based on variations
//       let price = product.basePrice;
      
//       if (item.variations.wrap && product.variations?.wrap?.available) {
//         price = product.variations.wrap.price;
//       } 
//       else if (item.variations.size) {
//         const sizeObj = product.variations?.sizes?.find(s => s.size === item.variations.size);
//         if (sizeObj) price = sizeObj.price;
//       }
      
//       return total + price * item.quantity;
//     }, 0);
//   };

//   const getProductsData = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/list");
//       if (response.data.success) {
//         setProducts(response.data.products.reverse());
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const getUserCart = async (token) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/cart/get",
//         {},
//         { headers: { token } }
//       );
//       if (response.data.success) {
//         setCartItems(response.data.cartData);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     getProductsData();
//     fetchPopup();
//   }, []);

//   useEffect(() => {
//     if (!token && localStorage.getItem("token")) {
//       setToken(localStorage.getItem("token"));
//       getUserCart(localStorage.getItem("token"));
//     }
//     if (token) {
//       getUserCart(token);
//     }
//   }, [token]);

//   // Add review function
//   const addReview = async (productId, rating, comment) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/review",
//         { productId, rating, comment },
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || error.message);
//       return { success: false };
//     }
//   };

//   // Get reviews function
//   const getReviews = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/product/${productId}`
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, reviews: [] };
//     }
//   };

//   // Get user review function
//   const getUserReview = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/user/${productId}`,
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, review: null };
//     }
//   };

//   const getAvailableProducts = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/available");
//       if (response.data.success) {
//         return response.data.products;
//       }
//       return [];
//     } catch (error) {
//       console.log(error);
//       return [];
//     }
//   };

//   // Add to ShopContextProvider
// const addRestaurantReview = async (rating, comment) => {
//   try {
//     const response = await axios.post(
//       backendUrl + '/api/restaurant-review',
//       { rating, comment },
//       { headers: { token } }
//     );
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     toast.error(error.response?.data?.message || error.message);
//     return { success: false };
//   }
// };

// const getRestaurantReviews = async () => {
//   try {
//     const response = await axios.get(backendUrl + '/api/restaurant-review');
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     return { success: false, reviews: [] };
//   }
// };

// const getUserRestaurantReview = async () => {
//   try {
//     const response = await axios.get(
//       backendUrl + '/api/restaurant-review/user',
//       { headers: { token } }
//     );
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     return { success: false, review: null };
//   }
// };

//   const value = {
//     products,
//     currency,
//     delivery_fee,
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     cartItems,
//     addToCart,
//     setCartItems,
//     getCartCount,
//     updateQuantity,
//     getCartAmount,
//     navigate,
//     backendUrl,
//     setToken,
//     token,
//     popupMessage,
//     showPopup,
//     setShowPopup,
//     dismissPopup,
//     fetchPopup,
//     addReview,
//     getReviews,
//     getUserReview,
//     getAvailableProducts,
//   addRestaurantReview,
//   getRestaurantReviews,
//   getUserRestaurantReview
//   };

//   return (
//     <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;



















// import { createContext, useEffect, useState, useRef } from "react";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   const currency = "€";
//   const delivery_fee = 10;
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [search, setSearch] = useState("");
//   const [showSearch, setShowSearch] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const [products, setProducts] = useState([]);
//   const [token, setToken] = useState("");
//   const navigate = useNavigate();

//   // Popup state
//   const [popupMessage, setPopupMessage] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const popupMessageRef = useRef(""); // Ref to track current popup message

//   // Keep ref updated
//   useEffect(() => {
//     popupMessageRef.current = popupMessage;
//   }, [popupMessage]);

//   // Fetch popup message
//   const fetchPopup = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/popup");
//       if (response.data.popup) {
//         setPopupMessage(response.data.popup);

//         // Check if user has dismissed this message
//         const dismissedPopup = localStorage.getItem("dismissedPopup");
//         if (dismissedPopup !== response.data.popup) {
//           setShowPopup(true);
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching popup:", error);
//     }
//   };

//   const dismissPopup = () => {
//     setShowPopup(false);
//     localStorage.setItem("dismissedPopup", popupMessageRef.current);
//   };

//   // Updated addToCart function with variations
//   const addToCart = async (itemId, quantity = 1, variations = {}) => {
//     // Find the product to get its name
//     const product = products.find((item) => item._id === itemId);
    
//     if (!product || !product.inStock) {
//       toast.error("This product is out of stock");
//       return null;
//     }
    
//     // Create a unique key for this combination of variations
//     const variationKey = JSON.stringify(variations);
//     const cartItemKey = `${itemId}-${variationKey}`;

//     let cartData = structuredClone(cartItems);
    
//     if (cartData[cartItemKey]) {
//       cartData[cartItemKey] = {
//         ...cartData[cartItemKey],
//         quantity: cartData[cartItemKey].quantity + quantity
//       };
//     } else {
//       cartData[cartItemKey] = {
//         productId: itemId,
//         quantity,
//         variations
//       };
//     }
    
//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/add",
//           { 
//             itemId, 
//             quantity,
//             variations
//           },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }

//     // Return product for toast notification
//     return product;
//   };

//   const getCartCount = () => {
//     return Object.values(cartItems).reduce(
//       (total, item) => total + item.quantity,
//       0
//     );
//   };

//   const updateQuantity = async (cartItemKey, quantity) => {
//     let cartData = structuredClone(cartItems);
    
//     if (!cartData[cartItemKey]) return;

//     if (quantity > 0) {
//       cartData[cartItemKey] = {
//         ...cartData[cartItemKey],
//         quantity
//       };
//     } else {
//       delete cartData[cartItemKey];
//     }

//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/update",
//           { 
//             cartItemKey, 
//             quantity 
//           },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }
//   };

//   const getCartAmount = () => {
//     return Object.entries(cartItems).reduce((total, [cartItemKey, item]) => {
//       const product = products.find(p => p._id === item.productId);
//       if (!product) return total;
      
//       // Calculate price based on variations
//       let price = product.basePrice;
      
//       if (item.variations.wrap && product.variations?.wrap?.available) {
//         price = product.variations.wrap.price;
//       } 
//       else if (item.variations.size) {
//         const sizeObj = product.variations?.sizes?.find(s => s.size === item.variations.size);
//         if (sizeObj) price = sizeObj.price;
//       }
      
//       return total + price * item.quantity;
//     }, 0);
//   };

//   const getProductsData = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/list");
//       if (response.data.success) {
//         setProducts(response.data.products.reverse());
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const getUserCart = async (token) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/cart/get",
//         {},
//         { headers: { token } }
//       );
//       if (response.data.success) {
//         setCartItems(response.data.cartData);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     getProductsData();
//     fetchPopup();
//   }, []);

//   useEffect(() => {
//     if (!token && localStorage.getItem("token")) {
//       setToken(localStorage.getItem("token"));
//       getUserCart(localStorage.getItem("token"));
//     }
//     if (token) {
//       getUserCart(token);
//     }
//   }, [token]);

//   // Add review function
//   const addReview = async (productId, rating, comment) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/review",
//         { productId, rating, comment },
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || error.message);
//       return { success: false };
//     }
//   };

//   // Get reviews function
//   const getReviews = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/product/${productId}`
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, reviews: [] };
//     }
//   };

//   // Get user review function
//   const getUserReview = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/user/${productId}`,
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, review: null };
//     }
//   };

//   const getAvailableProducts = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/available");
//       if (response.data.success) {
//         return response.data.products;
//       }
//       return [];
//     } catch (error) {
//       console.log(error);
//       return [];
//     }
//   };

//   const value = {
//     products,
//     currency,
//     delivery_fee,
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     cartItems,
//     addToCart,
//     setCartItems,
//     getCartCount,
//     updateQuantity,
//     getCartAmount,
//     navigate,
//     backendUrl,
//     setToken,
//     token,
//     popupMessage,
//     showPopup,
//     setShowPopup,
//     dismissPopup,
//     fetchPopup,
//     addReview,
//     getReviews,
//     getUserReview,
//     getAvailableProducts,
//   };

//   return (
//     <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;

















// import { createContext, useEffect, useState, useRef } from "react";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   // const currency = "₦";
//   const currency = "€";
//   const delivery_fee = 10;
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [search, setSearch] = useState("");
//   const [showSearch, setShowSearch] = useState(false);
//   const [cartItems, setCartItems] = useState({});
//   const [products, setProducts] = useState([]);
//   const [token, setToken] = useState("");
//   const navigate = useNavigate();

//   // Popup state
//   const [popupMessage, setPopupMessage] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const popupMessageRef = useRef(""); // Ref to track current popup message

//   // Keep ref updated
//   useEffect(() => {
//     popupMessageRef.current = popupMessage;
//   }, [popupMessage]);

//   // Fetch popup message
//   const fetchPopup = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/popup");
//       if (response.data.popup) {
//         setPopupMessage(response.data.popup);

//         // Check if user has dismissed this message
//         const dismissedPopup = localStorage.getItem("dismissedPopup");
//         if (dismissedPopup !== response.data.popup) {
//           setShowPopup(true);
//         }
//       }
//     } catch (error) {
//       console.log("Error fetching popup:", error);
//     }
//   };

//   const dismissPopup = () => {
//     setShowPopup(false);
//     localStorage.setItem("dismissedPopup", popupMessageRef.current);
//   };

//   const addToCart = async (itemId, quantity = 1) => {
//     // Find the product to get its name
//     const product = products.find((item) => item._id === itemId);

//     let cartData = structuredClone(cartItems);
//     if (cartData[itemId]) {
//       cartData[itemId] += quantity;
//     } else {
//       cartData[itemId] = quantity;
//     }
//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/add",
//           { itemId },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }

//     // Return product for toast notification
//     return product;
//   };

//   const getCartCount = () => {
//     return Object.values(cartItems).reduce(
//       (total, quantity) => total + quantity,
//       0
//     );
//   };

//   const updateQuantity = async (itemId, quantity) => {
//     let cartData = structuredClone(cartItems);

//     if (quantity > 0) {
//       cartData[itemId] = quantity;
//     } else {
//       delete cartData[itemId];
//     }

//     setCartItems(cartData);

//     if (token) {
//       try {
//         await axios.post(
//           backendUrl + "/api/cart/update",
//           { itemId, quantity },
//           { headers: { token } }
//         );
//       } catch (error) {
//         console.log(error);
//         toast.error(error.message);
//       }
//     }
//   };

//   const getCartAmount = () => {
//     return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
//       const itemInfo = products.find((product) => product._id === itemId);
//       return total + (itemInfo?.price || 0) * quantity;
//     }, 0);
//   };

//   const getProductsData = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/list");
//       if (response.data.success) {
//         setProducts(response.data.products.reverse());
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const getUserCart = async (token) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/cart/get",
//         {},
//         { headers: { token } }
//       );
//       if (response.data.success) {
//         setCartItems(response.data.cartData);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     getProductsData();
//   }, []);

//   useEffect(() => {
//     if (!token && localStorage.getItem("token")) {
//       setToken(localStorage.getItem("token"));
//       getUserCart(localStorage.getItem("token"));
//     }
//     if (token) {
//       getUserCart(token);
//     }
//   }, [token]);

//   // Add these functions to the ShopContextProvider

//   // Add review function
//   const addReview = async (productId, rating, comment) => {
//     try {
//       const response = await axios.post(
//         backendUrl + "/api/review",
//         { productId, rating, comment },
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       toast.error(error.response?.data?.message || error.message);
//       return { success: false };
//     }
//   };

//   // Get reviews function
//   const getReviews = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/product/${productId}`
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, reviews: [] };
//     }
//   };

//   // Get user review function
//   const getUserReview = async (productId) => {
//     try {
//       const response = await axios.get(
//         backendUrl + `/api/review/user/${productId}`,
//         { headers: { token } }
//       );
//       return response.data;
//     } catch (error) {
//       console.log(error);
//       return { success: false, review: null };
//     }
//   };

//   // Add this function to your ShopContext
//   const getAvailableProducts = async () => {
//     try {
//       const response = await axios.get(backendUrl + "/api/product/available");
//       if (response.data.success) {
//         return response.data.products;
//       }
//       return [];
//     } catch (error) {
//       console.log(error);
//       return [];
//     }
//   };

//   const value = {
//     products,
//     currency,
//     delivery_fee,
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     cartItems,
//     addToCart,
//     setCartItems,
//     getCartCount,
//     updateQuantity,
//     getCartAmount,
//     navigate,
//     backendUrl,
//     setToken,
//     token,
//     popupMessage,
//     showPopup,
//     setShowPopup,
//     dismissPopup,
//     fetchPopup,
//     addReview,
//     getReviews,
//     getUserReview,
//     getAvailableProducts,
//   };

//   return (
//     <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;

