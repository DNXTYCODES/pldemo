import React, { useState } from "react";

const UserManual = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: "getting-started",
      title: "🚀 Getting Started",
      icon: "🚀",
      content: `
        <h3 class="font-bold mt-4 mb-2">Welcome to the Admin Panel</h3>
        <p class="mb-3">The admin panel is your central hub for managing the photography trading platform. You have access to four main management areas.</p>
        
        <h4 class="font-semibold mt-3 mb-2">Main Features:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>Manage Images</strong> - Control and organize user-uploaded photos</li>
          <li><strong>Manage Photographers</strong> - Monitor photographer profiles and accounts</li>
          <li><strong>Manage Users</strong> - Manage all platform users and their information</li>
          <li><strong>User Manual</strong> - Access this comprehensive documentation</li>
        </ul>
      `,
    },
    {
      id: "manage-images",
      title: "📸 Managing Images",
      icon: "📸",
      content: `
        <h3 class="font-bold mt-4 mb-2">How to Manage Images</h3>
        
        <h4 class="font-semibold mt-3 mb-2">Accessing Manage Images:</h4>
        <ol class="list-decimal ml-5 space-y-2 text-sm">
          <li>Click <strong>"Manage Images"</strong> from the main navigation menu</li>
          <li>View all images uploaded by photographers on the platform</li>
          <li>Each image card displays title, photographer name, upload date, and pricing</li>
          <li>Use the search bar to find specific images by title or photographer</li>
        </ol>
        
        <h4 class="font-semibold mt-3 mb-2">Image Information Displayed:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li>Image thumbnail preview</li>
          <li>Image title and description</li>
          <li>Photographer who uploaded it</li>
          <li>Upload date and time</li>
          <li>Image category/collection</li>
          <li>Current pricing (if applicable)</li>
          <li>Download/view count statistics</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">Managing Image Sections:</h4>
        <p class="text-sm mb-2">Assign images to featured homepage sections:</p>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>Popular Photos</strong> - Images with highest downloads/engagement</li>
          <li><strong>Editors Choice</strong> - Curated high-quality selections by admin</li>
          <li><strong>Trending</strong> - Currently popular and trending images</li>
          <li><strong>Featured</strong> - Special highlighted collections</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">Image Actions Available:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>View Full Image</strong> - Click to see image in full resolution</li>
          <li><strong>View Photographer Profile</strong> - See who uploaded the image</li>
          <li><strong>Edit Details</strong> - Update image title, description, price, category</li>
          <li><strong>Assign to Featured Section</strong> - Promote image to homepage</li>
          <li><strong>View Statistics</strong> - See download count, views, ratings</li>
          <li><strong>Delete Image</strong> - Remove from platform (use with caution - permanent)</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">How Images Get Here:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li>Photographers with sufficient balance (\$200+ USD equivalent ETH) upload from frontend</li>
          <li>Images are automatically published if balance requirement is met</li>
          <li>Admin can manually upload images from Manage Users page for test/bot accounts</li>
          <li>All images are moderated and must comply with platform guidelines</li>
        </ul>
      `,
    },
    {
      id: "manage-photographers",
      title: "👥 Managing Photographers",
      icon: "👥",
      content: `
        <h3 class="font-bold mt-4 mb-2">How to Manage Photographers</h3>
        
        <h4 class="font-semibold mt-3 mb-2">Accessing Manage Photographers:</h4>
        <ol class="list-decimal ml-5 space-y-2 text-sm">
          <li>Click <strong>"Manage Photographers"</strong> from the main navigation</li>
          <li>View complete list of all photographers registered on platform</li>
          <li>See photographer profile cards with key statistics and information</li>
          <li>Search photographers by name, email, or ID</li>
        </ol>
        
        <h4 class="font-semibold mt-3 mb-2">Photographer Information Displayed:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li>Photographer profile picture/avatar</li>
          <li>Name and email address</li>
          <li>Account creation date (when they registered)</li>
          <li>Total number of images uploaded</li>
          <li>Average rating from customers (stars)</li>
          <li>Total earnings from image sales</li>
          <li>Current account balance/wallet balance</li>
          <li>Account status (active, inactive, suspended, verified)</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">Photographer Account Status:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>Active</strong> - Photographer is currently registered and can upload</li>
          <li><strong>Inactive</strong> - Has account but hasn't uploaded recently</li>
          <li><strong>Suspended</strong> - Account temporarily disabled (policy violation)</li>
          <li><strong>Verified</strong> - Identity confirmed by admin, higher trust status</li>
          <li><strong>Bot Account</strong> - Test account for development/demo purposes</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">Actions Available for Each Photographer:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>View Profile</strong> - See full photographer details and bio</li>
          <li><strong>View Portfolio</strong> - Browse all images uploaded by photographer</li>
          <li><strong>View Statistics</strong> - Download count, views, ratings breakdown</li>
          <li><strong>View Earnings</strong> - Payment history and total earnings</li>
          <li><strong>View Balance</strong> - Current wallet balance (ETH equivalency and USD)</li>
          <li><strong>View Upload History</strong> - Timeline of all images uploaded with dates</li>
          <li><strong>Contact/Message</strong> - Send message or notification to photographer</li>
          <li><strong>Suspend Account</strong> - Temporarily disable if needed</li>
          <li><strong>Delete Account</strong> - Permanently remove (use with extreme caution)</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">Key Metrics to Monitor:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>Upload Activity</strong> - How frequently they're publishing new images</li>
          <li><strong>Image Quality</strong> - Average ratings and customer feedback</li>
          <li><strong>Account Balance</strong> - Minimum \$200 ETH equivalent required to upload</li>
          <li><strong>Verification Status</strong> - Which photographers have confirmed identity</li>
          <li><strong>Earnings Trend</strong> - Growing or declining income from sales</li>
        </ul>
      `,
    },
    {
      id: "manage-users",
      title: "👤 Manage Users",
      icon: "👤",
      content: `
        <h3 class="font-bold mt-4 mb-2">How to Manage Users</h3>
        
        <h4 class="font-semibold mt-3 mb-2">Viewing Users:</h4>
        <ol class="list-decimal ml-5 space-y-2 text-sm">
          <li>Navigate to <strong>"Manage Users"</strong> page from the menu</li>
          <li>See all registered users on the platform</li>
          <li>View user email, join date, and last activity</li>
          <li>Search for specific users by email or name</li>
          <li>Filter users by status or type</li>
        </ol>
        
        <h4 class="font-semibold mt-3 mb-2">User Types & Roles:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li><strong>Bot Accounts</strong> - Test/demo accounts for development and testing</li>
          <li><strong>Real Clients</strong> - Actual paying customers who need to fund accounts to upload</li>
          <li><strong>Admin Accounts</strong> - Full platform access and management controls</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">User Management Features:</h4>
        <ul class="list-disc ml-5 space-y-2 text-sm">
          <li><strong>View Profile</strong> - See complete user information and account details</li>
          <li><strong>Check Balance</strong> - View account balance and funding history</li>
          <li><strong>Upload Images</strong> - Admin can upload images for accounts from this page
            <ul class="list-disc ml-5 mt-1 space-y-1 text-xs">
              <li>✅ <strong>Safe for Bot Accounts:</strong> Upload test images freely</li>
              <li>⚠️ <strong>Careful with Real Clients:</strong> Only upload if admin-created the account. Real clients must upload their own images since they pay money - uploading for them could scatter their work and cause confusion</li>
            </ul>
          </li>
          <li><strong>Monitor Activity</strong> - Track user login history and platform usage</li>
          <li><strong>Payment Status</strong> - Check if users have funded their accounts adequately</li>
        </ul>
        
        <h4 class="font-semibold mt-3 mb-2">Important Notes:</h4>
        <ul class="list-disc ml-5 space-y-1 text-sm">
          <li>Bot accounts do NOT require payment to upload images</li>
          <li>Real client accounts REQUIRE minimum \$200 USD equivalent in Ethereum to upload</li>
          <li>Always verify account type before uploading images to prevent confusion</li>
          <li>Admin-created client accounts can have images uploaded by admin, but ensure the client knows about it</li>
        </ul>
      `,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📖 Admin User Manual
        </h1>
        <p className="text-lg text-gray-600">
          Complete guide to the photography platform admin panel
        </p>
      </div>

      {/* Navigation Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => toggleSection(section.id)}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="text-2xl mb-2">{section.icon}</div>
            <h3 className="font-bold text-gray-900">{section.title}</h3>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-gray-900">
                {section.title}
              </h2>
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  expandedSection === section.id ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* Section Content */}
            {expandedSection === section.id && (
              <div className="px-6 pb-6 border-t-2 border-gray-200 bg-gray-50">
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h3 className="font-bold text-lg text-blue-900 mb-4">
          ❓ Guide Overview
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            📸 <strong>Manage Images</strong> - View and organize photographer
            uploads
          </li>
          <li>
            👥 <strong>Manage Photographers</strong> - Monitor photographer
            accounts and stats
          </li>
          <li>
            👤 <strong>Manage Users</strong> - Control all platform users
          </li>
          <li>
            📖 <strong>User Manual</strong> - Access this comprehensive guide
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>Last updated: March 2026</p>
        <p>Photography Platform - Admin Dashboard</p>
      </div>
    </div>
  );
};

export default UserManual;
