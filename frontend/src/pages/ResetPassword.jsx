import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, Link } from "react-router-dom";

const ResetPassword = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/users/reset-password",
        { token, password },
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
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
              Reset Password
            </h1>
          </div>
          <p className="text-gray-600">
            Enter your new password below to reset your account.
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008753] focus:border-transparent transition-all"
              placeholder="••••••••"
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
                Resetting...
              </>
            ) : (
              "Reset Password"
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

export default ResetPassword;

// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useParams } from 'react-router-dom';

// const ResetPassword = () => {
//     const backendUrl = import.meta.env.VITE_BACKEND_URL;
//     const { token } = useParams();
//     const [password, setPassword] = useState('');
//     const onSubmitHandler = async (event) => {
//         event.preventDefault();
//         try {
//             const response = await axios.post('https://edierechopsbackend.onrender.com/api/user/reset-password', { token, password });
//             // const response = await axios.post('https://flyboybackend.onrender.com/api/user/reset-password', { token, password });
//             // const response = await axios.post(backendUrl + '/api/user/reset-password', { token, password });
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
//             <h2 className='text-3xl'>Reset Password</h2>
//             <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className='w-full px-3 py-2 border border-gray-800'
//                 placeholder='Enter new password'
//                 required
//             />
//             <button type='submit' className='border border-white text-white px-8 py-4 text-sm bg-[#333333]'>
//                 Reset Password
//             </button>
//         </form>
//     );
// };

// export default ResetPassword;
