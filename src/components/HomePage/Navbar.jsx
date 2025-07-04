"use client";

import { useState, useEffect, useMemo, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchModal from "./SearchModal";
import "../../style/Homepagestyle.css";
import "../../style/Notifications.css";
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
  FaBell,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import { useCartContext } from "../../contexts/CartContext";
import { useWishlistContext } from "../../contexts/WishlistContext";
import { useOrderContext } from "../../contexts/OrderContext";
import useTranslation from "../../hooks/useTranslation";
import LanguageSwitcher from "../shared/LanguageSwitcher";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navLocation = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Get context values correctly
  const { cartCount } = useCartContext();
  const { wishlistCount } = useWishlistContext();
  const { orders = [], pendingOrdersCount, fetchOrders } = useOrderContext();

  const isLibraryOwner = user?.role === "owner";

  const { t, language } = useTranslation();

  const [showClientNotifications, setShowClientNotifications] = useState(false);

  const [readNotifications, setReadNotifications] = useState(() => {
    const stored = localStorage.getItem('readNotifications');
    return stored ? JSON.parse(stored) : [];
  });

  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  // Avatar images based on user role and gender
  const getAvatarImage = (user) => {
    if (!user) return null;
    // If owner and has a library_logo, show it
    if (user.role === "owner" && user.owner && user.owner.library_logo) {
      return `${process.env.REACT_APP_API_URL || ""}/storage/${
        user.owner.library_logo
      }`;
    }
    // Otherwise fallback to default avatar by role/gender
    const isMale = user.gender === "male" || !user.gender;
    switch (user.role) {
      case "admin":
        return "https://cdn.vectorstock.com/i/1000v/37/11/man-manager-administrator-consultant-avatar-vector-35753711.jpg";
      case "owner":
        return isMale
          ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTslXAW6sPGW_hBPruTQwtsCeLQHqxeJEdiag&s"
          : "https://img.freepik.com/premium-vector/business-woman-character-vector-illustration_1133257-2432.jpg?semt=ais_hybrid&w=740";
      case "client":
        return isMale
          ? "https://cdn3.iconfinder.com/data/icons/3d-printing-icon-set/512/User.png"
          : "https://img.freepik.com/premium-vector/woman-spa-client-icon-flat-color-style_755164-819.jpg";
      default:
        return "https://cdn3.iconfinder.com/data/icons/3d-printing-icon-set/512/User.png";
    }
  };

  const regularNavLinks = [
    { to: "/", label: "home", icon: FaHome },
    { to: "/about", label: "about", icon: FaInfoCircle },
    { to: "/books", label: "books", icon: FaBook },
    { to: "/edit-client-profile", label: "Profile", icon: FaUserEdit },
    { to: "/contact", label: "contact", icon: FaEnvelope },
  ];

  const ownerNavLinks = [
    { to: "/dashboard", label: "dashboard", icon: FaTachometerAlt },
    { to: "/add-book", label: "Book", icon: FaBook },
    { to: "/libraries", label: "Libraries", icon: FaBook },
    { to: "/all-orders", label: "orders", icon: FaBoxOpen },
  ];

  const adminNavLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { to: "/admin/users", label: "users", icon: FaUser },
    { to: "/admin/categories", label: "categories", icon: FaBook },
    { to: "/admin/books", label: "books", icon: FaBook },
    { to: "/admin/orders", label: "orders", icon: FaBoxOpen },
  ];

  const navLinks = user?.role === "admin"
    ? adminNavLinks
    : isLibraryOwner
      ? ownerNavLinks
      : regularNavLinks;
      

  const toggleMobileMenu = () => setIsOpen(!isOpen);
  const closeMobileMenu = () => setIsOpen(false);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  // Add a state to force re-render on storage event
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
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
    // Listen for storage changes to update avatar instantly
    const handleStorage = () => {
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
      setAvatarKey((prev) => prev + 1); // force re-render
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Listen for changes in readNotifications to update notification count
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('readNotifications');
      if (stored) {
        setReadNotifications(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notificationRead", handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationRead', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleProtectedAction = (path) => {
    if (!user) {
      navigate("/login", { state: { from: path } });
      return;
    }
    navigate(path);
  };

  // Notifications for client
  const clientOrderNotifications = useMemo(() => {
    if (!user || user.role !== 'client' || !orders) return [];
    // Only show notifications for orders that are not pending
    return orders
      .filter(order => order.status === 'accepted' || order.status === 'rejected')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [user, orders]);

  const unreadNotifications = useMemo(() => {
    if (!user || user.role !== 'client' || !orders) return [];
    return clientOrderNotifications.filter(n => !readNotifications.includes(n.id));
  }, [user, orders, clientOrderNotifications, readNotifications]);

  const handleShowNotifications = async () => {
    if (!showClientNotifications) {
      await fetchOrders(); // fetch latest orders before showing notifications
    }
    setShowClientNotifications(v => !v);
  };

  const handleNotificationView = (orderId) => {
    const updated = [...readNotifications, orderId];
    setReadNotifications(updated);
    localStorage.setItem('readNotifications', JSON.stringify(updated));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('notificationRead', {
      detail: { orderId: orderId }
    }));
  };

  const avatarImage = getAvatarImage(user);

  return (
    <>
      <header className="bookshare-navbar">
        <div className="navbar-header">
          <div className="navbar-content-wrapper">
            <div className="navbar-header-container">
              <Link to="/" className="company-title-link">
                <h1 className="company-title">
                  {t('book')}<span className="company-title-accent">{t('share')}</span>
                </h1>
                <p className="company-subtitle">
                  {t('publishingExcellence')}
                </p>
              </Link>
            </div>
          </div>
        </div>

        <nav className="navbar-nav">
          <div className="navbar-content-wrapper">
            <div className="navbar-content">
              <div className="nav-links-desktop">
                {navLinks.map((link) => {
                  const isActive = navLocation.pathname === link.to;
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
                      {t(link.label)}
                    </Link>
                  );
                })}
              </div>

              <div className="navbar-actions">
                <button
                  className="icon-button"
                  title={t('search')}
                  onClick={toggleSearch}
                >
                  <FaSearch size={18} />
                </button>

                <LanguageSwitcher />

                {/* Client Notifications Bell */}
                {user?.role === 'client' && (
                  <div className="client-notification-section">
                    <button
                      className="icon-button client-notification-btn"
                      title={t('notifications')}
                      onClick={handleShowNotifications}
                    >
                      <FaBell size={20} />
                      {unreadNotifications.length > 0 && (
                        <span className="client-notification-badge">{unreadNotifications.length}</span>
                      )}
                    </button>
                    {showClientNotifications && (
                      <div className="client-notification-dropdown">
                        <h4>Order Updates</h4>
                        <div className="client-notifications-scroll-container">
                          {unreadNotifications.length === 0 ? (
                            <div className="no-notifications">No notifications</div>
                          ) : (
                            unreadNotifications
                              .slice(0, 2)
                              .map((order, index) => (
                                <div
                                  key={order.id}
                                  className={`client-notification-item ${
                                    index === 0 ? "first-notification" : ""
                                  }`}
                                >
                                  <div className="client-notification-row">
                                    <span className="client-notif-icon">
                                      {order.status === "accepted"
                                        ? "✅"
                                        : "❌"}
                                    </span>
                                    <span className="client-notification-message">
                                      Your order for{" "}
                                      <span className="client-notif-book">
                                        "
                                        {order.order_items?.[0]?.book?.title ||
                                          "a book"}
                                        "
                                      </span>{" "}
                                      was
                                      <span
                                        className={
                                          order.status === "accepted"
                                            ? "notif-accepted"
                                            : "notif-rejected"
                                        }
                                      >
                                        {order.status === "accepted"
                                          ? " accepted"
                                          : " rejected"}
                                      </span>
                                    </span>
                                    {index === 0 && (
                                      <span className="new-badge">new</span>
                                    )}
                                  </div>
                                  <div className="client-notification-meta">
                                    <small>
                                      {new Date(
                                        order.updated_at
                                      ).toLocaleString()}
                                    </small>
                                    <Link
                                      to={`/orders/${order.id}`}
                                      className="client-notification-link-btn"
                                      onClick={() =>
                                        handleNotificationView(order.id)
                                      }
                                    >
                                      View
                                    </Link>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                        {unreadNotifications.length > 0 && (
                          <div className="client-view-all-notifications">
                            <Link to="/client-notifications" className="client-view-all-link">
                              View All Notifications ({unreadNotifications.length})
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {user?.role !== "admin" && !isLibraryOwner && (
                  <>
                    <button
                      className="icon-button wishlist-badge"
                      title={t('wishlist')}
                      onClick={() => handleProtectedAction("/wishlist")}
                    >
                      <FaHeart size={18} />
                      {wishlistCount > 0 && (
                        <span className="wishlist-count">{wishlistCount}</span>
                      )}
                    </button>

                    <button
                      className="icon-button order-badge"
                      title={t('orders')}
                      onClick={() => handleProtectedAction("/orders")}
                    >
                      <FaBoxOpen size={18} />
                      {pendingOrdersCount > 0 && (
                        <span className="order-count">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </button>

                    <button
                      className="icon-button cart-badge"
                      title={t('cart')}
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
                      title={t('dashboard')}
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
                      title={t('editProfile')}
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

                <div className="auth-buttons-desktop">
                  {!user ? (
                    <>
                      <Link to="/login" className="btn btn-outline">
                        {t('signIn')}
                      </Link>
                      <Link to="/register" className="btn btn-primary">
                        {t('register')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="user-avatar-section">
                        <img
                          key={avatarKey}
                          src={avatarImage}
                          alt="User Avatar"
                          className="user-avatar"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #e5e7eb",
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                            marginRight: 8,
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                          onClick={() => setIsOpen(true)}
                        />
                        <div
                          className="user-info"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#222",
                              fontSize: "1.05rem",
                              lineHeight: 1,
                            }}
                          >
                            {user.name?.split(" ")[0] || t("user")}
                          </span>
                          {isLibraryOwner && (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "#3B82F6",
                                fontWeight: 600,
                              }}
                            >
                              {t("libraryOwner")}
                            </span>
                          )}
                          {user.role === "admin" && (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "#EF4444",
                                fontWeight: 600,
                              }}
                            >
                              Administrator
                            </span>
                          )}
                          {user.role === "client" && (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "#10B981",
                                fontWeight: 600,
                              }}
                            >
                              Client
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="mobile-menu-toggle icon-button"
                  onClick={toggleMobileMenu}
                  title={t('menu')}
                >
                  <FaBars size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <div
        className={`overlay ${isOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <button
            className="icon-button mobile-close-button"
            onClick={closeMobileMenu}
            title={t('closeMenu')}
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
                  {t('register')}
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={closeMobileMenu}
                >
                  {t('signIn')}
                </Link>
              </>
            ) : (
              <>
                <div
                  className="mobile-user-avatar-section"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <img
                    key={avatarKey}
                    src={avatarImage}
                    alt="User Avatar"
                    className="mobile-user-avatar"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e5e7eb",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#222",
                      fontSize: "1rem",
                      textAlign: "center",
                      marginBottom: 2,
                    }}
                  >
                    {user.name?.split(" ")[0] || t("user")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: isLibraryOwner
                        ? "#3B82F6"
                        : user.role === "admin"
                        ? "#EF4444"
                        : "#10B981",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {isLibraryOwner && t("libraryOwner")}
                    {user.role === "admin" && "Administrator"}
                    {user.role === "client" && "Client"}
                  </span>
                </div>
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
                  {t('logout')}
                </button>
              </>
            )}
          </div>

          <div className="mobile-nav-links">
            {navLinks.map((link) => {
              const isActive = navLocation.pathname === link.to;
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
                  {t(link.label)}
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
                  {t('wishlist')} ({wishlistCount})
                </Link>
                <Link
                  to="/cart"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                >
                  {t('cart')} ({cartCount})
                </Link>
                <Link
                  to="/orders"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                >
                  {t("orders")} ({pendingOrdersCount})
                </Link>
                <Link
                  to="/client-notifications"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                >
                  <FaBell size={16} style={{ marginRight: "0.5rem" }} />
                  Notifications ({unreadNotifications.length})
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
                  {t('dashboard')}
                </Link>
                <Link
                  to="/edit-profile"
                  className="mobile-account-link"
                  onClick={closeMobileMenu}
                  style={{ color: "#10B981", fontWeight: 600 }}
                >
                  <FaUserEdit size={16} style={{ marginRight: "0.5rem" }} />
                  {t('editProfile')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showProfileSidebar && (
        <div
          className="profile-sidebar-overlay"
          onClick={() => setShowProfileSidebar(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 1000,
          }}
        >
          <div
            className="profile-sidebar"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 270,
              height: "100vh",
              background: "#fff",
              boxShadow: "-2px 0 16px rgba(0,0,0,0.08)",
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
              padding: "1.5rem 1.2rem 1.2rem 1.2rem",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <FaBars size={22} />
              <button
                onClick={() => setShowProfileSidebar(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <img
                src={avatarImage}
                alt="User Avatar"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
                  marginBottom: 6,
                }}
              />
              <span style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</span>
              {isLibraryOwner && (
                <span
                  style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600 }}
                >
                  {t("libraryOwner")}
                </span>
              )}
              {user.role === "admin" && (
                <span
                  style={{ fontSize: 13, color: "#EF4444", fontWeight: 600 }}
                >
                  Administrator
                </span>
              )}
              {user.role === "client" && (
                <span
                  style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}
                >
                  Client
                </span>
              )}
            </div>
            <hr
              style={{
                margin: "1rem 0",
                border: 0,
                borderTop: "1px solid #e5e7eb",
              }}
            />
            <button
              className="btn"
              style={{
                background: "#EF4444",
                color: "white",
                fontWeight: 600,
                borderRadius: "2rem",
                padding: "0.4rem 1.2rem",
                border: "none",
                width: "100%",
                marginTop: 10,
              }}
              onClick={() => {
                handleLogout();
                setShowProfileSidebar(false);
              }}
            >
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;