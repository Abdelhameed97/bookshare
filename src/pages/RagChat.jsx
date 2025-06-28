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

export default function RagChat() {
    const [question, setQuestion] = useState("")
    const [results, setResults] = useState([])
    const [assistant, setAssistant] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [wishlist, setWishlist] = useState([])
    const [cart, setCart] = useState([])

    const API_URL = "http://127.0.0.1:8000/query"

    // تحميل القوائم من localStorage عند التحميل
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
                "⚠️ Error connecting to server. Make sure the server is running on http://127.0.0.1:8001"
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

    // إضافة/إزالة من المفضلة
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

    // إضافة إلى عربة التسوق
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

    // عرض تفاصيل الكتاب
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
                ? `http://localhost:8001/storage/${book.images[0]}`
                : "/placeholder.svg",
            imageWidth: 200,
            imageHeight: 300,
            showCloseButton: true,
            showConfirmButton: false,
        })
    }

    return (
        <div className="container py-4" dir="rtl">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header Section */}
                    <header className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-primary mb-3">
                            💡 مكتبة المعرفة
                        </h1>
                        <p className="lead text-muted">
                            ابحث عن الكتب التعليمية والمراجع العلمية بسهولة
                        </p>
                    </header>

                    {/* Search Section */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-body p-4">
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="form-control border-end-0"
                                    placeholder="اكتب سؤالك هنا... مثال: كتب عن الذكاء العاطفي أو علوم الصف الثالث الإعدادي"
                                    style={{
                                        borderRadius: "0.375rem 0 0 0.375rem",
                                    }}
                                />
                                <button
                                    className="btn btn-primary px-4"
                                    onClick={handleQuery}
                                    disabled={loading}
                                    style={{
                                        borderRadius: "0 0.375rem 0.375rem 0",
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            جاري البحث...
                                        </>
                                    ) : (
                                        <>
                                            <Search
                                                size={18}
                                                className="me-2"
                                            />
                                            بحث
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
                                جاري البحث في قاعدة البيانات...
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
                                    🔍 نتيجة البحث
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
                                    النتائج ({results.length})
                                </h4>
                                <div className="d-flex">
                                    <button className="btn btn-sm btn-outline-secondary me-2">
                                        <Filter size={16} className="me-1" />
                                        تصفية
                                    </button>
                                </div>
                            </div>

                            <div className="row g-4">
                                {results.map((book, i) => {
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
                                                    style={{ height: "200px" }}
                                                >
                                                    {book.images?.length ? (
                                                        <img
                                                            src={`http://localhost:8001/storage/${book.images[0]}`}
                                                            alt={book.title}
                                                            className="img-fluid w-100 h-100 object-fit-cover"
                                                        />
                                                    ) : (
                                                        <div className="bg-light w-100 h-100 d-flex align-items-center justify-content-center">
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
                                                                viewDetails(
                                                                    book
                                                                )
                                                            }
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${
                                                                isInCart
                                                                    ? "btn-success"
                                                                    : "btn-primary"
                                                            } mx-1`}
                                                            onClick={() =>
                                                                addToCart(book)
                                                            }
                                                            disabled={isInCart}
                                                        >
                                                            {isInCart ? (
                                                                <Check
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <ShoppingCart
                                                                    size={16}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="card-body">
                                                    <h5 className="card-title fw-bold text-truncate">
                                                        {book.title}
                                                    </h5>
                                                    <div className="d-flex align-items-center mb-2">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    fill={
                                                                        i < 4
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                    className="text-warning me-1"
                                                                />
                                                            )
                                                        )}
                                                        <small className="text-muted ms-2">
                                                            (4.5)
                                                        </small>
                                                    </div>
                                                    <p className="card-text small text-muted mb-3">
                                                        {book.description?.slice(
                                                            0,
                                                            100
                                                        ) ||
                                                            "No description available."}
                                                        {book.description
                                                            ?.length > 100 &&
                                                            "..."}
                                                    </p>
                                                </div>

                                                <div className="card-footer bg-white border-0">
                                                    <ul className="list-unstyled small mb-0">
                                                        <li className="mb-2">
                                                            <i className="bi bi-person-fill text-muted me-2"></i>
                                                            <span className="text-dark">
                                                                المؤلف:
                                                            </span>{" "}
                                                            {book.author ||
                                                                "غير معروف"}
                                                        </li>
                                                        <li className="mb-2">
                                                            <i className="bi bi-tag-fill text-muted me-2"></i>
                                                            <span className="text-dark">
                                                                التصنيف:
                                                            </span>{" "}
                                                            {book.category ||
                                                                "عام"}
                                                        </li>
                                                        <li className="mb-2">
                                                            <i className="bi bi-cash-coin text-muted me-2"></i>
                                                            <span className="text-dark">
                                                                السعر:
                                                            </span>{" "}
                                                            {book.price || "0"}{" "}
                                                            ج.م
                                                        </li>
                                                        {book.rental_price && (
                                                            <li className="mb-2">
                                                                <i className="bi bi-arrow-repeat text-muted me-2"></i>
                                                                <span className="text-dark">
                                                                    للإيجار:
                                                                </span>{" "}
                                                                {
                                                                    book.rental_price
                                                                }{" "}
                                                                ج.م
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
    )
}
