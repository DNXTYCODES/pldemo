import React, { useState, useEffect, useContext } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ReviewModal from "./ReviewModal";
import { assets } from "../assets/assets";

const CustomerReviews = () => {
  const {
    token,
    getRestaurantReviews,
    getUserRestaurantReview,
    addRestaurantReview,
  } = useContext(ShopContext);

  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 4.9,
    recommendationRate: 98,
    happyCustomers: 2000,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const reviewsResponse = await getRestaurantReviews();
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.reviews);

          if (reviewsResponse.reviews.length > 0) {
            const totalRating = reviewsResponse.reviews.reduce(
              (sum, review) => sum + review.rating,
              0,
            );
            const averageRating = totalRating / reviewsResponse.reviews.length;
            const recommendationRate = Math.round(
              (reviewsResponse.reviews.filter((r) => r.rating >= 4).length /
                reviewsResponse.reviews.length) *
                100,
            );

            setStats({
              averageRating: averageRating.toFixed(1),
              recommendationRate,
              happyCustomers: 2000 + reviewsResponse.reviews.length,
              totalReviews: reviewsResponse.reviews.length,
            });
          }
        }

        if (token) {
          const userReviewResponse = await getUserRestaurantReview();
          if (userReviewResponse.success) {
            setUserReview(userReviewResponse.review);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [token, getRestaurantReviews, getUserRestaurantReview]);

  const handleAddReview = async (rating, comment) => {
    const response = await addRestaurantReview(rating, comment);
    if (response.success) {
      const reviewsResponse = await getRestaurantReviews();
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.reviews);
      }

      const userReviewResponse = await getUserRestaurantReview();
      if (userReviewResponse.success) {
        setUserReview(userReviewResponse.review);
      }
    }
  };

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1,
    );
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </span>
      ));
  };

  if (isLoading) {
    return (
      <section className="w-full py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center py-20">
          Loading reviews...
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Reviews</h2>
            <p className="text-lg text-gray-600">
              Hear from our satisfied photography community
            </p>
          </div>
          <Link
            to="/reviews"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>View All</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Add Review Button */}
        {token && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {userReview ? "Update Your Review" : "Share Your Experience"}
            </button>
          </div>
        )}

        {/* Reviews Carousel */}
        {reviews.length > 0 ? (
          <div className="relative max-w-4xl mx-auto mb-12">
            {/* Review Card */}
            <div className="bg-gray-50 rounded-lg shadow-md p-8 md:p-12 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Customer Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      reviews[currentIndex].user?.avatar || assets.greenprofile
                    }
                    alt={reviews[currentIndex].user?.name || "User"}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(reviews[currentIndex].rating)}
                    <span className="text-sm font-semibold text-gray-900 ml-2">
                      {reviews[currentIndex].rating}.0
                    </span>
                  </div>

                  <p className="text-gray-700 text-lg mb-4">
                    "{reviews[currentIndex].comment}"
                  </p>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reviews[currentIndex].user?.name || "User"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(reviews[currentIndex].date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 bg-white rounded-full p-2 shadow-md hover:bg-gray-900 hover:text-white transition-colors border border-gray-200"
              aria-label="Previous review"
            >
              <FiChevronLeft className="text-2xl" />
            </button>

            <button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 bg-white rounded-full p-2 shadow-md hover:bg-gray-900 hover:text-white transition-colors border border-gray-200"
              aria-label="Next review"
            >
              <FiChevronRight className="text-2xl" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 bg-gray-900"
                      : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mb-12">
            <p className="text-gray-700 text-lg mb-4">
              No reviews yet. Be the first to share your experience!
            </p>
            {token && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Leave a Review
              </button>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageRating}
            </p>
            <p className="text-gray-600 text-sm mt-2">Average Rating</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">
              {stats.recommendationRate}%
            </p>
            <p className="text-gray-600 text-sm mt-2">Would Recommend</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">
              {stats.happyCustomers}+
            </p>
            <p className="text-gray-600 text-sm mt-2">Community Members</p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleAddReview}
        hasReviewed={!!userReview}
      />
    </section>
  );
};

export default CustomerReviews;

