import { useState, useEffect } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { Link } from "react-router-dom"

const SearchModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const searchBooks = async () => {
            if (searchQuery.trim().length === 0) {
                setSearchResults([])
                return
            }

            setLoading(true)
            try {
                const response = await fetch(
                    `http://localhost:8000/api/books?title=${encodeURIComponent(
                        searchQuery
                    )}`
                )
                if (!response.ok) {
                    throw new Error("Failed to fetch search results")
                }
                const data = await response.json()
                setSearchResults(data.data)
            } catch (error) {
                console.error("Error searching books:", error)
                setSearchResults([])
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchBooks, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    if (!isOpen) return null

    return (
        <div className="search-modal-overlay">
            <div className="search-modal">
                <div className="search-modal-header">
                    <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for books..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                            autoFocus
                        />
                    </div>
                    <button onClick={onClose} className="close-button">
                        <FaTimes />
                    </button>
                </div>

                <div className="search-results">
                    {loading ? (
                        <div className="loading">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        <div className="results-grid">
                            {searchResults.map(book => (
                                <Link
                                    key={book.id}
                                    to={`/books/${book.id}`}
                                    className="search-result-item"
                                    onClick={onClose}
                                >
                                    <div className="book-image">
                                        <img
                                            src={
                                                book.images?.[0]
                                                    ? book.images[0].startsWith(
                                                          "http"
                                                      )
                                                        ? book.images[0]
                                                        : `http://localhost:8000/storage/${book.images[0]}`
                                                    : "/placeholder.svg"
                                            }
                                            alt={book.title}
                                            onError={e => {
                                                e.currentTarget.src =
                                                    "/placeholder.svg"
                                            }}
                                        />
                                    </div>
                                    <div className="book-info">
                                        <h3>{book.title}</h3>
                                        <p className="author">
                                            By{" "}
                                            {book.user?.name ||
                                                "Unknown Author"}
                                        </p>
                                        <p className="price">${book.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : searchQuery.trim().length > 0 ? (
                        <div className="no-results">No books found</div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default SearchModal
