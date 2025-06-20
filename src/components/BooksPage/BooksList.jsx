"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Eye,
  ShoppingCart,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  Check,
} from "lucide-react";
import HomePageTitle from "../shared/HomePageTitle";
import HomePageButton from "../shared/HomePageButton";
import "../../style/BooksList.css";
import Swal from "sweetalert2";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import api from "../../services/api";

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const { cartItems, fetchCartItems } = useCart();
  const { wishlistItems, fetchWishlist, addToWishlist, removeItem } =
    useWishlist();

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (term) => {
        clearTimeout(timeoutId);
        setSearchLoading(true);
        timeoutId = setTimeout(() => {
          setSearchTerm(term);
          setSearchLoading(false);
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();

        if (data.status === "error") {
          throw new Error(data.message || "Failed to fetch books");
        }

        const processedBooks = data.data.map((book) => ({
          id: book.id,
          image: book.images?.[0]
            ? book.images[0].startsWith("http")
              ? book.images[0]
              : `http://localhost:8000/storage/${book.images[0]}`
            : "/placeholder.svg?height=300&width=200",
          price: `$${book.price}`,
          originalPrice: book.rental_price ? `$${book.rental_price}` : null,
          title: book.title,
          author: book.user?.name || "Unknown Author",
          rating: book.ratings?.length
            ? (
                book.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
                book.ratings.length
              ).toFixed(1)
            : 0,
          reviews: book.ratings?.length || 0,
          status: book.status,
          badge:
            book.status === "available"
              ? "Available"
              : book.status === "rented"
              ? "Rented"
              : book.status === "sold"
              ? "Sold"
              : "Available",
          category: book.category?.name || "Uncategorized",
          description: book.description || "No description available",
        }));
        setBooks(processedBooks);
        setFilteredBooks(processedBooks);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((book) => book.status === statusFilter);
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#10B981";
      case "rented":
        return "#F59E0B";
      case "sold":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const isInCart = (bookId) => {
    return cartItems.some((item) => item.book_id === bookId);
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some((item) => item.book_id === bookId);
  };

  const handleAddToWishlist = async (bookId) => {
    try {
      if (isInWishlist(bookId)) {
        await removeItem(bookId);
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
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update wishlist",
      });
    }
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
      console.log("Book details:", {
        id: book.id,
        status: book.status,
        price: book.price,
        originalPrice: book.originalPrice,
      });

      let type = book.originalPrice ? "rent" : "buy";

      console.log("Determined type:", type);

      const response = await api.addToCart(book.id, {
        type,
        quantity: 1, 
      });
      console.log("Cart API response:", response.data);

      await fetchCartItems();

      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: "The book has been added to your shopping cart",
        timer: 1500,
      });
    } catch (err) {
      console.error("Complete error details:", {
        message: err.message,
        response: err.response?.data,
        config: err.config,
      });

      await Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: err.response?.data?.message || "Could not add book to cart",
      });
    }
  };

  if (loading) {
    return (
      <div className="books-page">
        <div className="books-container">
          <div className="loading-section">
            <HomePageTitle>Loading books...</HomePageTitle>
            <div className="loading-spinner"></div>
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>
              Please wait while we fetch the latest books
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-page">
        <div className="books-container">
          <div className="error-section">
            <HomePageTitle>Error loading books</HomePageTitle>
            <p className="error-message">{error}</p>
            <HomePageButton onClick={() => window.location.reload()}>
              Try Again
            </HomePageButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="books-list-container">
      <div className="page-header">
        <HomePageTitle>All Books</HomePageTitle>
        <p className="page-description">
          Discover our complete collection of books from talented authors
        </p>
      </div>

      <div className="filters-section">
        <div className="search-filter">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by book name or author..."
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchLoading && <Loader2 size={16} className="search-loading" />}
          </div>
        </div>

        <div className="filter-controls">
          <div className="status-filter">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="results-info">
        <span className="results-count">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}{" "}
          found
          {searchTerm && ` for "${searchTerm}"`}
          {statusFilter !== "all" && ` (${statusFilter})`}
        </span>
        {(searchTerm || statusFilter !== "all") && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>

      <div className={`books-display ${viewMode}`}>
        {filteredBooks.length === 0 ? (
          <div className="no-results">
            <p>
              {searchTerm || statusFilter !== "all"
                ? "No books found matching your criteria"
                : "No books available at the moment"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <HomePageButton onClick={clearFilters}>
                Clear Filters
              </HomePageButton>
            )}
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div key={book.id} className={`book-item ${viewMode}`}>
              <div className="book-image-section">
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=300&width=200";
                  }}
                />
                <div className="image-overlay">
                  <div className="hover-actions">
                    <button
                      className={`action-btn favorite ${
                        isInWishlist(book.id) ? "active" : ""
                      }`}
                      title={
                        isInWishlist(book.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      onClick={() => handleAddToWishlist(book.id)}
                    >
                      <Heart
                        size={16}
                        fill={isInWishlist(book.id) ? "currentColor" : "none"}
                      />
                    </button>
                    <button className="action-btn view" title="Quick view">
                      <Eye size={16} />
                    </button>
                    <button
                      className={`action-btn cart ${
                        isInCart(book.id) ? "disabled" : ""
                      }`}
                      title={
                        isInCart(book.id) ? "Already in cart" : "Add to cart"
                      }
                      onClick={
                        !isInCart(book.id)
                          ? () => handleAddToCart(book.id)
                          : undefined
                      }
                      disabled={
                        isInCart(book.id) || book.status !== "available"
                      }
                    >
                      {isInCart(book.id) ? (
                        <Check size={16} />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(book.status) }}
                >
                  {book.badge}
                </div>
              </div>

              <div className="book-content">
                <div className="book-header">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">By {book.author}</p>
                </div>

                {viewMode === "list" && (
                  <p className="book-description">{book.description}</p>
                )}

                <div className="book-meta">
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

                  <div className="book-category">{book.category}</div>
                </div>

                <div className="book-footer">
                  <div className="book-price">
                    {book.originalPrice && (
                      <span className="original-price">
                        {book.originalPrice}
                      </span>
                    )}
                    <span className="current-price">{book.price}</span>
                  </div>

                  {isInCart(book.id) ? (
                    <button className="add-to-cart-btn disabled" disabled>
                      <Check size={16} />
                      <span>In Cart</span>
                    </button>
                  ) : (
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(book.id)}
                      disabled={book.status !== "available"}
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredBooks.length > 0 && (
        <div className="load-more-section">
          <HomePageButton>
            <span>Load More Books</span>
          </HomePageButton>
        </div>
      )}
    </div>
  );
};

export default BooksList;
