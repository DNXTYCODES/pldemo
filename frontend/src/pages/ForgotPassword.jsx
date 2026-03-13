import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/users/forgot-password",
        { email },
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Password reset email sent successfully!",
        );
        setEmail("");
      } else {
        toast.error(response.data.message || "Failed to send reset email!");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong! Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
            PhotoTrade
          </h1>
          <p className="text-gray-400">Recover your account access</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-400 text-sm">
              Don't worry! Enter your email address and we'll send you a link to
              reset your password.
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-all duration-300 shadow-lg flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="pt-4 border-t border-gray-700 text-center">
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

// const ForgotPassword = () => {
//     const backendUrl = import.meta.env.VITE_BACKEND_URL;
//     const [email, setEmail] = useState('');

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
//         console.log("Form submitted with email:", email); // Debugging log to check if the handler is triggered
//         try {
//             // const response = await axios.post('http://localhost:5174/api/user/forgot-password', { email }); // Ensure the URL is correct
//             // const response = await axios.post('https://flyboybackend.onrender.com/api/user/forgot-password', { email }); // Ensure the URL is correct
//             const response = await axios.post('https://edierechopsbackend.onrender.com/api/user/forgot-password', { email }); // Ensure the URL is correct
//             // const response = await axios.post(backendUrl + '/api/user/forgot-password', { email }); // Ensure the URL is correct

//             console.log("Response from backend:", response.data); // Debugging log for backend response
//             if (response.data.success) {
//                 toast.success(response.data.message || 'Password reset email sent successfully!');
//             } else {
//                 toast.error(response.data.message || 'Failed to send reset email!');
//             }
//         } catch (error) {
//             console.error("Error during API call:", error); // Debugging log for any errors
//             toast.error("Something went wrong! Please try again.");
//         }
//     };

//     return (
//         <form
//             onSubmit={onSubmitHandler}
//             className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
//         >
//             <h2 className="text-3xl">Forgot Password</h2>
//             <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => {
//                     setEmail(e.target.value);
//                     console.log("Email input value:", e.target.value); // Debugging log to verify email input
//                 }}
//                 className="w-full px-3 py-2 border border-gray-800"
//                 placeholder="Enter your email"
//                 required
//             />
//             <button
//                 type="submit"
//                 className="border border-white text-white px-8 py-4 text-sm bg-[#333333] hover:bg-black hover:text-white transition-all duration-500"
//             >
//                 Send Reset Link
//             </button>
//         </form>
//     );
// };

// export default ForgotPassword;

// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const ForgotPassword = () => {
//     const [email, setEmail] = useState('');
//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
//         try {
//             const response = await axios.post('/api/user/forgot-password', { email });
//             if (response.data.success) {
//                 toast.success(response.data.message);
//             } else {
//                 toast.error(response.data.message);
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error("Something went wrong!");
//         }
//     };

//     return (
//         <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
//             <h2 className='text-3xl'>Forgot Password</h2>
//             <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className='w-full px-3 py-2 border border-gray-800'
//                 placeholder='Enter your email'
//                 required
//             />
//             <button type='submit' className='border border-white text-white px-8 py-4 text-sm bg-[#333333]'>
//                 Send Reset Link
//             </button>
//         </form>
//     );
// };

// export default ForgotPassword;
