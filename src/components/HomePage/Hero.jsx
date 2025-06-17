import React from 'react';
import '../../style/Homepagestyle.css';
import heroImage from '../../images/Depositphotos_108416494_m-2015.jpg'; // Adjust the path as necessary

const HeroSection = () => {
  return (
    <section className="publishing-hero">
      <div className="hero-image-container">
        <img src={heroImage} alt="Featured Book" className="hero-full-width-image" />
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-subtitle animate-fadeIn">New Release</span>
            <h1 className="hero-title animate-slideUp">The Story</h1>
            <p className="hero-text animate-fadeIn">
              A novel about the power of storytelling and the imagination
            </p>
            <div className="hero-buttons animate-fadeIn">
              <a href="#" className="btn-primary">Buy Now</a>
              <a href="#" className="btn-secondary">View All Books</a>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;