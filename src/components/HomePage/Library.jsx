import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { BookOpen, MapPin, Star, Loader2 } from "lucide-react";
import HomePageTitle from "../shared/HomePageTitle";
import "../../style/Homepagestyle.css";
import apiService from "../../services/api";

const Library = () => {
  const [libraries, setLibraries] = useState([]); // أضف هذا السطر
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLibraries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [librariesResponse, booksResponse] = await Promise.all([
        apiService.get("/libraries"),
        apiService.get("/books"),
      ]);

      const books = booksResponse.data.data;
      const librariesData = librariesResponse.data.data.map((owner) => {
        const ownerBooks = books.filter((book) => book.user_id === owner.id);
        const ratings = ownerBooks.flatMap((book) => book.ratings || []);

        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
        const avgRating =
          ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : 0;

        return {
          id: owner.id,
          name: owner.name,
          address: owner.location,
          totalBooks: ownerBooks.length,
          avgRating,
          totalReviews: ratings.length,
          image: ownerBooks[0]?.images?.[0]
            ? ownerBooks[0].images[0].startsWith("http")
              ? ownerBooks[0].images[0]
              : `${
                  process.env.REACT_APP_API_URL || "http://localhost:8000"
                }/storage/${ownerBooks[0].images[0]}`
            : "/placeholder-library.png",
        };
      });

      setLibraries(librariesData); // تحديث حالة libraries
    } catch (err) {
      console.error("Error fetching libraries:", err);
      setError(err.response?.data?.message || "Failed to load libraries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  if (loading) {
    return (
      <div
        className="books-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <HomePageTitle>Discovering Libraries...</HomePageTitle>
        <div className="loading-spinner" style={{ margin: "1rem 0" }}>
          <Loader2 size={36} className="spin" />
        </div>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Loading amazing libraries for you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-page">
        <div className="books-container">
          <div className="error-section">
            <HomePageTitle>Error loading libraries</HomePageTitle>
            <p className="error-message">{error}</p>
            <button onClick={fetchLibraries} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div className="text-center">
        <HomePageTitle>Libraries</HomePageTitle>
      </div>

      <div className="books-display grid" style={{ marginBottom: "2rem" }}>
        {libraries.slice(0, 3).map((library, index) => (
          <div
            key={library.id}
            className="book-card library-card"
            style={{
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              animation: "fadeIn 0.5s forwards",
            }}
          >
            <div className="library-badge">
              <Star size={14} fill="#fff" />
              <span>{library.avgRating}</span>
            </div>

            <div className="book-image-container">
              <img
                src={library.image}
                alt={library.name}
                className="book-image"
                width="350"
                height="320"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-library.png";
                }}
              />
              <div className="image-overlay"></div>
              <div className="hover-actions">
                <Link
                  to={`/library/${library.id}`}
                  className="action-button view"
                  aria-label="View library"
                >
                  <BookOpen size={18} />
                </Link>
              </div>
            </div>

            <div className="book-content">
              <div className="book-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(library.avgRating)
                          ? "star filled"
                          : "star"
                      }
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {library.avgRating} ({library.totalReviews} reviews)
                </span>
              </div>

              <h3 className="book-title">{library.name}</h3>
              {library.address && (
                <p className="book-author">
                  <MapPin size={14} /> {library.address}
                </p>
              )}
              <div className="book-price">
                <span className="current-price">
                  <BookOpen size={14} /> {library.totalBooks} books
                </span>
              </div>
              <Link to={`/library/${library.id}`} className="add-to-cart-btn">
                View Library
                <BookOpen size={18} className="button-icon" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link to="/libraries" className="homepage-viewall-btn">
          View All Libraries
        </Link>
      </div>
    </div>
  );
};

export default Library;
