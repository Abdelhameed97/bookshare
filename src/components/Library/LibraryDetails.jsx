import React, { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import {
    BookOpen,
    MapPin,
    Star,
    Search,
    ArrowLeft,
    Phone,
    Mail,
    Building2,
} from "lucide-react"
import apiService from "../../services/api"
import Navbar from "../HomePage/Navbar"
import Footer from "../HomePage/Footer"
import "../../style/LibrariesPage.css"

const LibraryDetails = () => {
    const { id } = useParams()
    const [library, setLibrary] = useState(null)
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchLibraryDetails = useCallback(async () => {
        try {
            setLoading(true)

            // Fetch library owner details
            const librariesResponse = await apiService.get("/libraries")
            const owner = librariesResponse.data.data.find(
                owner => owner.id === parseInt(id)
            )

            if (!owner) {
                throw new Error("Library not found")
            }

            // Fetch all books and filter by owner
            const booksResponse = await apiService.get("/books")
            const ownerBooks = booksResponse.data.data.filter(
                book => book.user_id === parseInt(id)
            )

            // Calculate stats
            const totalRating = ownerBooks.reduce((sum, book) => {
                return (
                    sum +
                    (book.ratings?.reduce(
                        (acc, rating) => acc + rating.rating,
                        0
                    ) || 0)
                )
            }, 0)
            const totalReviews = ownerBooks.reduce((sum, book) => {
                return sum + (book.ratings?.length || 0)
            }, 0)
            const avgRating =
                totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0

            setLibrary({
                id: owner.id,
                name: owner.name,
                email: owner.email,
                phone: owner.phone_number,
                address: owner.location,
                bio: owner.bio,
                totalBooks: ownerBooks.length,
                avgRating,
                totalReviews,
            })

            setBooks(
                ownerBooks.map(book => ({
                    ...book,
                    image: book.images?.[0]
                        ? book.images[0].startsWith("http")
                            ? book.images[0]
                            : `http://localhost:8001/storage/${book.images[0]}`
                        : "/placeholder.svg",
                }))
            )
        } catch (error) {
            console.error("Error fetching library details:", error)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchLibraryDetails()
    }, [fetchLibraryDetails])

    const filteredBooks = books.filter(book => {
        const searchLower = searchTerm.toLowerCase()
        return (
            book.title.toLowerCase().includes(searchLower) ||
            book.description?.toLowerCase().includes(searchLower) ||
            book.author?.toLowerCase().includes(searchLower) ||
            book.genre?.toLowerCase().includes(searchLower)
        )
    })

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

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="libraries-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading library details...</p>
                </div>
                <Footer />
            </>
        )
    }

    if (!library) {
        return (
            <>
                <Navbar />
                <div className="libraries-loading">
                    <Building2 size={64} />
                    <h3>Library not found</h3>
                    <Link to="/libraries" className="btn-primary">
                        <ArrowLeft size={16} />
                        Back to Libraries
                    </Link>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="libraries-page">
                <div className="libraries-header">
                    <div className="header-content">
                        <Link to="/libraries" className="back-link">
                            <ArrowLeft size={20} />
                            Back to Libraries
                        </Link>
                        <h1>{library.name}</h1>
                        <p>
                            Explore the amazing book collection from{" "}
                            {library.name}
                        </p>
                    </div>
                </div>

                <div className="libraries-container">
                    {/* Library Info Card */}
                    <div className="library-details-card">
                        <div className="library-info-section">
                            <div className="library-stats-overview">
                                <div className="stat-item">
                                    <BookOpen size={24} />
                                    <div>
                                        <h3>{library.totalBooks}</h3>
                                        <p>Total Books</p>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <Star size={24} fill="#fbbf24" />
                                    <div>
                                        <h3>{library.avgRating}</h3>
                                        <p>
                                            Average Rating (
                                            {library.totalReviews} reviews)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {library.address && (
                                <div className="library-contact">
                                    <div className="contact-item">
                                        <MapPin size={16} />
                                        <span>{library.address}</span>
                                    </div>
                                    {library.phone && (
                                        <div className="contact-item">
                                            <Phone size={16} />
                                            <a href={`tel:${library.phone}`}>
                                                {library.phone}
                                            </a>
                                        </div>
                                    )}
                                    {library.email && (
                                        <div className="contact-item">
                                            <Mail size={16} />
                                            <a href={`mailto:${library.email}`}>
                                                {library.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {library.bio && (
                                <div className="library-bio">
                                    <h4>About {library.name}</h4>
                                    <p>{library.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Books */}
                    <div className="search-filter-section">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search books in this library..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Books Grid */}
                    <div className="books-section">
                        <h2>Books ({filteredBooks.length})</h2>
                        <div className="books-grid">
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map(book => (
                                    <div key={book.id} className="book-card">
                                        <div className="book-image">
                                            <img
                                                src={book.image}
                                                alt={book.title}
                                                onError={e => {
                                                    e.currentTarget.src =
                                                        "/placeholder.svg"
                                                }}
                                            />
                                            <div
                                                className="book-status"
                                                style={{
                                                    backgroundColor:
                                                        getStatusColor(
                                                            book.status
                                                        ),
                                                }}
                                            >
                                                {book.status}
                                            </div>
                                        </div>
                                        <div className="book-info">
                                            <h3>{book.title}</h3>
                                            <p className="book-author">
                                                By {book.author || "Unknown"}
                                            </p>
                                            <div className="book-category">
                                                <span className="category-badge">
                                                    {book.category?.name ||
                                                        "Uncategorized"}
                                                </span>
                                            </div>
                                            <div className="book-details">
                                                <span className="detail-badge condition">
                                                    {book.condition ||
                                                        "Unknown"}
                                                </span>
                                                {book.genre && (
                                                    <span className="detail-badge genre">
                                                        {book.genre}
                                                    </span>
                                                )}
                                                {book.educational_level && (
                                                    <span className="detail-badge level">
                                                        {book.educational_level}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="book-rating">
                                                <Star
                                                    size={16}
                                                    fill="#FBBF24"
                                                />
                                                <span>
                                                    {book.ratings?.length
                                                        ? (
                                                              book.ratings.reduce(
                                                                  (acc, r) =>
                                                                      acc +
                                                                      r.rating,
                                                                  0
                                                              ) /
                                                              book.ratings
                                                                  .length
                                                          ).toFixed(1)
                                                        : "0"}
                                                </span>
                                                <span className="rating-count">
                                                    ({book.ratings?.length || 0}
                                                    )
                                                </span>
                                            </div>
                                            <div className="book-pricing">
                                                <p className="book-price">
                                                    ${book.price}
                                                </p>
                                                {book.rental_price && (
                                                    <p className="book-rental-price">
                                                        Rent: $
                                                        {book.rental_price}
                                                    </p>
                                                )}
                                            </div>
                                            {book.description && (
                                                <p className="book-description">
                                                    {book.description.substring(
                                                        0,
                                                        100
                                                    )}
                                                    ...
                                                </p>
                                            )}
                                            <div className="book-actions">
                                                <Link
                                                    to={`/books/${book.id}`}
                                                    className="btn-view-book"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-books">
                                    <BookOpen size={64} />
                                    <h3>No books found</h3>
                                    <p>
                                        {searchTerm
                                            ? "Try adjusting your search criteria"
                                            : "This library has no books yet"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default LibraryDetails
