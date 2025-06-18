import React from 'react';
import HomePageTitle from '../shared/HomePageTitle';
import Testimonials from '../HomePage/Estimonialssection';
import HomePageButton from '../shared/HomePageButton';
import '../../style/Homepagestyle.css';
import '../../style/about.css';
import Footer from '../HomePage/Footer';
import Welcome from '../HomePage/Welcome';
import Navbar from '../HomePage/Navbar';

const About = () => {
  return (
    <>
    <Navbar />
    <div className="about-hero-banner-full">
    {/* <div className="about-hero-img">
      <img
        src="https://www.shutterstock.com/image-photo/phone-icon-email-address-live-260nw-2338078029.jpg"
        alt="Books"
      />
    </div> */}
    <div className="about-hero-content">
      
      <h1 className="about-hero-title">About Us</h1>
    </div>
  </div>


    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero-section">
      <div className="about-hero-container">
        <div className="about-subtitle">WELCOME TO BOOK PUBLISHING COMPANY</div>
        <h1 className="about-title">Welcome to Publishing Company</h1>
        <p className="about-intro">
          Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.
          Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named
          Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted
          parts of sentences fly into your mouth.
        </p>
        <div className="about-quote-block">
          <span className="about-quote-icon">❝</span>
          <span className="about-quote-text">
            Good friends, good books, and a sleepy conscience: this is the ideal life.
          </span>
        </div>
        <p className="about-intro">
          When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown
          Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric
          question ran over her cheek, then she continued her way.
        </p>
      </div>
      </div>

      {/* Team/Testimonials Section */}
      <Welcome />
      <Testimonials />
      <Footer />
      </div>
    </>

    
    
  );
};

export default About;