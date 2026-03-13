import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import { ShopContext } from "./context/ShopContext";
import VerifyPayment from "./pages/VerifyPayment";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import UploadPhoto from "./pages/UploadPhoto";
import MySales from "./pages/MySales";
import MyPurchases from "./pages/MyPurchases";
import Favorites from "./pages/Favorites";
import FundAccount from "./pages/FundAccount";
import ImageDetail from "./pages/ImageDetail";
import UploaderProfile from "./pages/UploaderProfile";
import Photographers from "./pages/Photographers";
import Explore from "./pages/Explore";

const App = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            backgroundColor: "#d97706",
            color: "white",
            borderRadius: "8px",
          }}
        />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Collection />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/shop" element={<Collection />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify" element={<VerifyPayment />} />

          {/* Profile Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/upload-photo" element={<UploadPhoto />} />
          <Route path="/my-sales" element={<MySales />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/fund-account" element={<FundAccount />} />

          {/* Image Routes */}
          <Route path="/image/:imageId" element={<ImageDetail />} />
          <Route path="/uploader/:uploaderId" element={<UploaderProfile />} />
          <Route path="/user/:uploaderId" element={<UploaderProfile />} />
          <Route path="/photographers" element={<Photographers />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
};

export default App;

// import React, { useContext, useEffect } from "react";
// import { Routes, Route, useLocation } from "react-router-dom";
// import Home from "./pages/Home";
// import Collection from "./pages/Collection";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Login from "./pages/Login";
// import PlaceOrder from "./pages/PlaceOrder";
// import Orders from "./pages/Orders";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import SearchBar from "./components/SearchBar";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Verify from "./pages/Verify";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import GlobalPopup from "./components/GlobalPopup";
// import { ShopContext } from "./context/ShopContext";

// const App = () => {
//   const location = useLocation();
//   const { fetchPopup } = useContext(ShopContext);

//   // Fetch popup on initial load and route changes
//   useEffect(() => {
//     fetchPopup();
//   }, [location]);

//   return (
//     <div className="bg-amber-50 min-h-screen">
//       <GlobalPopup />

//       <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//           toastStyle={{
//             backgroundColor: '#008753',
//             color: 'white',
//             borderRadius: '8px'
//           }}
//         />
//         <Navbar />
//         <SearchBar />

//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/menu" element={<Collection />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/product/:productId" element={<Product />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/place-order" element={<PlaceOrder />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/verify" element={<Verify />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//         </Routes>

//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default App;

// import React, { useState, useEffect, useContext } from "react";
// import { Routes, Route, useLocation } from "react-router-dom";
// import Home from "./pages/Home";
// import Collection from "./pages/Collection";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Login from "./pages/Login";
// import PlaceOrder from "./pages/PlaceOrder";
// import Orders from "./pages/Orders";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import SearchBar from "./components/SearchBar";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Verify from "./pages/Verify";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import DishLoader from "./components/DishLoader";
// import GlobalPopup from "./components/GlobalPopup";
// import { ShopContext } from "./context/ShopContext";

// const App = () => {
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();
//   const { fetchPopup } = useContext(ShopContext); // Get fetchPopup from context

//   // Show loader on initial page load
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500); // Simulate initial load time

//     // Fetch popup on initial load
//     fetchPopup();

//     return () => clearTimeout(timer);
//   }, []);

//   // Show loader during route transitions
//   useEffect(() => {
//     setLoading(true);
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 500); // Simulate route transition time

//     // Refresh popup on route change
//     fetchPopup();

//     return () => clearTimeout(timer);
//   }, [location]);

//   return (
//     <div className="bg-amber-50 min-h-screen">
//       {/* Show loader while loading */}
//       {loading && <DishLoader />}

//       {/* Global Popup - shows on all pages */}
//       <GlobalPopup />

//       <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//           toastStyle={{
//             backgroundColor: '#008753',
//             color: 'white',
//             borderRadius: '8px'
//           }}
//         />
//         <Navbar />
//         <SearchBar />

//         {/* Main content - only render when not loading */}
//         {!loading && (
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/menu" element={<Collection />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/contact" element={<Contact />} />
//             <Route path="/product/:productId" element={<Product />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/place-order" element={<PlaceOrder />} />
//             <Route path="/orders" element={<Orders />} />
//             <Route path="/verify" element={<Verify />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password/:token" element={<ResetPassword />} />
//           </Routes>
//         )}

//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default App;

// import React, { useState, useEffect } from "react";
// import { Routes, Route, useLocation } from "react-router-dom";
// import Home from "./pages/Home";
// import Collection from "./pages/Collection";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Login from "./pages/Login";
// import PlaceOrder from "./pages/PlaceOrder";
// import Orders from "./pages/Orders";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import SearchBar from "./components/SearchBar";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Verify from "./pages/Verify";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import DishLoader from "./components/DishLoader"; // Import the loader component

// const App = () => {
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();

//   // Show loader on initial page load
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500); // Simulate initial load time

//     return () => clearTimeout(timer);
//   }, []);

//   // Show loader during route transitions
//   useEffect(() => {
//     setLoading(true);
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 500); // Simulate route transition time

//     return () => clearTimeout(timer);
//   }, [location]);

//   return (
//     <div className="bg-amber-50 min-h-screen">
//       {/* Show loader while loading */}
//       {loading && <DishLoader />}

//       <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//           toastStyle={{
//             backgroundColor: '#008753',
//             color: 'white',
//             borderRadius: '8px'
//           }}
//         />
//         <Navbar />
//         <SearchBar />

//         {/* Main content - only render when not loading */}
//         {!loading && (
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/menu" element={<Collection />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/contact" element={<Contact />} />
//             <Route path="/product/:productId" element={<Product />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/place-order" element={<PlaceOrder />} />
//             <Route path="/orders" element={<Orders />} />
//             <Route path="/verify" element={<Verify />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password/:token" element={<ResetPassword />} />
//           </Routes>
//         )}

//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default App;

// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Collection from "./pages/Collection";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Login from "./pages/Login";
// import PlaceOrder from "./pages/PlaceOrder";
// import Orders from "./pages/Orders";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import SearchBar from "./components/SearchBar";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Verify from "./pages/Verify";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";

// const App = () => {
//   return (
//     <div className="bg-amber-50 min-h-screen">
//       <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//           toastStyle={{
//             backgroundColor: '#008753',
//             color: 'white',
//             borderRadius: '8px'
//           }}
//         />
//         <Navbar />
//         <SearchBar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/menu" element={<Collection />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/product/:productId" element={<Product />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/place-order" element={<PlaceOrder />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/verify" element={<Verify />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//         </Routes>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default App;

// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Collection from "./pages/Collection";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Login from "./pages/Login";
// import PlaceOrder from "./pages/PlaceOrder";
// import Orders from "./pages/Orders";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import SearchBar from "./components/SearchBar";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Verify from "./pages/Verify";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";

// const App = () => {
//   return (
//     <div className=" bg-white">
//       <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
//         <ToastContainer />
//         <Navbar />
//         <SearchBar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/collection" element={<Collection />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/product/:productId" element={<Product />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/place-order" element={<PlaceOrder />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/verify" element={<Verify />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//         </Routes>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default App;
