"use client";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import HomePageTitle from "../shared/HomePageTitle";
import HomePageButton from "../shared/HomePageButton";
import "../../style/Homepagestyle.css";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const NewReleases = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { cartItems, fetchCartItems } = useCart();
  const { wishlistItems, fetchWishlist, addToWishlist, removeItem } = useWishlist();

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();

        const latestBooks = data.data.slice(0, 3).map((book) => ({
          id: book.id,
          user_id: book.user_id,
          image: book.images?.[0]
            ? book.images[0].startsWith("http")
              ? book.images[0]
              : `http://localhost:8000/storage/${book.images[0]}`
            : "/placeholder.svg?height=300&width=200",
          price: `$${book.price}`,
          originalPrice: book.rental_price ? `$${book.rental_price}` : null,
          title: book.title,
          author: `By ${book.user?.name || "Unknown Author"}`,
          rating: book.ratings?.length
            ? (
                book.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
                book.ratings.length
              ).toFixed(1)
            : 0,
          reviews: book.ratings?.length || 0,
          badge:
            book.status === "available"
              ? "New"
              : book.status === "rented"
              ? "Bestseller"
              : book.status === "sold"
              ? "Sale"
              : "New",
          category: book.category?.name || "Uncategorized",
          status: book.status,
        }));

        setBooks(latestBooks);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooks();
  }, []);

  const isInCart = (bookId) => {
    return cartItems.some((item) => item.book_id === bookId);
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some((item) => item.book_id === bookId);
  };

  const handleAddToCart = async (bookId) => {
    try {
      const result = await Swal.fire({
        title: "Add to Cart?",
        text: "This book will be added to your shopping cart",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
      });

      if (!result.isConfirmed) return;

      const book = books.find((b) => b.id === bookId);
      let type;

      if (book.status === "available" && !book.originalPrice) {
        type = "buy";
      } else if (book.status === "available" && book.originalPrice) {
        type = "rent";
      } else {
        throw new Error("This book is not available for purchase or rental");
      }

      await api.addToCart(book.id, { type });
      await fetchCartItems();

      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: "The book has been added to your shopping cart",
        timer: 1500,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: err.response?.data?.message || "Could not add book to cart",
      });
    }
  };

  const handleAddToWishlist = async (bookId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const book = books.find((b) => b.id === bookId);

      if (!book || !currentUser) {
        throw new Error("Missing book or user info");
      }

      const isOwnBook = book.user_id === currentUser.id;

      if (isOwnBook) {
        await Swal.fire({
          icon: "info",
          title: "Invalid Action",
          text: "You cannot add your own book to your wishlist.",
          timer: 2000,
        });
        return;
      }

      if (isInWishlist(bookId)) {
        const itemToRemove = wishlistItems.find((item) => item.book_id === bookId);
        await removeItem(itemToRemove.id);

        await Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Book removed from wishlist",
          timer: 1500,
        });
      } else {
        await addToWishlist(bookId);

        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Book added to wishlist",
          timer: 1500,
        });
      }

      await fetchWishlist();
    } catch (err) {
      let errorMessage = err.response?.data?.message || "Failed to update wishlist";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  if (loading || error) {
    return (
      <section className="new-releases">
        <div className="new-releases-container">
          <div className="section-header">
            <HomePageTitle>
              {loading ? "Loading latest books..." : "Error loading books"}
            </HomePageTitle>
            {error && <p className="section-description">{error}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="new-releases">
      <div className="new-releases-container">
        <div className="section-header">
          <HomePageTitle>New Releases Books</HomePageTitle>
          <p className="section-description" style={{ color: "#666" }}>
            Explore our latest collection of carefully curated books from
            talented authors around the world
          </p>
          <div className="section-divider">
            <div className="divider-line" />
            <div className="divider-icon">📖</div>
            <div className="divider-line" />
          </div>
        </div>

        <div className="books-container">
          {books.map((book, index) => (
            <div
              key={book.id}
              className="book-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`book-badge ${book.badge.toLowerCase()}`}>
                {book.badge}
              </div>

              <div className="book-image-container">
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-image"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=200";
                  }}
                />
                <div className="image-overlay"></div>

                <div className="hover-actions">
                  <button
                    className={`action-button favorite ${isInWishlist(book.id) ? "active" : ""}`}
                    aria-label="Add to favorites"
                    onClick={() => handleAddToWishlist(book.id)}
                  >
                    <Heart
                      size={18}
                      fill={isInWishlist(book.id) ? "currentColor" : "none"}
                    />
                  </button>
                  <button className="action-button view" aria-label="Quick view">
                    <Eye size={18} />
                  </button>
                  <button
                    className={`action-button cart ${
                      isInCart(book.id) ? "disabled" : ""
                    }`}
                    aria-label="Add to cart"
                    onClick={() => handleAddToCart(book.id)}
                    disabled={isInCart(book.id) || book.status !== "available"}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>

                <div className="category-tag">{book.category}</div>
              </div>

              <div className="book-content">
                <div className="book-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(book.rating) ? "star filled" : "star"
                        }
                      />
                    ))}
                  </div>
                  <span className="rating-text">
                    {book.rating} ({book.reviews} reviews)
                  </span>
                </div>

                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>

                <div className="book-price">
                  {book.originalPrice && (
                    <span className="original-price">{book.originalPrice}</span>
                  )}
                  <span className="current-price">{book.price}</span>
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(book.id)}
                  disabled={isInCart(book.id) || book.status !== "available"}
                >
                  <ShoppingCart size={16} />
                  <span>{isInCart(book.id) ? "In Cart" : "Add to Cart"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-section">
          <HomePageButton onClick={() => navigate("/books")}>
            <span>View All Books</span>
            <svg
              className="button-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </HomePageButton>
        </div>
      </div>

      <div className="bg-decoration decoration-1" />
      <div className="bg-decoration decoration-2" />
      <div className="bg-decoration decoration-3" />
    </section>
  );
};

export default NewReleases;