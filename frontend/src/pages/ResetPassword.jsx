import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, Link } from "react-router-dom";

const ResetPassword = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/users/reset-password",
        { token, password },
      );
      if (response.data.success) {
        toast.success(response.data.message || "Password reset successfully!");
        // Optionally redirect to login after success
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
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
            Peak Lens
          </h1>
          <p className="text-gray-400">
            Create a new password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Reset Password
            </h2>
            <p className="text-gray-400 text-sm">
              Enter a new password below to regain access to your account.
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="••••••••"
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
                  Resetting...
                </>
              ) : (
                "Reset Password"
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
          Didn't receive a reset email?{" "}
          <Link
            to="/forgot-password"
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Try again
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
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
