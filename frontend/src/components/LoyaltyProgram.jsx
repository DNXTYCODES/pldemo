import React from "react";
import { assets } from "../assets/assets";

const LoyaltyProgram = () => {
  const benefits = [
    {
      icon: assets.star_icon,
      title: "Earn Points",
      description:
        "Get 1 point for every ₦1000 spent, redeemable for discounts",
    },
    {
      icon: assets.gift,
      title: "Birthday Treat",
      description: "Special gift and bonus points on your birthday month",
    },
    {
      icon: assets.percent,
      title: "Exclusive Offers",
      description: "Access to members-only discounts and early sales",
    },
    {
      icon: assets.crown,
      title: "VIP Status",
      description: "Earn elite status for priority service and special perks",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-[#008753]"></div>
            <p className="font-medium text-sm text-[#008753]">
              REWARDING LOYALTY
            </p>
            <div className="w-8 h-[2px] bg-[#008753]"></div>
          </div>

          <h2 className="prata-regular text-4xl text-[#008753] mb-4">
            Our <span className="text-amber-600">Loyalty Program</span>
          </h2>

          <p className="text-gray-700 max-w-xl mx-auto">
            Get rewarded for your love of authentic Nigerian cuisine
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="bg-[#008753]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <img
                  src={benefit.icon}
                  alt={benefit.title}
                  className="w-8 h-8"
                />
              </div>
              <h3 className="prata-regular text-xl text-[#008753] mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left - Visual */}
            {/* <div className="w-full md:w-1/3 bg-[#008753]/5 p-8 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-6 -right-6 bg-[#008753] text-white w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="prata-regular text-2xl">1</span>
                </div>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48" />
              </div>
            </div>
             */}
            {/* Right - Content */}
            <div className="w-full md:w-2/3 p-8 md:p-12">
              <h3 className="prata-regular text-3xl text-[#008753] mb-4">
                How It Works
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-[#008753] text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="prata-regular">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="prata-regular text-lg text-[#008753] mb-1">
                      Sign Up
                    </h4>
                    <p className="text-gray-600">
                      Create your account to start earning points immediately
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-[#008753] text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="prata-regular">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="prata-regular text-lg text-[#008753] mb-1">
                      Earn Points
                    </h4>
                    <p className="text-gray-600">
                      Get 1 point for every €1 spent on food and drinks
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-[#008753] text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="prata-regular">4</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="prata-regular text-lg text-[#008753] mb-1">
                      Redeem Rewards
                    </h4>
                    <p className="text-gray-600">
                      100 points = €5 off your next order. Plus special tier
                      benefits!
                    </p>
                  </div>
                </div>

                {/* <button className="mt-6 px-8 py-3 bg-[#008753] text-white rounded-lg font-medium hover:bg-[#006641] transition-colors">
                  Join Now
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyProgram;
