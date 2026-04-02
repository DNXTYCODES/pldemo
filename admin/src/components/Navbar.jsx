import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/manage-images", label: "📸 Manage Images" },
    { to: "/mass-upload", label: "📁 Mass Upload" },
    { to: "/image-categories", label: "➕ Add Image Category" },
    { to: "/manage-photographers", label: "👥 Manage Photographers" },
    { to: "/users", label: "👤 Manage Users" },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      {/* Top Bar */}
      <div className="flex items-center py-3 px-4 sm:px-8 justify-between">
        <img className="w-24 sm:w-32" src={assets.blacklogo} alt="Logo" />

        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-gray-300">Admin Panel</span>
          <button
            onClick={() => setToken("")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {mobileMenuOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <div
        className={`${mobileMenuOpen ? "block" : "hidden"} md:block border-t border-gray-700`}
      >
        <div className="px-4 sm:px-8 py-2 flex flex-col md:flex-row gap-1 md:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 text-sm hover:bg-gray-700 rounded transition-colors duration-200 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Logout Button */}
      <div className="md:hidden px-4 sm:px-8 py-2 border-t border-gray-700">
        <button
          onClick={() => {
            setToken("");
            setMobileMenuOpen(false);
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
