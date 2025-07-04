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
    Box,
} from "lucide-react";
import HomePageTitle from "../shared/HomePageTitle";
import HomePageButton from "../shared/HomePageButton";
import "../../style/BooksList.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCartContext } from "../../contexts/CartContext";
import { useWishlistContext } from "../../contexts/WishlistContext";
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
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 9;
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?.id;
  const { cartItems, fetchCartItems } = useCartContext();
  const { wishlistItems, fetchWishlist, addToWishlist, removeItem } = useWishlistContext();
  const [addedToCartIds, setAddedToCartIds] = useState([]);
  const [justAddedBookId, setJustAddedBookId] = useState(null);


  // Debounced search function
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

  // Fetch books data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/api/books");
        
        if (!response.ok) throw new Error("Failed to fetch books");

        const data = await response.json();
        if (data.status === "error")
          throw new Error(data.message || "Failed to fetch books");

        const processedBooks = data.data.map((book) => ({
          id: book.id,
          user_id: book.user_id,
          image: book.images?.[0]
            ? book.images[0].startsWith("http")
              ? book.images[0]
              : `http://localhost:8000/storage/${book.images[0]}`
            : "/placeholder.svg?height=300&width=200",
          price: `${book.price}$`,
          originalPrice: book.rental_price ? `${book.rental_price}$` : null,
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
              ? "New"
              : book.status === "rented"
              ? "Bestseller"
              : book.status === "sold"
              ? "Sale"
              : "New",
          category: book.category?.name || "Uncategorized",
          description: book.description || "No description available",
          quantity: book.quantity,
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

  // Filter books based on search and status
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Check if book is in cart
  const isInCart = (bookId) =>
    cartItems.some((item) => item.book_id === bookId) ||
    addedToCartIds.includes(bookId);

    // Check if book is in wishlist
  const isInWishlist = (bookId) =>
    wishlistItems.some((item) => item.book_id === bookId);

  const handleAddToWishlist = async (bookId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const book = books.find((b) => b.id === bookId);

      if (!book || !currentUser) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please login to use wishlist",
        });
        navigate("/login", { state: { from: location.pathname } });
        return;
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
        const itemToRemove = wishlistItems.find(
          (item) => item.book_id === bookId
        );
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
      if (err.message !== "Please login first") {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            err.response?.data?.message ||
            err.message ||
            "Failed to update wishlist",
        });
      }
    }
  };

  // Handle add to cart
  const handleAddToCart = async (bookId) => {
    if (isInCart(bookId)) {
      Swal.fire({
        icon: "info",
        title: "Already in Cart",
        text: "This book is already in your cart",
        timer: 1500,
      });
      return;
    }

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
      const type = "buy";
      await api.addToCart(book.id, { type });
      await fetchCartItems();
      setAddedToCartIds((prev) => [...prev, bookId]);

      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: "The book has been added to your shopping cart",
        timer: 1500,
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message;

      if (message.includes("already in the cart")) {
        setAddedToCartIds((prev) => [...prev, bookId]);
      }

      await Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: message,
      });
    }
  };

  // Handle quick view
  const handleQuickView = (bookId) => navigate(`/books/${bookId}`);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Retry fetching books
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  // Get status color for badges
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

  // Handle search input change
  const handleSearchChange = (e) => debouncedSearch(e.target.value);

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
            <HomePageButton onClick={retryFetch}>Try Again</HomePageButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="books-list-container">
      {/* Page Header */}
      <div className="page-header">
        <HomePageTitle>All Books</HomePageTitle>
        <p className="page-description">
          Discover our complete collection of books from talented authors
        </p>
      </div>

      {/* Filters Section */}
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

      {/* Results Info */}
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

      {/* Books Display */}
      <div className={`books-display ${viewMode}`}>
        {paginatedBooks.length === 0 ? (
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
          paginatedBooks.map((book, index) => (
            <div
              key={book.id}
              className="book-card"
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                animation: "fadeIn 0.5s forwards",
              }}
            >
              {/* Book Badge */}
              <div
                className="book-badge"
                style={{ backgroundColor: getStatusColor(book.status) }}
              >
                {book.badge}
              </div>

              {/* Book Image */}
              <div className="book-image-container" style={{ position: 'relative' }}>
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-image"
                  width="350"
                  height="320"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=200";
                  }}
                />
                <div className="image-overlay"></div>

                {/* Modern Quantity/Out of Stock Badge - bottom right over image */}
                {typeof book.quantity !== 'undefined' && (
                  <span
                    className={
                      book.quantity === 0
                        ? "quantity-badge-modern out-of-stock-badge-modern position-absolute"
                        : "quantity-badge-modern in-stock-badge-modern position-absolute"
                    }
                    style={{
                      bottom: 14,
                      right: 14,
                      borderRadius: '999px',
                      padding: '0.38em 1.3em 0.38em 1em',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      zIndex: 3,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                      background: book.quantity === 0
                        ? 'linear-gradient(90deg, #e53935 60%, #ff5252 100%)'
                        : 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
                      color: '#fff',
                      letterSpacing: '0.01em',
                      minWidth: 90,
                      textAlign: 'center',
                      border: '2.5px solid #fff',
                      lineHeight: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    {book.quantity === 0 ? (
                      <>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1em', marginRight: 4 }}>❌</span>
                        Out of Stock
                      </>
                    ) : (
                      <>
                        <Box size={17} style={{ marginRight: 4, marginBottom: 1 }} />
                        {`Qty: ${book.quantity}`}
                      </>
                    )}
                  </span>
                )}

                {/* Hover Actions */}
                <div className="hover-actions">
                  {(!currentUser || currentUser.role === 'owner') ? (
                    <button
                      className="action-button view"
                      onClick={() => handleQuickView(book.id)}
                      aria-label="Quick view"
                    >
                      <Eye size={18} />
                    </button>
                  ) : (
                    <>
                      <button
                        className={`action-button favorite EGP{isInWishlist(book.id) ? "active" : ""}`}
                        onClick={() => handleAddToWishlist(book.id)}
                        aria-label={
                          isInWishlist(book.id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          size={18}
                          fill={isInWishlist(book.id) ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        className="action-button view"
                        onClick={() => handleQuickView(book.id)}
                        aria-label="Quick view"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className={`action-button cart EGP{isInCart(book.id) ? "disabled" : ""}`}
                        onClick={
                          !isInCart(book.id)
                            ? () => handleAddToCart(book.id)
                            : undefined
                        }
                        disabled={isInCart(book.id) || book.status !== "available"}
                        aria-label={
                          isInCart(book.id) ? "Already in cart" : "Add to cart"
                        }
                      >
                        {isInCart(book.id) ? (
                          <Check size={18} />
                        ) : (
                          <ShoppingCart size={18} />
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Category Tag */}
                <div className="category-tag">{book.category}</div>
              </div>

              {/* Book Content */}
              <div className="book-content">
                {/* Rating */}
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

                {/* Title and Author */}
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>

                {/* Price */}
                <div className="book-price">
                  {book.originalPrice && (
                    <span className="original-price">{book.originalPrice}</span>
                  )}
                  <span className="current-price">{book.price}</span>
                </div>

                {/* View Details Button (for owners only) */}
                {currentUser && currentUser.role === 'owner' && (
                  <button
                    className="view-details-btn btn btn-primary w-100 mt-2"
                    onClick={() => navigate(`/books/${book.id}`)}
                    style={{ fontWeight: 600 }}
                  >
                    View Details
                  </button>
                )}

                {/* Add to Cart Button (for clients only) */}
                {currentUser && currentUser.role === 'client' && (
                  <button
                    className={`add-to-cart-btn EGP{isInCart(book.id) ? "disabled" : ""}`}
                    onClick={
                      !isInCart(book.id)
                        ? () => handleAddToCart(book.id)
                        : undefined
                    }
                    disabled={isInCart(book.id) || book.status !== "available"}
                  >
                    {isInCart(book.id) ? (
                      <Check size={16} />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                    <span>{isInCart(book.id) ? "In Cart" : "Add to Cart"}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <a href="#!" className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                &lt;
              </a>
            </li>
            {getPageNumbers().map((number) => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <a href="#!" className="page-link" onClick={() => setCurrentPage(number)}>
                  {number}
                </a>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <a href="#!" className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                &gt;
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default BooksList;