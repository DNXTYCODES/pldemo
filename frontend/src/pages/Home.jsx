import React from "react";
import Hero from "../components/Hero";
import CommunityBanner from "../components/CommunityBanner";
import PhotoTabs from "../components/PhotoTabs";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import PopularPhotos from "../components/PopularPhotos";
import EditorsChoice from "../components/EditorsChoice";
import PhotoStories from "../components/PhotoStories";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";
import FeaturedSection from "../components/Featured";
import FlyboyBanner from "../components/FlyboyBanner";
import FeaturedMeals from "../components/FeaturedMeals";
import CustomerReviews from "../components/CustomerReviews";
import LoyaltyProgram from "../components/LoyaltyProgram";
import DynamicMenu from "../components/DynamicMenu";
import FeaturedPhotographers from "../components/FeaturedPhotographers";

const Home = () => {
  return (
    <div className="bg-white">
      <Hero />
      <CommunityBanner />
      <PhotoTabs />
      {/* <LatestColection/>
      <BestSeller/>l */}
      <PopularPhotos />
      <EditorsChoice />
      <FeaturedPhotographers />
      <PhotoStories />
      {/* <CustomerReviews /> */}
      {/* <LoyaltyProgram />
      <DynamicMenu />
      <FeaturedMeals/> */}
      {/* <FeaturedSection /> */}
      {/* <FlyboyBanner /> */}
      {/* <OurPolicy /> */}
      <NewsletterBox />  
    </div>
  );
};

export default Home;