// import React, { useState } from "react";
// import { assets } from "../assets/assets";
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// const CustomerReviews = () => {
//   const reviews = [
//     {
//       id: 1,
//       name: "Adeola Johnson",
//       rating: 5,
//       text: "The jollof rice transported me back to Lagos! Authentic flavors and perfect texture. The suya platter was also incredible with just the right amount of spice.",
//       date: "2 days ago",
//       avatar: assets.avatar1
//     },
//     {
//       id: 2,
//       name: "Chinedu Okonkwo",
//       rating: 4,
//       text: "Finally found a place that makes proper pounded yam. The egusi soup was rich and flavorful. Will definitely be ordering again!",
//       date: "1 week ago",
//       avatar: assets.avatar2
//     },
//     {
//       id: 3,
//       name: "Funmilayo Adebayo",
//       rating: 5,
//       text: "As a Nigerian living abroad, I've been craving authentic home food. This tasted just like my mother's cooking! The delivery was fast and everything arrived hot.",
//       date: "3 weeks ago",
//       avatar: assets.avatar3
//     },
//     {
//       id: 4,
//       name: "Emeka Nwankwo",
//       rating: 5,
//       text: "The pepper soup was exactly what I needed on a cold day. Spicy, aromatic, and full of flavor. The meat was tender and well-seasoned. Perfect comfort food!",
//       date: "1 month ago",
//       avatar: assets.avatar4
//     }
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);

//   const nextReview = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
//   };

//   const prevReview = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
//     );
//   };

//   // Function to render star ratings
//   const renderStars = (rating) => {
//     return Array(5)
//       .fill(0)
//       .map((_, i) => (
//         <span
//           key={i}
//           className={`text-xl ${i < rating ? 'text-amber-500' : 'text-gray-300'}`}
//         >
//           ★
//         </span>
//       ));
//   };

//   return (
//     <section className="bg-gradient-to-r from-[#008753]/10 to-amber-50 py-20 px-4">
//       <div className="max-w-6xl mx-auto">
//         {/* Section Header */}
//         <div className="text-center mb-16">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <div className="w-8 h-[2px] bg-[#008753]"></div>
//             <p className="font-medium text-sm text-[#008753]">
//               TESTIMONIALS
//             </p>
//             <div className="w-8 h-[2px] bg-[#008753]"></div>
//           </div>

//           <h2 className="prata-regular text-4xl text-[#008753] mb-4">
//             What Our <span className="text-amber-600">Customers</span> Say
//           </h2>

//           <p className="text-gray-700 max-w-xl mx-auto">
//             Discover why food lovers keep coming back for our authentic Nigerian flavors
//           </p>
//         </div>

//         {/* Reviews Carousel */}
//         <div className="relative max-w-4xl mx-auto">
//           {/* Review Card */}
//           <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
//             <div className="flex flex-col md:flex-row gap-8">
//               {/* Customer Avatar */}
//               <div className="flex-shrink-0 mx-auto md:mx-0">
//                 <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24" />
//               </div>

//               {/* Review Content */}
//               <div className="text-center md:text-left">
//                 <div className="mb-4">
//                   {renderStars(reviews[currentIndex].rating)}
//                 </div>

//                 <p className="text-gray-700 text-lg mb-6 italic">
//                   "{reviews[currentIndex].text}"
//                 </p>

//                 <div>
//                   <h3 className="prata-regular text-xl text-[#008753]">
//                     {reviews[currentIndex].name}
//                   </h3>
//                   <p className="text-gray-500 text-sm">
//                     {reviews[currentIndex].date}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Navigation Arrows */}
//           <button
//             onClick={prevReview}
//             className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-3 shadow-md hover:bg-[#008753] hover:text-white transition-colors"
//             aria-label="Previous review"
//           >
//             <FiChevronLeft className="text-xl" />
//           </button>

//           <button
//             onClick={nextReview}
//             className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-3 shadow-md hover:bg-[#008753] hover:text-white transition-colors"
//             aria-label="Next review"
//           >
//             <FiChevronRight className="text-xl" />
//           </button>

//           {/* Dots Indicator */}
//           <div className="flex justify-center mt-8 space-x-2">
//             {reviews.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentIndex(index)}
//                 className={`w-3 h-3 rounded-full ${
//                   index === currentIndex ? "bg-[#008753]" : "bg-gray-300"
//                 }`}
//                 aria-label={`Go to review ${index + 1}`}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
//           <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
//             <p className="prata-regular text-3xl text-[#008753]">4.9/5</p>
//             <p className="text-gray-600">Average Rating</p>
//           </div>
//           <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
//             <p className="prata-regular text-3xl text-[#008753]">98%</p>
//             <p className="text-gray-600">Would Recommend</p>
//           </div>
//           <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
//             <p className="prata-regular text-3xl text-[#008753]">2K+</p>
//             <p className="text-gray-600">Happy Customers</p>
//           </div>
//           <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
//             <p className="prata-regular text-3xl text-[#008753]">15 min</p>
//             <p className="text-gray-600">Avg. Delivery Time</p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CustomerReviews;
