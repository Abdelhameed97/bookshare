
import React from "react";
import  Navbar from "../components/HomePage/Navbar";
import Hero from "../components/HomePage/Hero";
import Blog from "../components/HomePage/Blog";
import Footer from "../components/HomePage/Footer";
import Categories from "../components/HomePage/Categories"; // Fixed import name
import Welcome from "../components/HomePage/Welcome"; // Assuming you have a Welcome component 
import NewReleases from "../components/HomePage/NewRelease";
import Estimonialssection from "../components/HomePage/Estimonialssection"; // Assuming you have a testimonials section component


 const Home = () => {
  return (
    <>
      <Navbar />
       <Hero />
      <Categories /> 
      <Welcome /> 
      <NewReleases />
      <Blog />
      <Estimonialssection />
      <Footer />



      
       
    
    </>
  );
};

export default Home;
