import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const {
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    backendUrl,
    currencyPreference,
    setCurrencyPreference,
  } = useContext(ShopContext);
  const [searchType, setSearchType] = useState("keywords");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchTypeDropdown, setShowSearchTypeDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const cartCount = getCartCount ? getCartCount() : 0;

  // Fetch user profile when token changes
  useEffect(() => {
    if (token) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(backendUrl + "/api/users/profile", {
            headers: { Authorization: token },
          });
          const data = await response.json();
          if (data.success && data.user) {
            setUserProfile(data.user);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
      fetchUserProfile();
    }
  }, [token, backendUrl]);

  const searchTypeOptions = [
    { value: "keywords", label: "Keyword" },
    { value: "artistname", label: "Artist" },
    { value: "keywordsartistname", label: "Keyword + Artist" },
    { value: "title", label: "Title" },
    { value: "titleartistname", label: "Title + Artist" },
  ];

  const handleSearchTypeSelect = (type) => {
    setSearchType(type);
    setShowSearchTypeDropdown(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${searchQuery}&type=${searchType}`);
      setSearchQuery("");
    }
  };

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSearchTypeDropdown(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="w-full">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xs tracking-wider">
                PL
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold tracking-wide text-gray-900">
                PEAK LENS
              </span>
              <span className="text-xs text-amber-500">PHOTOGRAPHY</span>
            </div>
          </Link>

          {/* Desktop Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-2xl mx-6 gap-0"
          >
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowSearchTypeDropdown(!showSearchTypeDropdown)
                }
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 text-xs sm:text-sm hover:bg-gray-200 transition-colors font-medium"
              >
                <span>
                  {
                    searchTypeOptions.find((opt) => opt.value === searchType)
                      ?.label
                  }
                </span>
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {showSearchTypeDropdown && (
                <div className="absolute top-full left-0 w-44 bg-white border border-gray-300 border-t-0 shadow-md z-10">
                  {searchTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSearchTypeSelect(option.value)}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 font-normal"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos, artists..."
              className="flex-1 px-4 py-2 border border-r-0 border-gray-300 bg-white text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 border border-amber-500 hover:bg-amber-600 transition-colors"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/collection"
              className="text-sm text-gray-700 hover:text-amber-500 transition-colors font-medium"
            >
              Gallery
            </Link>
            <Link
              to="/shop"
              className="text-sm text-gray-700 hover:text-amber-500 transition-colors font-medium"
            >
              Shop
            </Link>
            <Link
              to="/photographers"
              className="text-sm text-gray-700 hover:text-amber-500 transition-colors font-medium"
            >
              Photographers
            </Link>
            <Link
              to="/about"
              className="text-sm text-gray-700 hover:text-amber-500 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm text-gray-700 hover:text-amber-500 transition-colors font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-amber-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative flex items-center text-gray-700 hover:text-amber-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-gray-900 text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Currency Toggle */}
            <button
              onClick={() =>
                setCurrencyPreference(
                  currencyPreference === "eth" ? "usd" : "eth",
                )
              }
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 text-sm font-medium border border-gray-300 group"
              title="Toggle between ETH and USD prices"
            >
              {currencyPreference === "eth" ? (
                <>
                  <span className="font-semibold">ETH</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                  </svg>
                </>
              ) : (
                <>
                  <span className="font-semibold">USD</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                  </svg>
                </>
              )}
            </button>

            {/* Auth - Profile Icon when Logged In, Login/Signup when Not */}
            {token ? (
              <div ref={profileDropdownRef} className="relative">
                {/* Profile Icon Button */}
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:opacity-80 transition-opacity cursor-pointer overflow-hidden border-2 border-amber-500 hover:border-amber-600"
                  title="Profile Menu"
                >
                  {userProfile?.profilePicture ? (
                    <img
                      src={userProfile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-amber-400">
                        My Account
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          navigate("/edit-profile");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Profile
                      </button>

                      <div className="border-t border-gray-700 my-2"></div>

                      <button
                        onClick={() => {
                          navigate("/upload-photo");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Upload Photos
                      </button>

                      <button
                        onClick={() => {
                          navigate("/my-sales");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        My Sales
                      </button>

                      <button
                        onClick={() => {
                          navigate("/my-purchases");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        My Purchases
                      </button>

                      <button
                        onClick={() => {
                          navigate("/favorites");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        My Favorites
                      </button>

                      <div className="border-t border-gray-700 my-2"></div>

                      <button
                        onClick={() => {
                          navigate("/fund-account");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Fund Account
                      </button>

                      <div className="border-t border-gray-700 my-2"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-3"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors"
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Form */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 px-4 py-4">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-0"
            >
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowSearchTypeDropdown(!showSearchTypeDropdown)
                  }
                  className="flex items-center gap-1 px-3 py-2 bg-gray-700 border border-r-0 border-gray-600 text-gray-200 text-xs hover:bg-gray-600 transition-colors font-medium"
                >
                  <span>
                    {
                      searchTypeOptions.find((opt) => opt.value === searchType)
                        ?.label
                    }
                  </span>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showSearchTypeDropdown && (
                  <div className="absolute top-full left-0 w-40 bg-gray-700 border border-gray-600 border-t-0 shadow-md z-10">
                    {searchTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSearchTypeSelect(option.value)}
                        className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos..."
                className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                className="px-3 py-2 bg-amber-500 border border-amber-500 hover:bg-amber-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
              <Link
                to="/collection"
                className="block text-sm text-gray-300 hover:text-amber-400 transition-colors font-medium"
              >
                Gallery
              </Link>
              <Link
                to="/shop"
                className="block text-sm text-gray-300 hover:text-amber-400 transition-colors font-medium"
              >
                Shop
              </Link>
              <Link
                to="/photographers"
                className="block text-sm text-gray-300 hover:text-amber-400 transition-colors font-medium"
              >
                Photographers
              </Link>
              <Link
                to="/about"
                className="block text-sm text-gray-300 hover:text-amber-400 transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block text-sm text-gray-300 hover:text-amber-400 transition-colors font-medium"
              >
                Contact
              </Link>

              {/* Mobile Auth Menu */}
              {token && (
                <>
                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <Link
                      to="/profile"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/edit-profile"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/upload-photo"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      Upload Photos
                    </Link>
                    <Link
                      to="/my-sales"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      My Sales
                    </Link>
                    <Link
                      to="/my-purchases"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      My Purchases
                    </Link>
                    <Link
                      to="/favorites"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      My Favorites
                    </Link>
                    <Link
                      to="/fund-account"
                      className="block text-sm text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      Fund Account
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
