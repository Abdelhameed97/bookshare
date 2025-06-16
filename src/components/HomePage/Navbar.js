import React from 'react';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import '../../style/Homepagestyle.css';

const Navbar = () => {
  return (
    <header className="publishing-company-navbar">
      {/* Company Name - Top Line */}
      <div className="company-title">
        <h1>BookShare</h1>
      </div>

      {/* Navigation Links - Bottom Line */}
      <nav className="main-navigation">
        <div className="container">
          <ul className="nav-links">
            <li><a href="#" className="active">HOME</a></li>
            <li><a href="#">ABOUT</a></li>
            <li><a href="#">COMING SOON</a></li>
            <li><a href="#">TOP SELLER</a></li>
            <li><a href="#">BOOKS</a></li>
            <li><a href="#">AUTHOR</a></li>
            <li><a href="#">BLOG</a></li>
            <li><a href="#">CONTACT</a></li>
          </ul>

          {/* Icons on the right */}
          <div className="nav-icons">
            <a href="#"><FaSearch /></a>
            <a href="#"><FaShoppingCart /></a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;