import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const DynamicMenu = () => {
  const [selectedDay, setSelectedDay] = useState("today");

  // Days of the week
  const days = [
    { id: "today", name: "Today" },
    { id: "monday", name: "Monday" },
    { id: "tuesday", name: "Tuesday" },
    { id: "wednesday", name: "Wednesday" },
    { id: "thursday", name: "Thursday" },
    { id: "friday", name: "Friday" },
    { id: "saturday", name: "Saturday" },
    { id: "sunday", name: "Sunday" },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-[#008753]"></div>
            <p className="font-medium text-sm text-[#008753]">
              SEASONAL OFFERINGS
            </p>
            <div className="w-8 h-[2px] bg-[#008753]"></div>
          </div>

          <h2 className="prata-regular text-4xl text-[#008753] mb-4">
            Our <span className="text-amber-600">Dynamic Menu</span>
          </h2>

          <p className="text-gray-700 max-w-xl mx-auto">
            Experience authentic African/Caribbean dishes that rotate based on
            seasonality and traditional preparation schedules
          </p>
        </div>

        {/* Day Selector */}
        <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-shrink-0 px-6 py-3 mr-4 rounded-full ${
                selectedDay === day.id
                  ? "bg-[#008753] text-white"
                  : "bg-white text-[#008753] border border-[#008753]"
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>

        {/* Menu Content */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left - Concept Explanation */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[2px] bg-amber-600"></div>
                <h3 className="prata-regular text-2xl text-amber-600">
                  Traditional Cooking Schedule
                </h3>
              </div>

              <div className="space-y-6">
                <p className="text-gray-700">
                  At the heart of African/Caribbean culinary tradition is the
                  understanding that certain dishes require specific preparation
                  days. We honor this tradition by rotating our menu based on
                  the day of the week.
                </p>

                <div className="bg-[#008753]/5 rounded-xl p-6">
                  <h4 className="prata-regular text-lg text-[#008753] mb-2">
                    Why We Rotate Our Menu
                  </h4>
                  <p className="text-gray-700">
                    Some traditional dishes require multiple days of preparation
                    - from soaking ingredients to slow-cooking methods. Others
                    are traditionally enjoyed on specific days of the week. Our
                    dynamic menu ensures each dish is prepared with the proper
                    time and respect it deserves.
                  </p>
                </div>

                <div className="flex items-start gap-4 mt-8">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-[#008753] text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="prata-regular">✓</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="prata-regular text-lg text-[#008753] mb-1">
                      Market Fresh Ingredients
                    </h4>
                    <p className="text-gray-700">
                      Our menu also depends on the freshest ingredients
                      available at local markets each morning. This means our
                      offerings change naturally with the seasons.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-[#008753] text-white w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="prata-regular">✓</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="prata-regular text-lg text-[#008753] mb-1">
                      Weekly Specials
                    </h4>
                    <p className="text-gray-700">
                      Each day features 2-3 special dishes that are only
                      available on that specific day of the week, prepared
                      according to traditional schedules.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual Calendar */}
            <div className="w-full lg:w-1/2 bg-[#008753]/5 p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-[2px] bg-[#008753]"></div>
                <h3 className="prata-regular text-2xl text-[#008753]">
                  Weekly Specials Calendar
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {days.slice(1).map((day) => (
                  <div
                    key={day.id}
                    className={`p-5 rounded-xl cursor-pointer transition-all ${
                      selectedDay === day.id
                        ? "bg-[#008753] text-white"
                        : "bg-white hover:bg-[#008753]/10"
                    }`}
                    onClick={() => setSelectedDay(day.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="prata-regular text-lg">{day.name}</h4>
                      <span className="text-sm">
                        {selectedDay === day.id ? "Viewing" : "View"} Specials
                      </span>
                    </div>

                    <div
                      className={`mt-3 ${selectedDay === day.id ? "text-amber-100" : "text-gray-600"}`}
                    >
                      <p className="flex items-center gap-2">
                        <span>•</span> Features traditional dishes specific to
                        this day
                      </p>
                      <p className="flex items-center gap-2">
                        <span>•</span> Prepared according to weekly cooking
                        schedule
                      </p>
                      <p className="flex items-center gap-2">
                        <span>•</span> Based on ingredient availability
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-white rounded-xl p-6 border border-[#008753]/30">
                <h4 className="prata-regular text-lg text-[#008753] mb-2">
                  How To Discover Today's Specials
                </h4>
                <p className="text-gray-700 mb-4">
                  Check our menu daily to see which traditional dishes we're
                  featuring. You can also sign up for our newsletter to receive
                  weekly specials in advance.
                </p>
                <Link
                  to="/menu"
                  className="px-4 py-2 bg-[#008753] text-white rounded-lg text-sm hover:bg-[#006641] transition-colors"
                >
                  <button>View Today's Menu</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicMenu;
