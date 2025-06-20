"use client";

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import SearchModal from './SearchModal'
import '../../style/Homepagestyle.css';

import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaHeart,
} from "react-icons/fa";
import "../../style/Homepagestyle.css";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";

const Navbar = () => {
  const [user, setUser] = useState(null);

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/about", label: "ABOUT" },
    { to: "/coming-soon", label: "COMING SOON" },
    { to: "/top-seller", label: "TOP SELLER" },
    { to: "/books", label: "BOOKS" },
    { to: "/author", label: "AUTHOR" },
    // { to: "/blog", label: "BLOG" },
    { to: "/contact", label: "CONTACT" },
  ];

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const navigate = useNavigate();

  useEffect(() => {
    // Try to get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    // Optionally: window.location.reload();
  };
  const { cartCount, loading: cartLoading } = useCart();
  const { wishlistCount, loading: wishlistLoading } = useWishlist();

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
              <div className="nav-links-desktop" style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '1.2rem',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
                width: 'auto',
                minWidth: 0,
                maxWidth: '100%',
              }}>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      className={`nav-link${isActive ? " active" : ""}`}
                      style={{
                        background: isActive ? '#90a4b8' : 'transparent',
                        color: isActive ? 'white' : '#222',
                        borderRadius: '2rem',
                        padding: '0.5rem 1.2rem',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'background 0.2s, color 0.2s',
                      }}
                      onMouseOver={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#e3e9f1';
                        }
                      }}
                      onMouseOut={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
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

                {/* Wishlist Icon */}
                <button
                  className="icon-button wishlist-badge"
                  title="Wishlist"
                  onClick={() => navigate("/wishlist")}
                >
                  <FaHeart size={18} />
                  {wishlistCount > 0 && (
                    <span className="wishlist-count">{wishlistCount}</span>
                  )}
                  <span className="sr-only">Wishlist</span>
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
                <div className="auth-buttons-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {!user ? (
                    <>
                      <Link to="/login" className="btn btn-outline">
                        Sign In
                      </Link>
                      <Link to="/register" className="btn btn-primary">
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 600, color: '#10B981', fontSize: '1.1rem' }}>
                        Welcome, {user.name || 'User'}
                      </span>
                      <button
                        className="btn"
                        style={{ background: '#EF4444', color: 'white', fontWeight: 600, borderRadius: '2rem', padding: '0.4rem 1.2rem', border: 'none' }}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  )}
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
            <Link
              to="/wishlist"
              className="mobile-account-link"
              onClick={closeMobileMenu}
            >
              My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
