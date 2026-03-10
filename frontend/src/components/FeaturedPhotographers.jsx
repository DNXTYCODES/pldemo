import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FeaturedPhotographers = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const photographers = [
    {
      id: 1,
      name: "Stanislav Istratov",
      location: "London, United Kingdom",
      images: [
        "https://drscdn.500px.org/photo/1121107645/q%3D80_h%3D300/v2?sig=389cd348cfc37c319e8a394821f078d73118c3dea87ffffcb3790e445c2326a1",
        "https://drscdn.500px.org/photo/1121037402/q%3D80_h%3D300/v2?sig=1be00f50b0e23d7f1bb00701f161e37532b8350f4ffab0f04cca7f5f683ae49d",
        "https://drscdn.500px.org/photo/1120779681/q%3D80_h%3D300/v2?sig=9f15107c01ad85ae845d3e9e18db40af9bd8be49c38d89cb74ee95f31f0e5c35",
        "https://drscdn.500px.org/photo/1120104186/q%3D80_h%3D300/v2?sig=7b726743913ac89e5a7f07b2e7055b8a34a1785768f6ee23abf987f9f4aa584f",
      ],
      avatar:
        "https://drscdn.500px.org/user_avatar/114968/q%3D85_w%3D100_h%3D100/v2?webp=true&v=6&sig=15627b25c6254bc8fdc65a99a18f389e9adbbfd5b6fb9160ad8627cca28176df",
    },
    {
      id: 2,
      name: "Jeet Khagram",
      location: "Mumbai, India",
      images: [
        "https://drscdn.500px.org/photo/1116672294/q%3D80_h%3D300/v2?sig=e92e0d916e06d2a717516d1af7fc81dc5fcb16eba0f0b858b3780c4bb543cec7",
        "https://drscdn.500px.org/photo/1115648530/q%3D80_h%3D300/v2?sig=1a75e65f4cfcc38cd7aa4dc718d63bcc99acdfac5e939c32fa5083474221bcbe",
        "https://drscdn.500px.org/photo/1114192431/q%3D80_h%3D300/v2?sig=3639d28888c6268dbaf3d7065e39fe16b72f6fcb48e416c980324e8e64557e18",
        "https://drscdn.500px.org/photo/1112520801/q%3D80_h%3D300/v2?sig=6e2feb8339276af78c31200eadd244b992f2fc19354e25ec612e079822b337b6",
      ],
      avatar:
        "https://drscdn.500px.org/user_avatar/41938191/q%3D85_w%3D100_h%3D100/v2?webp=true&v=6&sig=e1fb99a5d05c661696b0db2d40beaf84e32e526d91f506ac3a301438370a24b3",
    },
    {
      id: 3,
      name: "Lukas",
      location: "Las Vegas, NV, United States",
      badge: "Ambassador",
      images: [
        "https://drscdn.500px.org/photo/1115000206/q%3D80_h%3D300/v2?sig=2f97bfdc2192172ee3dc42864292a1327df911ffd5fb969086c2b925affa24b5",
        "https://drscdn.500px.org/photo/1110698059/q%3D80_h%3D300/v2?sig=012dad14c4adb1bb2ca490f1514eacb6b246bca0f746dd18eb4bff504f385ce3",
        "https://drscdn.500px.org/photo/1107207034/q%3D80_h%3D300/v2?sig=47a5c3113e29945eb24048c18e833d9918e1217da155e706b878f5b848c3fc97",
        "https://drscdn.500px.org/photo/1104544159/q%3D80_h%3D300/v2?sig=c991a5e3a2f1de80504d4428279df5c4d53f00667a796031094039b0073e18e1",
      ],
      avatar:
        "https://drscdn.500px.org/user_avatar/1003794891/q%3D85_w%3D100_h%3D100/v2?webp=true&v=4&sig=b932ae694baf3afa2ba4fd89b75a57c93d29629133d044e25c4f24bec1f2c6f6",
    },
    {
      id: 4,
      name: "Martin Vanek",
      location: "Czech Republic",
      images: [
        "https://drscdn.500px.org/photo/1121152500/q%3D80_h%3D300/v2?sig=18efcce190950c3ec6243041833ecb28175568797c03189b63a520bd649e3205",
        "https://drscdn.500px.org/photo/1120846517/q%3D80_h%3D300/v2?sig=b1f85534dca923a9f0c47071bd7e22338ac4a7dc87244892c449718f6619f680",
        "https://drscdn.500px.org/photo/1120846266/q%3D80_h%3D300/v2?sig=2e4ccbffece3915dde18e725ec44bc37af14906881e81cc3313c2ac5b0a1b0fb",
        "https://drscdn.500px.org/photo/1114190407/q%3D80_h%3D300/v2?sig=5c4fcf0e768d8ffc43a0c6ee4fb1267fdfe711e79e7a25211d439c3dfedad715",
      ],
      avatar:
        "https://drscdn.500px.org/user_avatar/8984535/q%3D85_w%3D100_h%3D100/v2?webp=true&v=1&sig=51caee8a29d491f6dff2c9c8d8484da2a7882c51fb6f243f35e41aa46cd49f00",
    },
    {
      id: 5,
      name: "Roberto Pazzi",
      location: "Italy",
      badge: "Award Winner",
      images: [
        "https://drscdn.500px.org/photo/1121460999/q%3D80_h%3D300/v2?sig=c3e880d8072e99172b19e1d762502e1a0ee0190712aaf600056daab3f5808212",
        "https://drscdn.500px.org/photo/1121435947/q%3D80_h%3D300/v2?sig=47dfac8ac60b8f9b7087136fd8653171cd5d2b1590f0abc59d83b0274e6d70c5",
        "https://drscdn.500px.org/photo/1121407867/q%3D80_h%3D300/v2?sig=c40619b1b47322a84d6d52da7fcda5631aed5ea3d64d00ca3edb3d84118949c5",
        "https://drscdn.500px.org/photo/1121380738/q%3D80_h%3D300/v2?sig=152fa831886f3fbbaa8b05f582f578f87b41be05e96b36321cb3f26f3bf54be4",
      ],
      avatar:
        "https://drscdn.500px.org/user_avatar/6354248/q%3D85_w%3D100_h%3D100/v2?webp=true&v=7&sig=51c9bd0f2f57cbc98733102f2c4c59a1509a39f13dbbb7731ddaf680c22aad3d",
    },
    {
      id: 6,
      name: "Nuno A",
      location: "Lisboa, Portugal",
      badge: "Pro",
      images: [
        "https://drscdn.500px.org/photo/1119206334/q%3D80_h%3D300/v2?sig=3687d255c58bce39e4d6d4e8b6ef2f9c254f5d3176666c2de69dd914320fa2fc",
        "https://drscdn.500px.org/photo/1118845649/q%3D80_h%3D300/v2?sig=9fb0a0afec93389a5cb97e1c2941b88fd50b2e927588fd8fc52de7bbd36a4163",
        "https://drscdn.500px.org/photo/1118340255/q%3D80_h%3D300/v2?sig=e39f197440978109cff3a9bf351e016aacf08779a95a4f71957fb0bb74224264",
        "https://drscdn.500px.org/photo/1118217856/q%3D80_h%3D300/v2?sig=c1b1eb02f76e8fe5fc8bc238bbf0eea229f044699a3b181c13eebb05d8279878",
      ],
      avatar:
        "https://drscdn.500px.org/user_avatar/12217145/q%3D85_w%3D100_h%3D100/v2?webp=true&v=49&sig=3853fc14f1a0b03a7589e7ee75e4a85f12465720aa3090e23137b2206cbf071c",
    },
  ];

  const nextPhotographer = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photographers.length);
  };

  const prevPhotographer = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photographers.length - 1 : prevIndex - 1,
    );
  };

  const photographer = photographers[currentIndex];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Featured Photographers
            </h3>
            <h2 className="text-4xl font-bold text-gray-900">
              Photographers we think you should check out
            </h2>
          </div>
          <Link
            to="/photographers"
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

        {/* Photographer Card */}
        <div className="relative">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
              {/* Photo Gallery */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  {photographer.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${photographer.name} work ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Photographer Info */}
              <div className="flex flex-col justify-between">
                {/* Avatar and Name */}
                <div>
                  <div className="mb-6">
                    <img
                      src={photographer.avatar}
                      alt={photographer.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 mb-4"
                    />
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {photographer.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {photographer.location}
                    </p>
                    {photographer.badge && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                        {photographer.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    Discover exceptional photography and follow the artists who
                    inspire us. Each photographer brings a unique perspective
                    and mastery to their craft.
                  </p>
                </div>

                {/* Follow Button */}
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors mt-6">
                  Follow
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevPhotographer}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Previous photographer"
            >
              <FiChevronLeft className="text-2xl text-gray-900" />
            </button>

            <div className="flex gap-2">
              {photographers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 bg-gray-900"
                      : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to photographer ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextPhotographer}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Next photographer"
            >
              <FiChevronRight className="text-2xl text-gray-900" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPhotographers;
