// import React from 'react';
// import '../../style/Homepagestyle.css';
// import rightImage from '../../images/therapist_23-2147990615.jpg';

// const WelcomeSection = () => {
//   return (
//     <section className="welcome-section">
//       <div className="welcome-container">
//         <div className="image-side">
//           <img src={rightImage} alt="Publishing Company" className="side-image" />
//         </div>

//         <div className="text-content">
//           <div className="welcome-header">
//             <h1 className="welcome-title">WELCOME TO PUBLISHING COMPANY</h1>
//             <h2 className="welcome-subtitle">Publishing Company Created By Authors</h2>
//           </div>
          
//           <div className="welcome-content">
//             <p className="welcome-text">
//               A small river named Duden flows by their place and supplies it with the necessary regelidia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.
//             </p>
//             <p className="welcome-text">
//               On her way she met a copy. The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.
//             </p>
            
//             <div className="divider"></div>
            
//             <button className="welcome-button">
//               View All Our Authors
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WelcomeSection;




"use client"
import '../../style/Homepagestyle.css';
import rightImage from '../../images/therapist_23-2147990615.jpg';

const WelcomeSection = () => {
  return (
    <section className="welcome-section">
      <div className="welcome-container">
        {/* Image Side */}
        <div className="image-side">
          <div className="image-wrapper">
            <img
 src={rightImage} 
              alt="Publishing Company - Authors at work"
              className="side-image"
            />
            <div className="image-overlay"></div>
            <div className="floating-badge">
              <span className="badge-text">Est. 2020</span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-content">
          <div className="welcome-header">
          
            <h1 className="welcome-title">
              Publishing Company
              <span className="title-highlight">Created By Authors</span>
            </h1>
            <h2 className="welcome-subtitle">Where Stories Come to Life Through Expert Publishing</h2>
          </div>

          <div className="welcome-content">
            <p className="welcome-text primary">
              We are a passionate community of authors and publishers dedicated to bringing exceptional stories to
              readers worldwide. Our mission is to transform manuscripts into masterpieces that captivate and inspire.
            </p>
            <p className="welcome-text secondary">
              From emerging voices to established authors, we provide comprehensive publishing services that honor the
              craft of storytelling while embracing modern publishing innovations.
            </p>


           
            <div className="action-buttons">
              <button className="welcome-button primary">
                <span className="button-text">View All Our Authors</span>
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className="welcome-button secondary">
                <span className="button-text">Our Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="bg-decoration decoration-1"></div>
      <div className="bg-decoration decoration-2"></div>
      <div className="bg-decoration decoration-3"></div>
    </section>
  )
}

export default WelcomeSection
