"use client"
import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"
import HomePageTitle from "../shared/HomePageTitle"
import HomePageButton from "../shared/HomePageButton"
import "../../style/BooksList.css"
import { useNavigate } from "react-router-dom"

const BooksList = () => {
    const [books, setBooks] = useState([])
    const [filteredBooks, setFilteredBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [viewMode, setViewMode] = useState("grid")
    const [currentPage, setCurrentPage] = useState(1)
    const booksPerPage = 9
    const navigate = useNavigate()

    const debouncedSearch = useCallback(() => {
        let timeoutId
        return term => {
            clearTimeout(timeoutId)
            setSearchLoading(true)
            timeoutId = setTimeout(() => {
                setSearchTerm(term)
                setSearchLoading(false)
            }, 300)
        }
    }, [])()

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch("http://localhost:8000/api/books")
                if (!response.ok) throw new Error("Failed to fetch books")
                const data = await response.json()

                const processedBooks = data.data.map(book => ({
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
                    author: book.user?.name || "Unknown Author",
                    rating: book.ratings?.length
                        ? (
                              book.ratings.reduce(
                                  (acc, curr) => acc + curr.rating,
                                  0
                              ) / book.ratings.length
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
                }))

                setBooks(processedBooks)
                setFilteredBooks(processedBooks)
            } catch (err) {
                console.error("Error fetching books:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchBooks()
    }, [])

    useEffect(() => {
        let filtered = books

        if (searchTerm) {
            filtered = filtered.filter(
                book =>
                    book.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(book => book.status === statusFilter)
        }

        setFilteredBooks(filtered)
    }, [books, searchTerm, statusFilter])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter])

    const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * booksPerPage,
        currentPage * booksPerPage
    )

    const getPageNumbers = () => {
        const pages = []
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
        return pages
    }

    const getStatusColor = status => {
        switch (status) {
            case "available":
                return "#10B981"
            case "rented":
                return "#F59E0B"
            case "sold":
                return "#EF4444"
            default:
                return "#6B7280"
        }
    }

    const handleSearchChange = e => {
        debouncedSearch(e.target.value)
    }

    const clearFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
    }

    const handleAddToCart = id => {
        console.log("Add to cart:", id)
    }

    const handleAddToWishlist = id => {
        console.log("Add to wishlist:", id)
    }

    const handleQuickView = id => {
        navigate(`/books/${id}`)
    }

    const retryFetch = () => {
        window.location.reload()
    }

    if (loading) {
        return (
            <div className="books-page">
                <HomePageTitle>Loading books...</HomePageTitle>
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="books-page">
                <HomePageTitle>Error loading books</HomePageTitle>
                <p>{error}</p>
                <HomePageButton onClick={retryFetch}>Try Again</HomePageButton>
            </div>
        )
    }

    return (
        <div className="books-list-container">
            <div className="page-header">
                <HomePageTitle>All Books</HomePageTitle>
                <p>
                    Discover our complete collection of books from talented
                    authors
                </p>
            </div>

            <div className="filters-section">
                <div className="search-filter">
                    <div className="search-input-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by book or author..."
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        {searchLoading && (
                            <Loader2 size={16} className="search-loading" />
                        )}
                    </div>
                </div>

                <div className="filter-controls">
                    <div className="status-filter">
                        <Filter size={18} />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
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
                            className={`view-btn ${
                                viewMode === "grid" ? "active" : ""
                            }`}
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`view-btn ${
                                viewMode === "list" ? "active" : ""
                            }`}
                            onClick={() => setViewMode("list")}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="results-info">
                <span>
                    {filteredBooks.length} result(s)
                    {searchTerm && ` for "${searchTerm}"`}
                    {statusFilter !== "all" && ` (${statusFilter})`}
                </span>
                {(searchTerm || statusFilter !== "all") && (
                    <button
                        onClick={clearFilters}
                        className="clear-filters-btn"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className={`books-display ${viewMode}`}>
                {paginatedBooks.length === 0 ? (
                    <div className="no-results">
                        <p>No books match your criteria.</p>
                        <HomePageButton onClick={clearFilters}>
                            Clear Filters
                        </HomePageButton>
                    </div>
                ) : (
                    paginatedBooks.map((book, index) => (
                        <div key={book.id} className={`book-item ${viewMode}`}>
                            <div
                                className={`book-badge ${book.badge.toLowerCase()}`}
                            >
                                {book.badge}
                            </div>

                            <div className="book-image-container">
                                <img
                                    src={book.image}
                                    alt={book.title}
                                    className="book-image"
                                    onError={e => {
                                        e.target.src =
                                            "/placeholder.svg?height=300&width=200"
                                    }}
                                />
                                <div className="image-overlay">
                                    <button
                                        onClick={() =>
                                            handleAddToWishlist(book.id)
                                        }
                                    >
                                        <Heart size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleQuickView(book.id)}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(book.id)}
                                    >
                                        <ShoppingCart size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="book-content">
                                <h3>{book.title}</h3>
                                <p>{book.author}</p>
                                {viewMode === "list" && (
                                    <p>{book.description}</p>
                                )}
                                <div className="book-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={
                                                i < Math.floor(book.rating)
                                                    ? "filled"
                                                    : ""
                                            }
                                        />
                                    ))}
                                    <span>
                                        {book.rating} ({book.reviews} reviews)
                                    </span>
                                </div>
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
                                <button
                                    onClick={() => handleAddToCart(book.id)}
                                >
                                    <ShoppingCart size={16} />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <ul className="pagination">
                        <li>
                            <button
                                onClick={() =>
                                    setCurrentPage(p => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                        </li>
                        {getPageNumbers().map(page => (
                            <li key={page}>
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    className={
                                        currentPage === page ? "active" : ""
                                    }
                                >
                                    {page}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={() =>
                                    setCurrentPage(p =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

export default BooksList
