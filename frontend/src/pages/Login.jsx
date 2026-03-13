import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PHOTOGRAPHY_SPECIALTIES = [
  "Landscape",
  "Portrait",
  "Wildlife",
  "Architecture",
  "Street",
  "Macro",
  "Abstract",
  "Nature",
  "People",
  "Product",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Arabic",
  "Hindi",
];

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const [signUpStep, setSignUpStep] = useState(1);
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Professional profile
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [expertise_level, setExpertiseLevel] = useState("amateur");
  const [photography_specialty, setPhotographySpecialty] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSpecialtyToggle = (specialty) => {
    setPhotographySpecialty((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  };

  const handleLanguageToggle = (language) => {
    setLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language],
    );
  };

  const handleAddCustomSpecialty = () => {
    if (
      customSpecialty.trim() &&
      !photography_specialty.includes(customSpecialty)
    ) {
      setPhotographySpecialty((prev) => [...prev, customSpecialty]);
      setCustomSpecialty("");
    }
  };

  const handleSignUpStep1 = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSignUpStep(2);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/users/register", {
          name,
          email,
          password,
          bio,
          location,
          expertise_level,
          photography_specialty,
          languages,
        });
        if (response.data.success) {
          toast.success(
            response.data.message ||
              "Account created! Please check your email to verify your account.",
          );
          // Reset form
          setName("");
          setEmail("");
          setPassword("");
          setBio("");
          setLocation("");
          setExpertiseLevel("amateur");
          setPhotographySpecialty([]);
          setLanguages([]);
          setSignUpStep(1);
          setCurrentState("Login");
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/users/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Logged in successfully!");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  // Google Sign-In Handler
  const handleGoogleSignIn = () => {
    toast.info(
      "Google Sign-In is being set up. For now, please use email and password registration.",
    );
    // Note: Google Sign-In integration requires:
    // 1. Installing @react-oauth/google package
    // 2. Getting a Google OAuth Client ID
    // 3. Wrapping app with GoogleOAuthProvider
    // 4. Using GoogleLogin component
    // See instructions below
  };

  const toggleMode = () => {
    setCurrentState(currentState === "Login" ? "Sign Up" : "Login");
    setSignUpStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
            PhotoTrade
          </h1>
          <p className="text-gray-400">
            {currentState === "Login"
              ? "Welcome back to your photography marketplace"
              : signUpStep === 1
                ? "Join our photography community"
                : "Complete your professional profile"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-2xl">
          {currentState === "Login" ? (
            /* LOGIN FORM */
            <form onSubmit={onSubmitHandler} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 border border-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("forgot-password")}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-4 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Don't have an account?
                </p>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Create Account →
                </button>
              </div>
            </form>
          ) : signUpStep === 1 ? (
            /* SIGNUP STEP 1 */
            <form onSubmit={handleSignUpStep1} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password (Min 8 characters)
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
              >
                Continue →
              </button>

              {/* Google Sign-Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 border border-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </button>

              <div className="text-center text-sm text-gray-400">
                <span>Step 1 of 2</span>
                <div className="flex gap-1 mt-2">
                  <div className="h-1 bg-amber-500 rounded-full flex-1"></div>
                  <div className="h-1 bg-gray-600 rounded-full flex-1"></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Already have an account?
                </p>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Login Here →
                </button>
              </div>
            </form>
          ) : (
            /* SIGNUP STEP 2 */
            <form
              onSubmit={onSubmitHandler}
              className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  maxLength="500"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself as a photographer..."
                />
                <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location (Optional)
                </label>
                <input
                  onChange={(e) => setLocation(e.target.value)}
                  value={location}
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expertise Level
                </label>
                <select
                  onChange={(e) => setExpertiseLevel(e.target.value)}
                  value={expertise_level}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                >
                  <option value="amateur">Amateur</option>
                  <option value="semi-professional">Semi-professional</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Photography Specialties
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {PHOTOGRAPHY_SPECIALTIES.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={photography_specialty.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-2 focus:ring-amber-400"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {specialty}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    value={customSpecialty}
                    type="text"
                    placeholder="Add custom..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCustomSpecialty())
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpecialty}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 rounded text-sm font-medium text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Languages Spoken
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((language) => (
                    <label
                      key={language}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={languages.includes(language)}
                        onChange={() => handleLanguageToggle(language)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-amber-400"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {language}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSignUpStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-medium text-gray-300 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>

              <div className="text-center text-sm text-gray-400">
                <span>Step 2 of 2</span>
                <div className="flex gap-1 mt-2">
                  <div className="h-1 bg-amber-500 rounded-full flex-1"></div>
                  <div className="h-1 bg-amber-500 rounded-full flex-1"></div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Secure authentication with end-to-end encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React, { useContext, useEffect, useState } from 'react'
// import { ShopContext } from '../context/ShopContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const Login = () => {

//   const [currentState, setCurrentState] = useState('Login');
//   const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

//   const [name,setName] = useState('')
//   const [password,setPasword] = useState('')
//   const [email,setEmail] = useState('')

//   const onSubmitHandler = async (event) => {
//       event.preventDefault();
//       try {
//         if (currentState === 'Sign Up') {

//           const response = await axios.post(backendUrl + '/api/user/register',{name,email,password})
//           if (response.data.success) {
//             setToken(response.data.token)
//             localStorage.setItem('token',response.data.token)
//           } else {
//             toast.error(response.data.message)
//           }

//         } else {

//           const response = await axios.post(backendUrl + '/api/user/login', {email,password})
//           if (response.data.success) {
//             setToken(response.data.token)
//             localStorage.setItem('token',response.data.token)
//           } else {
//             toast.error(response.data.message)
//           }

//         }

//       } catch (error) {
//         console.log(error)
//         toast.error(error.message)
//       }
//   }

//   useEffect(()=>{
//     if (token) {
//       navigate('/')
//     }
//   },[token])

//   return (
//     <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
//         <div className='inline-flex items-center gap-2 mb-2 mt-10'>
//             <p className='prata-regular text-3xl bg-golden-brown bg-clip-text text-transparent bg-to-b'>{currentState}</p>
//             <hr className='border-none h-[1.5px] w-8 bg-white' />
//         </div>
//         {currentState === 'Login' ? '' : <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required/>}
//         <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required/>
//         <input onChange={(e)=>setPasword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required/>
//         <div className='w-full flex justify-between text-sm mt-[-8px]'>
//             <p className=' cursor-pointer bg-golden-brown bg-clip-text text-transparent bg-to-b' onClick={() => navigate('forgot-password')}>Forgot your password?</p>
//             {
//               currentState === 'Login'
//               ? <p onClick={()=>setCurrentState('Sign Up')} className=' cursor-pointer  bg-golden-brown bg-clip-text text-transparent bg-to-b'>Create account</p>
//               : <p onClick={()=>setCurrentState('Login')} className=' cursor-pointer  bg-golden-brown bg-clip-text text-transparent bg-to-b'>Login Here</p>
//             }
//         </div>
//         <button className='border border-white text-white px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 bg-[#333333]'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>
//     </form>
//   )
// }

// export default Login
