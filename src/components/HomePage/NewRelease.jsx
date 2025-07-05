"use client";
import { Heart, Eye, ShoppingCart, Star, Check } from "lucide-react";
import { useState, useEffect } from "react";
import HomePageTitle from "../shared/HomePageTitle";
import "../../style/Homepagestyle.css";
import HomePageButton from "../shared/HomePageButton";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

const NewReleases = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCartIds, setAddedToCartIds] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?.id;

  const { cartItems, fetchCartItems } = useCart(userId);
  const { wishlistItems, fetchWishlist, addToWishlist, removeItem } = useWishlist(userId);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        const response = await api.get("/books");
        const data = response.data;
        console.log("Fetched books:", data);

        const latestBooks = data.data
          .filter((book) => book.status === "available") // filter available only
          .slice(0, 3)
          .map((book) => {
            const image =
              Array.isArray(book.images) && book.images.length > 0
                ? book.images[0].startsWith("http")
                  ? book.images[0]
                  : `${process.env.REACT_APP_API_URL}/storage/${book.images[0]}`
                : "/placeholder.svg?height=300&width=200";

            const price = book.price ? `$${book.price}` : "$0.00";
            const originalPrice = book.rental_price ? `$${book.rental_price}` : null;

            const title = book.title || "Untitled";
            const author = book.user?.name ? `By ${book.user.name}` : "Unknown Author";

            const rating =
              book.ratings?.length > 0
                ? (
                    book.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
                    book.ratings.length
                  ).toFixed(1)
                : 0;

            const reviews = book.ratings?.length || 0;

            const badge = "New";
            const category = book.category?.name || "Uncategorized";

            return {
              id: book.id,
              user_id: book.user_id,
              image,
              price,
              originalPrice,
              title,
              author,
              rating,
              reviews,
              badge,
              category,
              status: book.status || "available",
            };
          });

        setBooks(latestBooks);
      } catch (err) {
        console.error("Error loading books:", err);
        setError(err.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooks();
  }, []);

  const isInCart = (bookId) =>
    cartItems.some((item) => item.book_id === bookId) || addedToCartIds.includes(bookId);

  const isInWishlist = (bookId) => wishlistItems.some((item) => item.book_id === bookId);

  const handleAddToCart = async (bookId) => {
    if (isInCart(bookId)) {
      Swal.fire({ icon: "info", title: "Already in Cart", text: "This book is already in your cart", timer: 1500 });
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
      const type = book.originalPrice ? "rent" : "buy";

      await api.addToCart(book.id, { type });
      await fetchCartItems();
      setAddedToCartIds((prev) => [...prev, bookId]);

      Swal.fire({ icon: "success", title: "Added to Cart!", text: "Book has been added", timer: 1500 });
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (message.includes("already in the cart")) setAddedToCartIds((prev) => [...prev, bookId]);

      Swal.fire({ icon: "error", title: "Failed to Add", text: message });
    }
  };

  const handleAddToWishlist = async (bookId) => {
    try {
      const book = books.find((b) => b.id === bookId);
      if (!book || !userId) {
        Swal.fire({ icon: "error", title: "Login Required", text: "Please login first" });
        return navigate("/login", { state: { from: location.pathname } });
      }

      const isOwnBook = book.user_id === userId;
      if (isOwnBook) {
        Swal.fire({ icon: "info", title: "Invalid", text: "You can't add your own book", timer: 2000 });
        return;
      }

      if (isInWishlist(bookId)) {
        const itemToRemove = wishlistItems.find((item) => item.book_id === bookId);
        await removeItem(itemToRemove.id);
        Swal.fire({ icon: "success", title: "Removed!", text: "Book removed from wishlist", timer: 1500 });
      } else {
        await addToWishlist(bookId);
        Swal.fire({ icon: "success", title: "Added!", text: "Book added to wishlist", timer: 1500 });
      }

      await fetchWishlist();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message });
    }
  };

  if (loading) {
    return (
      <section className='new-releases'>
        <div className='new-releases-container'>
          <div className='section-header'>
            <HomePageTitle>Loading latest books...</HomePageTitle>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='new-releases'>
        <div className='new-releases-container'>
          <div className='section-header'>
            <HomePageTitle>Error loading books</HomePageTitle>
            <p className='section-description'>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='new-releases'>
      <div className='new-releases-container'>
        <div className='section-header'>
          <HomePageTitle>New Releases Books</HomePageTitle>
          <p className='section-description' style={{ color: "#666" }}>
            Explore our latest collection of books
          </p>
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>📖</div>
            <div className='divider-line'></div>
          </div>
        </div>

        <div className='books-container'>
          {books.length === 0 ? (
            <div className='no-books'>No books available</div>
          ) : (
            books.map((book, index) => (
              <div key={book.id} className='book-card' style={{ animationDelay: `${index * 0.2}s` }}>
                <div className={`book-badge ${book.badge.toLowerCase()}`}>{book.badge}</div>

                <div className='book-image-container'>
                  <img
                    src={book.image}
                    alt={book.title}
                    className='book-image'
                    onError={(e) => (e.currentTarget.src = "/placeholder.svg?height=300&width=200")}
                  />
                  <div className='image-overlay'></div>

                  <div className='hover-actions'>
                    <button className={`action-button favorite ${isInWishlist(book.id) ? "active" : ""}`} onClick={() => handleAddToWishlist(book.id)}>
                      <Heart size={18} fill={isInWishlist(book.id) ? "currentColor" : "none"} />
                    </button>
                    <button className='action-button view' onClick={() => navigate(`/books/${book.id}`)}>
                      <Eye size={18} />
                    </button>
                    <button
                      className={`action-button cart ${isInCart(book.id) ? "disabled" : ""}`}
                      onClick={() => handleAddToCart(book.id)}
                      disabled={isInCart(book.id) || book.status !== "available"}
                    >
                      {isInCart(book.id) ? <Check size={18} /> : <ShoppingCart size={18} />}
                    </button>
                  </div>

                  <div className='category-tag'>{book.category}</div>
                </div>

                <div className='book-content'>
                  <div className='book-rating'>
                    <div className='stars'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.floor(book.rating) ? "star filled" : "star"} />
                      ))}
                    </div>
                    <span className='rating-text'>{book.rating} ({book.reviews} reviews)</span>
                  </div>

                  <h3 className='book-title'>{book.title}</h3>
                  <p className='book-author'>{book.author}</p>

                  <div className='book-price'>
                    {book.originalPrice && <span className='original-price'>{book.originalPrice}</span>}
                    <span className='current-price'>{book.price}</span>
                  </div>

                  <button
                    className='add-to-cart-btn'
                    onClick={() => handleAddToCart(book.id)}
                    disabled={isInCart(book.id) || book.status !== "available"}
                  >
                    {isInCart(book.id) ? <Check size={16} /> : <ShoppingCart size={16} />}
                    <span>{isInCart(book.id) ? "In Cart" : "Add to Cart"}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className='view-all-section'>
          <HomePageButton onClick={() => navigate("/books")}>
            <span>View All Books</span>
            <svg className='button-icon' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
            </svg>
          </HomePageButton>
        </div>
      </div>

      <div className='bg-decoration decoration-1'></div>
      <div className='bg-decoration decoration-2'></div>
      <div className='bg-decoration decoration-3'></div>
    </section>
  );
};

export default NewReleases;
