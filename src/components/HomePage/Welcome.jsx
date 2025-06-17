import React from 'react';
import '../../style/Homepagestyle.css';
import rightImage from '../../images/therapist_23-2147990615.jpg';

const WelcomeSection = () => {
  return (
    <section className="welcome-section">
      <div className="welcome-container">
        <div className="image-side">
          <img src={rightImage} alt="Publishing Company" className="side-image" />
        </div>

        <div className="text-content">
          <div className="welcome-header">
            <h1 className="welcome-title">WELCOME TO PUBLISHING COMPANY</h1>
            <h2 className="welcome-subtitle">Publishing Company Created By Authors</h2>
          </div>
          
          <div className="welcome-content">
            <p className="welcome-text">
              A small river named Duden flows by their place and supplies it with the necessary regelidia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.
            </p>
            <p className="welcome-text">
              On her way she met a copy. The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.
            </p>
            
            <div className="divider"></div>
            
            <button className="welcome-button">
              View All Our Authors
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;