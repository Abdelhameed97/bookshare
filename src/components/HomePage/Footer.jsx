import React from 'react';
import { FaTwitter, FaFacebookF, FaInstagram, FaArrowRight, FaMapMarkerAlt, FaPhone, FaPaperPlane } from 'react-icons/fa';


// import '../../style/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Connect Column */}
          <div className="footer-column">
            <h3 className="footer-title">Connect</h3>
            <p className="footer-description">
              Stay connected with us through our social media channels for the latest updates and news.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
            </div>
          </div>

          {/* Extra Links Column */}
          <div className="footer-column">
            <h3 className="footer-title">Extra Links</h3>
            <ul className="footer-links">
              <li><FaArrowRight className="link-icon" /> <a href="#">Affiliate Program</a></li>
              <li><FaArrowRight className="link-icon" /> <a href="#">Business Services</a></li>
              <li><FaArrowRight className="link-icon" /> <a href="#">Education Services</a></li>
              <li><FaArrowRight className="link-icon" /> <a href="#">Gift Cards</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-links">
              <li><a href="#">Join Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Privacy & Policy</a></li>
              <li><a href="#">Term & Conditions</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-column">
            <h3 className="footer-title">Have a Question?</h3>
            <ul className="footer-contact">
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>203 Fake St. Mountain View, San Francisco, California, USA</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <span>+2 392 3929 210</span>
              </li>
              <li>
                <FaPaperPlane className="contact-icon" />
                <span>info@yourdomain.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <p className="copyright">
            Copyright ©2025 All rights reserved | This template is made with ❤️ by BookShare.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;