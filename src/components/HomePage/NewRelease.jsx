"use client"
import { Heart, Eye, ShoppingCart, Star } from "lucide-react"
import { useState, useEffect } from "react"
import HomePageTitle from "../shared/HomePageTitle"
import "../../style/Homepagestyle.css"
import HomePageButton from "../shared/HomePageButton"
import { useNavigate } from "react-router-dom"

const NewReleases = () => {
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLatestBooks = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/books")
                if (!response.ok) {
                    throw new Error("Failed to fetch books")
                }
                const data = await response.json()
                // Get the latest 3 books
                const latestBooks = data.data.slice(0, 3).map(book => ({
                    id: book.id,
                    image: book.images?.[0]
                        ? book.images[0].startsWith("http")
                            ? book.images[0]
                            : `http://localhost:8000/storage/${book.images[0]}`
                        : "/placeholder.svg?height=300&width=200",
                    price: `${book.price} $`,
                    originalPrice: book.rental_price
                        ? `${book.rental_price} $`
                        : null,
                    title: book.title,
                    author: `By ${book.user?.name || "Unknown Author"}`,
                    rating: book.ratings?.length
                        ? (
                              book.ratings.reduce(
                                  (acc, curr) => acc + curr.rating,
                                  0
                              ) / book.ratings.length
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
                }))
                setBooks(latestBooks)
            } catch (err) {
                console.error("Error fetching books:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchLatestBooks()
    }, [])

    if (loading) {
        return (
            <section className="new-releases">
                <div className="new-releases-container">
                    <div className="section-header">
                        <HomePageTitle>Loading latest books...</HomePageTitle>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="new-releases">
                <div className="new-releases-container">
                    <div className="section-header">
                        <HomePageTitle>Error loading books</HomePageTitle>
                        <p className="section-description">{error}</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="new-releases">
            <div className="new-releases-container">
                {/* Section Header */}
                <div className="section-header">
                    <HomePageTitle>New Releases Books</HomePageTitle>
                    <p
                        className="section-description"
                        style={{ color: "#666666" }}
                    >
                        Explore our latest collection of carefully curated books
                        from talented authors around the world
                    </p>
                    <div className="section-divider">
                        <div className="divider-line"></div>
                        <div className="divider-icon">📖</div>
                        <div className="divider-line"></div>
                    </div>
                </div>

                {/* Books Grid */}
                <div className="books-container">
                    {books.map((book, index) => (
                        <div
                            key={book.id}
                            className="book-card"
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            {/* Book Badge */}
                            <div
                                className={`book-badge ${book.badge.toLowerCase()}`}
                            >
                                {book.badge}
                            </div>

                            {/* Book Image Container */}
                            <div className="book-image-container">
                                <img
                                    src={book.image || "/placeholder.svg"}
                                    alt={book.title}
                                    className="book-image"
                                    onError={e => {
                                        e.currentTarget.src =
                                            "/placeholder.svg?height=300&width=200"
                                    }}
                                />
                                <div className="image-overlay"></div>

                                {/* Hover Actions */}
                                <div className="hover-actions">
                                    <button
                                        className="action-button favorite"
                                        aria-label="Add to favorites"
                                    >
                                        <Heart size={18} />
                                    </button>
                                    <button
                                        className="action-button view"
                                        aria-label="Quick view"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className="action-button cart"
                                        aria-label="Add to cart"
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>

                                {/* Category Tag */}
                                <div className="category-tag">
                                    {book.category}
                                </div>
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
                                                    i < Math.floor(book.rating)
                                                        ? "star filled"
                                                        : "star"
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="rating-text">
                                        {book.rating} ({book.reviews} reviews)
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="book-title">{book.title}</h3>

                                {/* Author */}
                                <p className="book-author">{book.author}</p>

                                {/* Price */}
                                <div className="book-price">
                                    {book.originalPrice && (
                                        <span className="original-price">
                                            {book.originalPrice}
                                        </span>
                                    )}
                                    <span className="current-price">
                                        {book.price}
                                    </span>
                                </div>

                                {/* Add to Cart Button */}
                                <button className="add-to-cart-btn">
                                    <ShoppingCart size={16} />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="view-all-section">
                    <HomePageButton>
                        <span>View All Books</span>
                        <span onClick={() => navigate("/books")}>
                            View All Books
                        </span>
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

            {/* Background Decorations */}
            <div className="bg-decoration decoration-1"></div>
            <div className="bg-decoration decoration-2"></div>
            <div className="bg-decoration decoration-3"></div>
        </section>
    )
}

export default NewReleases
