"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa"
import SearchModal from './SearchModal'
import '../../style/Homepagestyle.css';
import { useCart } from "../../hooks/useCart";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navLinks = [
    { to: "/", label: "HOME", active: true },
    { to: "/about", label: "ABOUT" },
    { to: "/coming-soon", label: "COMING SOON" },
    { to: "/top-seller", label: "TOP SELLER" },
    { to: "/books", label: "BOOKS" },
    { to: "/author", label: "AUTHOR" },
    { to: "/blog", label: "BLOG" },
    { to: "/contact", label: "CONTACT" },
  ]

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const closeMobileMenu = () => {
    setIsOpen(false)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const navigate = useNavigate();

  const { cartCount, loading } = useCart();

  return (
    <>
      <header className="bookshare-navbar">
        {/* Company Title */}
        <div className="navbar-header">
          <div className="navbar-content-wrapper">
            <div className="navbar-header-container">
              <Link to="/" className="company-title-link">
                <h1 className="company-title">
                  Book<span className="company-title-accent">Share</span>
                </h1>
                <p className="company-subtitle">
                  Publishing Excellence Since 2024
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="navbar-nav">
          <div className="navbar-content-wrapper">
            <div className="navbar-content">
              {/* Desktop Navigation - Left Side */}
              <div className="nav-links-desktop">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`nav-link ${link.active ? "active" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Right Side Actions - Positioned at the edge */}
              <div className="navbar-actions">
                {/* Search Icon */}
                <button
                  className="icon-button"
                  title="Search"
                  onClick={toggleSearch}
                >
                  <FaSearch size={18} />
                  <span className="sr-only">Search</span>
                </button>

                {/* Shopping Cart */}
                <button
                  className="icon-button cart-badge"
                  title="Shopping Cart"
                  onClick={() => navigate("/cart")}
                >
                  <FaShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="cart-count">{cartCount}</span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </button>

                {/* Auth Buttons - Desktop */}
                <div className="auth-buttons-desktop">
                  <Link to="/login" className="btn btn-outline">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Register
                  </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  className="mobile-menu-toggle icon-button"
                  onClick={toggleMobileMenu}
                  title="Menu"
                >
                  <FaBars size={20} />
                  <span className="sr-only">Toggle menu</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Menu Overlay */}
      <div
        className={`overlay ${isOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {/* Close Button */}
          <button
            className="icon-button mobile-close-button"
            onClick={closeMobileMenu}
            title="Close Menu"
          >
            <FaTimes size={20} />
          </button>

          {/* Mobile Auth Buttons */}
          <div className="mobile-auth-section">
            <Link
              to="/register"
              className="btn btn-primary"
              onClick={closeMobileMenu}
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="btn btn-outline"
              onClick={closeMobileMenu}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={closeMobileMenu}
                className={`mobile-nav-link ${link.active ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Account Links */}
          <div className="mobile-account-section">
            <Link
              to="/profile"
              className="mobile-account-link"
              onClick={closeMobileMenu}
            >
              My Profile
            </Link>
            <Link
              to="/orders"
              className="mobile-account-link"
              onClick={closeMobileMenu}
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar
