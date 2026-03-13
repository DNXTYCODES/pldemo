import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setToken, backendUrl } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        if (!token) {
          setMessage("No verification token found");
          setSuccess(false);
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${backendUrl}/api/users/verify-email/${token}`
        );

        if (response.data.success) {
          setMessage(response.data.message);
          setSuccess(true);
          toast.success(response.data.message);

          // Auto login with the token
          if (response.data.token) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
          }

          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setMessage(response.data.message || "Email verification failed");
          setSuccess(false);
          toast.error(response.data.message || "Email verification failed");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setMessage(error.response?.data?.message || "An error occurred during verification");
        setSuccess(false);
        toast.error("Email verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyEmailToken();
  }, [token, navigate, setToken, backendUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-2xl text-center">
          {loading ? (
            <>
              <div className="mb-6">
                <div className="inline-block">
                  <svg
                    className="animate-spin h-12 w-12 text-amber-400"
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
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Verifying Email</h2>
              <p className="text-gray-400">Please wait while we verify your email address...</p>
            </>
          ) : success ? (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting you to the home page in a few seconds...
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
