import React from "react";
import Hero from "../components/Hero";
import CommunityBanner from "../components/CommunityBanner";
import PhotoTabs from "../components/PhotoTabs";
import PopularPhotos from "../components/PopularPhotos";
import AmbassadorsPick from "../components/AmbassadorsPick";
import FeaturedPhotographers from "../components/FeaturedPhotographers";
import Categories from "../components/Categories";
import NewsletterBox from "../components/NewsletterBox";

const Home = () => {
  return (
    <div className="bg-white">
      <Hero />
      <CommunityBanner />
      <PhotoTabs />
      <PopularPhotos />
      <AmbassadorsPick />
      <FeaturedPhotographers />
      <Categories />
      <NewsletterBox />
    </div>
  );
};

export default Home;
