// src/pages/RagChat.jsx
import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Search, Filter, Heart, Eye, Check, ShoppingCart } from "lucide-react"
import Swal from "sweetalert2"
import Navbar from "../components/HomePage/Navbar"
import { useNavigate } from "react-router-dom"

const BookCard = React.memo(
    ({
        book,
        isInWishlist,
        isInCart,
        onWishlist,
        onAddToCart,
        onQuickView,
        delay,
    }) => {
        const [isVisible, setIsVisible] = useState(false)

        useEffect(() => {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, delay)

            return () => clearTimeout(timer)
        }, [delay])

        if (!book) return null

        return (
            <div className={`book-card ${isVisible ? "visible" : ""}`}>
                <div className="book-badge">{book.badge || "New"}</div>

                <div className="book-image-container">
                    <img
                        src={
                            book.images?.length
                                ? `http://localhost:8000/storage/${book.images[0]}`
                                : "/placeholder.svg"
                        }
                        alt={book.title}
                        className="book-image"
                        onError={e => {
                            e.target.src = "/placeholder.svg"
                        }}
                    />

                    <div className="hover-actions">
                        <button
                            className={`action-button ${
                                isInWishlist ? "active" : ""
                            }`}
                            onClick={() => onWishlist()}
                        >
                            <Heart
                                size={18}
                                fill={isInWishlist ? "currentColor" : "none"}
                            />
                        </button>
                        <button
                            className="action-button"
                            onClick={() => onQuickView()}
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            className={`action-button ${
                                isInCart ? "disabled" : ""
                            }`}
                            onClick={() => onAddToCart()}
                            disabled={isInCart}
                        >
                            {isInCart ? (
                                <Check size={18} />
                            ) : (
                                <ShoppingCart size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="book-content">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">By {book.author || "Unknown"}</p>
                    <div className="book-price">
                        {book.rental_price && (
                            <span className="original-price">
                                ${book.rental_price}
                            </span>
                        )}
                        <span className="current-price">${book.price}</span>
                    </div>
                    <button
                        className="add-to-cart-btn"
                        onClick={() => onAddToCart()}
                        disabled={isInCart}
                    >
                        {isInCart ? (
                            <>
                                <Check size={16} /> In Cart
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={16} /> Add to Cart
                            </>
                        )}
                    </button>
                </div>

                <style jsx>{`
                    .book-card {
                        position: relative;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                        opacity: 0;
                        transform: translateY(20px);
                        max-width: 300px;
                        margin: 0 auto 20px;
                    }
                    .book-card.visible {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .book-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    }
                    .book-badge {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        background: #7c3aed;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        z-index: 2;
                    }
                    .book-image-container {
                        position: relative;
                        height: 200px;
                        overflow: hidden;
                    }
                    .book-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }
                    .book-card:hover .book-image {
                        transform: scale(1.05);
                    }
                    .hover-actions {
                        position: absolute;
                        bottom: 10px;
                        right: 10px;
                        display: flex;
                        gap: 8px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    .book-card:hover .hover-actions {
                        opacity: 1;
                    }
                    .action-button {
                        background: rgba(255, 255, 255, 0.9);
                        border: none;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .action-button:hover {
                        transform: scale(1.1);
                    }
                    .action-button.active {
                        color: #ff4757;
                    }
                    .action-button.disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                    }
                    .book-content {
                        padding: 15px;
                    }
                    .book-title {
                        font-size: 1.1rem;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .book-author {
                        color: #64748b;
                        font-size: 0.9rem;
                        margin-bottom: 10px;
                    }
                    .book-price {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .current-price {
                        color: #7c3aed;
                        font-weight: bold;
                        font-size: 1.2rem;
                    }
                    .original-price {
                        color: #94a3b8;
                        text-decoration: line-through;
                        font-size: 0.9rem;
                    }
                    .add-to-cart-btn {
                        width: 100%;
                        background: #7c3aed;
                        color: white;
                        border: none;
                        padding: 10px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        transition: background 0.2s ease;
                    }
                    .add-to-cart-btn:hover {
                        background: #6d28d9;
                    }
                    .add-to-cart-btn:disabled {
                        background: #94a3b8;
                        cursor: not-allowed;
                    }
                `}</style>
            </div>
        )
    }
)

export default function RagChat() {
    const [question, setQuestion] = useState("")
    const [results, setResults] = useState([])
    const [assistant, setAssistant] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [wishlist, setWishlist] = useState([])
    const [cart, setCart] = useState([])
    const [showResults, setShowResults] = useState(false)

    const API_URL = "http://127.0.0.1:8000/api/query"
    const navigate = useNavigate()

    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || []
        const savedCart = JSON.parse(localStorage.getItem("cart")) || []
        setWishlist(savedWishlist)
        setCart(savedCart)
    }, [])

    const handleQuery = useCallback(async () => {
        if (!question.trim()) return

        setLoading(true)
        setErrorMsg("")
        setAssistant("")
        setShowResults(false)

        try {
            const { data } = await axios.post(API_URL, { question })

            if (data.results?.length) {
                setResults(data.results)
                setShowResults(true)
            } else if (data.message) {
                setAssistant(data.message)
            } else {
                setAssistant("❌ No results found.")
            }
        } catch (err) {
            console.error(err)
            setErrorMsg(
                "⚠️ Error connecting to server. Make sure the server is running"
            )
        } finally {
            setLoading(false)
        }
    }, [question])

    const handleKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleQuery()
        }
    }

    const toggleWishlist = book => {
        const isInWishlist = wishlist.some(item => item.id === book.id)
        let updatedWishlist

        if (isInWishlist) {
            updatedWishlist = wishlist.filter(item => item.id !== book.id)
            Swal.fire({
                icon: "success",
                title: "Removed!",
                text: "Book removed from wishlist",
                timer: 1500,
            })
        } else {
            updatedWishlist = [...wishlist, book]
            Swal.fire({
                icon: "success",
                title: "Added!",
                text: "Book added to wishlist",
                timer: 1500,
            })
        }

        setWishlist(updatedWishlist)
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    }

    const addToCart = book => {
        const isInCart = cart.some(item => item.id === book.id)

        if (isInCart) {
            Swal.fire({
                icon: "info",
                title: "Already in Cart",
                text: "This book is already in your cart",
                timer: 1500,
            })
            return
        }

        const updatedCart = [...cart, book]
        setCart(updatedCart)
        localStorage.setItem("cart", JSON.stringify(updatedCart))

        Swal.fire({
            icon: "success",
            title: "Added to Cart!",
            text: "The book has been added to your shopping cart",
            timer: 1500,
        })
    }

    return (
        <>
            <Navbar />
            <div className="container py-4" dir="ltr">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <header className="text-center mb-5">
                            <h1 className="display-5 fw-bold text-primary mb-3">
                                💡 Book Share Library
                            </h1>
                            <p className="lead text-muted">
                                Search for educational books and scientific
                                references easily
                            </p>
                        </header>

                        <div className="card shadow-sm mb-4 border-0">
                            <div className="card-body p-4">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={e =>
                                            setQuestion(e.target.value)
                                        }
                                        onKeyDown={handleKeyDown}
                                        className="form-control border-end-0"
                                        placeholder="Type your question here..."
                                        style={{
                                            borderRadius:
                                                "0.375rem 0 0 0.375rem",
                                        }}
                                    />
                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={handleQuery}
                                        disabled={loading}
                                        style={{
                                            borderRadius:
                                                "0 0.375rem 0.375rem 0",
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search
                                                    size={18}
                                                    className="me-2"
                                                />
                                                Search
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading && (
                            <div className="text-center my-5 py-4">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    style={{ width: "3rem", height: "3rem" }}
                                />
                                <p className="mt-3 text-muted">
                                    Searching the database...
                                </p>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="alert alert-danger text-center mt-4">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {errorMsg}
                            </div>
                        )}

                        {!loading && assistant && (
                            <div className="card shadow-sm mb-4 border-0">
                                <div className="card-body">
                                    <h5 className="card-title text-primary mb-3">
                                        🔍 Search Result
                                    </h5>
                                    <div
                                        className="alert alert-light border"
                                        style={{ whiteSpace: "pre-wrap" }}
                                    >
                                        {assistant}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showResults && results.length > 0 && (
                            <section className="mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="text-primary">
                                        <i className="bi bi-book me-2"></i>
                                        Book ({results.length})
                                    </h4>
                                    <div className="d-flex">
                                        <button className="btn btn-sm btn-outline-secondary me-2">
                                            <Filter
                                                size={16}
                                                className="me-1"
                                            />
                                            Filter
                                        </button>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    {results.map((book, i) => (
                                        <div
                                            key={`${book.id}-${i}`}
                                            className="col-md-6 col-lg-4"
                                        >
                                            <BookCard
                                                book={book}
                                                isInWishlist={wishlist.some(
                                                    item => item.id === book.id
                                                )}
                                                isInCart={cart.some(
                                                    item => item.id === book.id
                                                )}
                                                onWishlist={() =>
                                                    toggleWishlist(book)
                                                }
                                                onAddToCart={() =>
                                                    addToCart(book)
                                                }
                                                onQuickView={() =>
                                                    navigate(
                                                        `/books/${book.id}`
                                                    )
                                                }
                                                delay={i * 100}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
