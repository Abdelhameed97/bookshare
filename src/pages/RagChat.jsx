// src/pages/RagChat.jsx
import React, { useState, useEffect } from "react"
import axios from "axios"
import {
    Heart,
    ShoppingCart,
    Eye,
    Star,
    Check,
    Search,
    Filter,
} from "lucide-react"
import Swal from "sweetalert2"
import Navbar from "../components/HomePage/Navbar"

export default function RagChat() {
    const [question, setQuestion] = useState("")
    const [results, setResults] = useState([])
    const [assistant, setAssistant] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [wishlist, setWishlist] = useState([])
    const [cart, setCart] = useState([])

    const API_URL = "http://127.0.0.1:8000/api/query"

    // Load lists from localStorage on component mount
    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || []
        const savedCart = JSON.parse(localStorage.getItem("cart")) || []
        setWishlist(savedWishlist)
        setCart(savedCart)
    }, [])

    const handleQuery = async () => {
        if (!question.trim()) return
        setLoading(true)
        setErrorMsg("")
        setResults([])
        setAssistant("")

        try {
            const { data } = await axios.post(API_URL, { question })

            if (data.results?.length) {
                setResults(data.results)
            } else if (data.message) {
                setAssistant(data.message)
            } else {
                setAssistant("❌ No results found.")
            }
        } catch (err) {
            console.error(err)
            setErrorMsg(
                "⚠️ Error connecting to server. Make sure the server is running on http://127.0.0.1:8000"
            )
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleQuery()
        }
    }

    // Toggle wishlist status
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

    // Add book to cart
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

    // View book details
    const viewDetails = book => {
        Swal.fire({
            title: book.title,
            html: `
        <div class="text-start">
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Category:</strong> ${book.category}</p>
          <p><strong>Price:</strong> ${book.price} EGP</p>
          ${
              book.rental_price
                  ? `<p><strong>Rental Price:</strong> ${book.rental_price} EGP</p>`
                  : ""
          }
          ${
              book.educational_level
                  ? `<p><strong>Educational Level:</strong> ${book.educational_level}</p>`
                  : ""
          }
          <p><strong>Description:</strong> ${
              book.description || "No description available"
          }</p>
        </div>
      `,
            imageUrl: book.images?.length
                ? `http://localhost:8000/storage/${book.images[0]}`
                : "/placeholder.svg",
            imageWidth: 200,
            imageHeight: 300,
            showCloseButton: true,
            showConfirmButton: false,
        })
    }

    return (
        <>
            <Navbar />
            <div className="container py-4" dir="ltr">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Header Section */}
                        <header className="text-center mb-5">
                            <h1 className="display-5 fw-bold text-primary mb-3">
                                💡 Knowledge Library
                            </h1>
                            <p className="lead text-muted">
                                Search for educational books and scientific
                                references easily
                            </p>
                        </header>

                        {/* Search Section */}
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
                                        placeholder="Type your question here... e.g. books about emotional intelligence or 3rd grade science"
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

                        {/* Loading & Error States */}
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

                        {/* Assistant Response */}
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

                        {/* Results Grid */}
                        {results.length > 0 && (
                            <section className="mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="text-primary">
                                        <i className="bi bi-book me-2"></i>
                                        Results ({results.length})
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
                                    {results.map((book, i) => {
                                        // Prepare book data
                                        const image =
                                            Array.isArray(book.images) &&
                                            book.images[0]
                                                ? `http://localhost:8000/storage/${book.images[0]}`
                                                : "/placeholder.svg?height=300&width=200"
                                        const title =
                                            book.title ||
                                            book.book_title ||
                                            "No Title"
                                        const author = book.author || "Unknown"
                                        const category =
                                            book.category || "General"
                                        const price = book.price || "0"
                                        const rentalPrice =
                                            book.rental_price || null
                                        const description =
                                            book.description ||
                                            "No description available."

                                        const isInWishlist = wishlist.some(
                                            item => item.id === book.id
                                        )
                                        const isInCart = cart.some(
                                            item => item.id === book.id
                                        )

                                        return (
                                            <div
                                                key={i}
                                                className="col-md-6 col-lg-4"
                                            >
                                                <div className="card h-100 shadow-sm border-0 hover-effect position-relative">
                                                    {/* Wishlist Button */}
                                                    <button
                                                        className={`btn btn-icon position-absolute top-0 end-0 m-2 ${
                                                            isInWishlist
                                                                ? "text-danger"
                                                                : "text-secondary"
                                                        }`}
                                                        onClick={() =>
                                                            toggleWishlist(book)
                                                        }
                                                        style={{ zIndex: 1 }}
                                                        title={
                                                            isInWishlist
                                                                ? "Remove from wishlist"
                                                                : "Add to wishlist"
                                                        }
                                                    >
                                                        <Heart
                                                            size={20}
                                                            fill={
                                                                isInWishlist
                                                                    ? "currentColor"
                                                                    : "none"
                                                            }
                                                        />
                                                    </button>

                                                    {/* Book Image */}
                                                    <div
                                                        className="card-img-top overflow-hidden"
                                                        style={{
                                                            height: "270px",
                                                            minHeight: "270px",
                                                            background:
                                                                "#f8f9fa",
                                                        }}
                                                    >
                                                        {book.images?.length ? (
                                                            <img
                                                                src={image}
                                                                alt={title}
                                                                className="img-fluid w-100 h-100 object-fit-cover"
                                                                style={{
                                                                    minHeight:
                                                                        "270px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="bg-light w-100 h-100 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    minHeight:
                                                                        "270px",
                                                                }}
                                                            >
                                                                <i
                                                                    className="bi bi-book text-muted"
                                                                    style={{
                                                                        fontSize:
                                                                            "3rem",
                                                                    }}
                                                                ></i>
                                                            </div>
                                                        )}

                                                        {/* Quick Actions */}
                                                        <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-50 d-flex justify-content-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-light mx-1"
                                                                onClick={() =>
                                                                    (window.location.href = `/books/${book.id}`)
                                                                }
                                                                title="View details"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm ${
                                                                    isInCart
                                                                        ? "btn-success"
                                                                        : "btn-primary"
                                                                } mx-1`}
                                                                onClick={() =>
                                                                    addToCart(
                                                                        book
                                                                    )
                                                                }
                                                                disabled={
                                                                    isInCart
                                                                }
                                                                title={
                                                                    isInCart
                                                                        ? "Already in cart"
                                                                        : "Add to cart"
                                                                }
                                                            >
                                                                {isInCart ? (
                                                                    <Check
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <ShoppingCart
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="card-body">
                                                        <h5 className="card-title fw-bold text-truncate">
                                                            {title}
                                                        </h5>
                                                        <p className="card-text small text-muted mb-3">
                                                            {description.slice(
                                                                0,
                                                                100
                                                            )}{" "}
                                                            {description.length >
                                                                100 && "..."}
                                                        </p>
                                                    </div>

                                                    <div className="card-footer bg-white border-0">
                                                        <ul className="list-unstyled small mb-0">
                                                            <li className="mb-2">
                                                                <i className="bi bi-person-fill text-muted me-2"></i>
                                                                <span className="text-dark">
                                                                    Author:
                                                                </span>{" "}
                                                                {author}
                                                            </li>
                                                            <li className="mb-2">
                                                                <i className="bi bi-tag-fill text-muted me-2"></i>
                                                                <span className="text-dark">
                                                                    Category:
                                                                </span>{" "}
                                                                {category}
                                                            </li>
                                                            <li className="mb-2">
                                                                <i className="bi bi-cash-coin text-muted me-2"></i>
                                                                <span className="text-dark">
                                                                    Price:
                                                                </span>{" "}
                                                                {price} EGP
                                                            </li>
                                                            {rentalPrice && (
                                                                <li className="mb-2">
                                                                    <i className="bi bi-arrow-repeat text-muted me-2"></i>
                                                                    <span className="text-dark">
                                                                        For
                                                                        Rent:
                                                                    </span>{" "}
                                                                    {
                                                                        rentalPrice
                                                                    }{" "}
                                                                    EGP
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Custom CSS */}
                <style jsx>{`
                    .hover-effect {
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .hover-effect:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
                    }
                    .object-fit-cover {
                        object-fit: cover;
                    }
                    .btn-icon {
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.8);
                    }
                `}</style>
            </div>
        </>
    )
}
