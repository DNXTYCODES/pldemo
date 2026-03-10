import React from 'react';
import { FaUtensils, FaLeaf, FaHeart, FaUsers } from 'react-icons/fa';
import { assets } from '../assets/assets';

const About = () => {
  const features = [
    {
      icon: <FaUtensils size={36} />,
      title: "Authentic Recipes",
      description: "Traditional recipes passed down through generations"
    },
    {
      icon: <FaLeaf size={36} />,
      title: "Fresh Ingredients",
      description: "Locally sourced, organic ingredients daily"
    },
    {
      icon: <FaHeart size={36} />,
      title: "Made with Love",
      description: "Every dish prepared with care and passion"
    },
    {
      icon: <FaUsers size={36} />,
      title: "Community Focused",
      description: "Supporting local farmers and producers"
    }
  ];

  const team = [
    { name: "Chioma Adebayo", role: "Head Chef" },
    { name: "Emeka Nwankwo", role: "Sous Chef" },
    { name: "Amina Suleiman", role: "Pastry Chef" },
    { name: "Tunde Okafor", role: "Restaurant Manager" }
  ];

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#008753]/10 to-amber-50 rounded-3xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-[2px] bg-[#008753]"></div>
                  <p className="font-medium text-sm text-[#008753]">OUR STORY</p>
                </div>
                <h1 className="prata-regular text-4xl md:text-5xl text-[#008753] mb-4">
                  African <span>/</span> <span className="text-amber-600">Caribbean</span> Food
                </h1>
                <p className="text-gray-700 mb-6 text-lg">
                  Bringing authentic Nigerian flavors to your table since 2010
                </p>
              </div>
            </div>
            <div className="md:h-auto bg-gray-200 flex items-center justify-center">
              {/* <p className="text-gray-500">Restaurant image</p> */}
              <img src={assets.about_img} alt="" />
            </div>
          </div>
        </div>

        {/* Our Story */}
        {/* <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="prata-regular text-3xl text-[#008753] mb-6 text-center">Our Journey</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-gray-700">
                Founded in 2010 by Chef Chioma Adebayo, Taste of Nigeria began as a small family kitchen 
                sharing authentic Nigerian dishes with the local community. What started as a passion project 
                quickly grew into a beloved culinary destination.
              </p>
              <p className="text-gray-700">
                Our mission is simple: to preserve and celebrate Nigeria's rich culinary heritage while 
                creating a warm, welcoming space for everyone to experience the vibrant flavors of West Africa.
              </p>
              <p className="text-gray-700">
                Every dish tells a story - from our signature Jollof Rice to our perfectly spiced Suya. 
                We source ingredients locally whenever possible and stay true to traditional cooking methods.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Food Image</p>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-[#008753] mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="prata-regular text-xl text-[#008753] mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        {/* <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="prata-regular text-3xl text-[#008753] mb-8 text-center">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Photo</p>
                </div>
                <h3 className="prata-regular text-xl text-[#008753]">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Values */}
        <div className="bg-gradient-to-r from-[#008753]/10 to-amber-50 rounded-3xl p-8">
          <h2 className="prata-regular text-3xl text-[#008753] mb-6 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="prata-regular text-xl text-[#008753] mb-3">Authenticity</h3>
              <p className="text-gray-700">
                We stay true to traditional recipes and cooking techniques, ensuring every dish is a genuine taste of Nigeria.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="prata-regular text-xl text-[#008753] mb-3">Quality</h3>
              <p className="text-gray-700">
                From sourcing ingredients to final preparation, we maintain the highest standards in every step.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="prata-regular text-xl text-[#008753] mb-3">Community</h3>
              <p className="text-gray-700">
                We believe in building relationships with our customers and supporting our local community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;