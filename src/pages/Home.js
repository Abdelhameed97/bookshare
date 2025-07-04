import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/HomePage/Navbar.jsx";
import Hero from "../components/HomePage/Hero.jsx";
import Blog from "../components/HomePage/Blog.jsx";
import Footer from "../components/HomePage/Footer.jsx";
import Welcome from "../components/HomePage/Welcome.jsx";
import NewReleases from "../components/HomePage/NewRelease.jsx";
import Estimonialssection from "../components/HomePage/Estimonialssection.jsx";
import Categories from "../components/HomePage/Categories.jsx";
import Library from "../components/HomePage/Library.jsx";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "owner") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <Hero />
      <Categories/>
      <Welcome />
      <NewReleases />
      <Library />
      <Estimonialssection />
      <Footer />
    </>
  );
};

export default Home;
