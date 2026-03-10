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
      } else {
        toast.error(response.data.message || "Failed to send reset email!");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <h1 className="prata-regular text-3xl text-[#008753]">
              Forgot Password
            </h1>
          </div>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent transition-all"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#008753] text-white py-3 rounded-lg font-medium hover:bg-[#006641] transition-colors duration-300 shadow-md flex items-center justify-center"
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

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-[#008753] hover:text-[#006641] transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
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
    </div>
  );
};

export default ForgotPassword;

// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

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
