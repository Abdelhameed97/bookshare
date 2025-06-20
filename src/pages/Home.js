import React from "react";
import Hero from "../components/HomePage/Hero.jsx";
import Blog from "../components/HomePage/Blog.jsx";
import Footer from "../components/HomePage/Footer.jsx";
import Categories from "../components/HomePage/Categories.jsx";
import Welcome from "../components/HomePage/Welcome.jsx";
import NewReleases from "../components/HomePage/NewRelease.jsx";
import Estimonialssection from "../components/HomePage/Estimonialssection.jsx";

const Home = () => {
  return (
    <>
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
