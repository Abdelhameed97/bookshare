import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import SearchModal from "./SearchModal";
import "../../style/Homepagestyle.css";
import { useCart } from "../../hooks/useCart";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/about", label: "ABOUT" },
    { to: "/coming-soon", label: "COMING SOON" },
    { to: "/top-seller", label: "TOP SELLER" },
    { to: "/books", label: "BOOKS" },
    { to: "/author", label: "AUTHOR" },
    { to: "/contact", label: "CONTACT" },
    { to: "/rag-chat", label: "RAG CHAT" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const toggleMobileMenu = () => setIsOpen(!isOpen);
  const closeMobileMenu = () => setIsOpen(false);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <header className="bookshare-navbar">
        <div className="navbar-header">
          <div className="navbar-content-wrapper">
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

        <nav className="navbar-nav">
          <div className="navbar-content-wrapper">
            <div className="navbar-content">
              {/* Desktop Links */}
              <div className="nav-links-desktop">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      className={`nav-link${isActive ? " active" : ""}`}
                      style={{
                        background: isActive ? "#90a4b8" : "transparent",
                        color: isActive ? "white" : "#222",
                        borderRadius: "2rem",
                        padding: "0.5rem 1.2rem",
                        fontWeight: isActive ? 700 : 500,
                        transition: "background 0.2s, color 0.2s",
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#e3e9f1";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Right Actions */}
              <div className="navbar-actions">
                <button
                  className="icon-button"
                  title="Search"
                  onClick={toggleSearch}
                >
                  <FaSearch size={18} />
                </button>

                <button
                  className="icon-button cart-badge"
                  title="Shopping Cart"
                  onClick={() => navigate("/cart")}
                >
                  <FaShoppingCart size={18} />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </button>

                {/* Auth Buttons */}
                <div
                  className="auth-buttons-desktop"
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
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
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#10B981",
                          fontSize: "1.1rem",
                        }}
                      >
                        Welcome, {user.name}
                      </span>
                      <button
                        className="btn"
                        style={{
                          background: "#EF4444",
                          color: "white",
                          fontWeight: 600,
                          borderRadius: "2rem",
                          padding: "0.4rem 1.2rem",
                          border: "none",
                        }}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile Toggle */}
                <button
                  className="mobile-menu-toggle icon-button"
                  onClick={toggleMobileMenu}
                  title="Menu"
                >
                  <FaBars size={20} />
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

      {/* Overlay */}
      <div
        className={`overlay ${isOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <button
            className="icon-button mobile-close-button"
            onClick={closeMobileMenu}
            title="Close Menu"
          >
            <FaTimes size={20} />
          </button>

          <div className="mobile-auth-section">
            {!user ? (
              <>
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
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>
                  Hello, {user.name}
                </span>
                <button
                  className="btn"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={closeMobileMenu}
                className="mobile-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </div>

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
};

export default Navbar;
