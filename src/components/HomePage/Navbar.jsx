"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaHeart,
  FaBoxOpen,
  FaTachometerAlt,
  FaBook,
  FaUserEdit,
} from "react-icons/fa";
import SearchModal from "./SearchModal";
import "../../style/Homepagestyle.css";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const isLibraryOwner = user?.role === "owner";

  const regularNavLinks = [
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

  const ownerNavLinks = [
    { to: "/", label: "HOME" },
    { to: "/dashboard", label: "DASHBOARD", icon: FaTachometerAlt },
    { to: "/edit-profile", label: "EDIT PROFILE", icon: FaUserEdit },
    { to: "/add-book", label: "ADD BOOK", icon: FaBook },
  ];

  const navLinks = isLibraryOwner ? ownerNavLinks : regularNavLinks;

  const toggleMobileMenu = () => setIsOpen(!isOpen);
  const closeMobileMenu = () => setIsOpen(false);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleProtectedAction = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
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
              <div className="nav-links-desktop">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  const IconComponent = link.icon;
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
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
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
                      {IconComponent && <IconComponent size={16} />}
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="navbar-actions">
                <button className="icon-button" title="Search" onClick={toggleSearch}>
                  <FaSearch size={18} />
                </button>

                {!isLibraryOwner && (
                  <>
                    <button
                      className="icon-button wishlist-badge"
                      title="Wishlist"
                      onClick={() => handleProtectedAction("/wishlist")}
                    >
                      <FaHeart size={18} />
                      {wishlistCount > 0 && (
                        <span className="wishlist-count">{wishlistCount}</span>
                      )}
                    </button>

                    <button
                      className="icon-button cart-badge"
                      title="Shopping Cart"
                      onClick={() => handleProtectedAction("/cart")}
                    >
                      <FaShoppingCart size={18} />
                      {cartCount > 0 && (
                        <span className="cart-count">{cartCount}</span>
                      )}
                    </button>
                  </>
                )}

                {isLibraryOwner && (
                  <>
                    <button
                      className="icon-button"
                      title="Manage Books"
                      onClick={() => navigate("/dashboard")}
                      style={{
                        background: "#3B82F6",
                        color: "white",
                      }}
                    >
                      <FaBook size={18} />
                    </button>
                    <button
                      className="icon-button"
                      title="Edit Profile"
                      onClick={() => navigate("/edit-profile")}
                      style={{
                        background: "#10B981",
                        color: "white",
                      }}
                    >
                      <FaUserEdit size={18} />
                    </button>
                  </>
                )}

                <div className="auth-buttons-desktop" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
                          color: isLibraryOwner ? "#3B82F6" : "#10B981",
                          fontSize: "1.1rem",
                        }}
                      >
                        Welcome, {user.name || "User"}
                        {isLibraryOwner && (
                          <span style={{ fontSize: "0.8rem", display: "block", color: "#6B7280" }}>
                            Library Owner
                          </span>
                        )}
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

                <button className="mobile-menu-toggle icon-button" onClick={toggleMobileMenu} title="Menu">
                  <FaBars size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={closeMobileMenu}></div>

      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <button className="icon-button mobile-close-button" onClick={closeMobileMenu} title="Close Menu">
            <FaTimes size={20} />
          </button>

          <div className="mobile-auth-section">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                  Register
                </Link>
                <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontWeight: 600,
                    color: isLibraryOwner ? "#3B82F6" : "#10B981",
                    fontSize: "1.1rem",
                    textAlign: "center",
                  }}
                >
                  Welcome, {user.name || "User"}
                  {isLibraryOwner && (
                    <span style={{ fontSize: "0.8rem", display: "block", color: "#6B7280" }}>
                      Library Owner
                    </span>
                  )}
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
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`mobile-nav-link${isActive ? " active" : ""}`}
                  onClick={closeMobileMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {IconComponent && <IconComponent size={16} />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mobile-account-section">
            {!isLibraryOwner ? (
              <>
                <Link
                  to="/wishlist"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                >
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  to="/cart"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                >
                  Cart ({cartCount})
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                  style={{ color: "#3B82F6", fontWeight: 600 }}
                >
                  <FaTachometerAlt size={16} style={{ marginRight: "0.5rem" }} />
                  Dashboard
                </Link>
                <Link
                  to="/edit-profile"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                  style={{ color: "#10B981", fontWeight: 600 }}
                >
                  <FaUserEdit size={16} style={{ marginRight: "0.5rem" }} />
                  Edit Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;