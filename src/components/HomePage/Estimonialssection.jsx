import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import '../../style/Homepagestyle.css'; // Ensure the path is correct
import client1 from '../../images/img-client2.jpg';
import client2 from '../../images/img-client2.jpg';
import client3 from '../../images/img-client2.jpg';

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="overlay"></div>
      <div className="container">
        <div className="section-header">
          <span className="section-label">TESTIMONIAL</span>
          <h2 className="section-title">Kind Words From Clients</h2>
        </div>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p className="testimonial-text">
              "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts."
            </p>
            <div className="client-info">
              <img src={client1} alt="Roger Scott" className="client-image" />
              <div className="client-details">
                <h4 className="client-name">Roger Scott</h4>
                <span className="client-position">Marketing Manager</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p className="testimonial-text">
              "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts."
            </p>
            <div className="client-info">
              <img src={client2} alt="Sarah Johnson" className="client-image" />
              <div className="client-details">
                <h4 className="client-name">Sarah Johnson</h4>
                <span className="client-position">Editorial Director</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p className="testimonial-text">
              "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts."
            </p>
            <div className="client-info">
              <img src={client3} alt="Michael Chen" className="client-image" />
              <div className="client-details">
                <h4 className="client-name">Michael Chen</h4>
                <span className="client-position">Creative Director</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pagination-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

