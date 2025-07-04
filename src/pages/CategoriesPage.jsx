"use client"
import { Book, Heart, Palette, Clock, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/HomePage/Navbar"
import "../style/Categories.css"
import axios from "axios"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import Swal from "sweetalert2"

const CategoriesPage = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [categoriesPerPage] = useState(6)
    const [categoriesBooks, setCategoriesBooks] = useState({})
    const navigate = useNavigate()

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/categories"
                )
                if (response.status !== 200) {
                    throw new Error("Failed to fetch categories")
                }
                const data = response.data
                setCategories(data.categories || data)
                setError(null)
            } catch (error) {
                console.error("Error fetching categories:", error)
                setError(error.message)
                setCategories(getDefaultCategories())
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()

        // Set up auto-refresh every minute
        const interval = setInterval(() => {
            fetchCategories()
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    // Fetch books for each category (to show preview)
    useEffect(() => {
        const fetchBooksForCategories = async () => {
            const booksMap = {}
            for (const cat of categories) {
                try {
                    const res = await axios.get(
                        `http://localhost:8000/api/categories/${cat.id}`
                    )
                    if (res.status === 200) {
                        const data = res.data
                        booksMap[cat.id] = data.books
                            ? data.books.slice(0, 3) // Show 3 books per category
                            : []
                    } else {
                        booksMap[cat.id] = []
                    }
                } catch {
                    booksMap[cat.id] = []
                }
            }
            setCategoriesBooks(booksMap)
        }
        if (categories.length > 0) fetchBooksForCategories()
    }, [categories])

    // Filter categories based on search term
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Get current categories for pagination
    const indexOfLastCategory = currentPage * categoriesPerPage
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
    const currentCategories = filteredCategories.slice(
        indexOfFirstCategory,
        indexOfLastCategory
    )

    // Reset currentPage if filteredCategories exist but currentCategories is empty
    useEffect(() => {
        if (filteredCategories.length > 0 && currentCategories.length === 0) {
            setCurrentPage(1)
        }
    }, [filteredCategories, currentCategories])

    // Helper functions
    const getIconComponent = iconName => {
        const icons = {
            Book: Book,
            Heart: Heart,
            Palette: Palette,
            Clock: Clock,
        }
        return icons[iconName] || Book
    }

    const getDefaultCategories = () => [
        {
            id: 1,
            name: "Children's Books",
            type: "general",
            color_class: "blue",
            icon: "Book",
            image: "/images/children-books.jpg",
        },
        {
            id: 2,
            name: "Science",
            type: "Elementary school science books",
            color_class: "pink",
            icon: "Heart",
            image: "/images/romance-books.jpg",
        },
        {
            id: 3,
            name: "Art & Architecture",
            type: "fiction",
            color_class: "purple",
            icon: "Palette",
            image: "/images/art-books.jpg",
        },
        {
            id: 4,
            name: "History",
            type: "history",
            color_class: "amber",
            icon: "Clock",
            image: "/images/history-books.jpg",
        },
    ]

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("user"))
    const userId = currentUser?.id
    const { cartItems, fetchCartItems, addToCart } = useCart(userId)
    const { wishlistItems, fetchWishlist, addToWishlist, removeItem } =
        useWishlist(userId)

    // Helper functions for cart and wishlist
    const isInCart = bookId => cartItems.some(item => item.book_id === bookId)
    const isInWishlist = bookId =>
        wishlistItems.some(item => item.book_id === bookId)

    const handleAddToWishlist = async book => {
        try {
            if (!userId) {
                Swal.fire({
                    icon: "error",
                    title: "Login Required",
                    text: "Please login to use the wishlist feature",
                })
                return navigate("/login")
            }

            if (isInWishlist(book.id)) {
                const itemToRemove = wishlistItems.find(
                    item => item.book_id === book.id
                )
                await removeItem(itemToRemove.id)
                Swal.fire({
                    icon: "success",
                    title: "Removed!",
                    text: "Book removed from wishlist",
                    timer: 1500,
                })
            } else {
                await addToWishlist(book.id)
                Swal.fire({
                    icon: "success",
                    title: "Added!",
                    text: "Book added to wishlist",
                    timer: 1500,
                })
            }
            await fetchWishlist()
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Failed to update wishlist",
            })
        }
    }

    const handleAddToCart = async book => {
        try {
            if (!userId) {
                Swal.fire({
                    icon: "error",
                    title: "Login Required",
                    text: "Please login to add items to cart",
                })
                return navigate("/login")
            }

            if (isInCart(book.id)) {
                Swal.fire({
                    icon: "info",
                    title: "Already in Cart",
                    text: "This book is already in your cart",
                    timer: 1500,
                })
                return
            }

            const result = await Swal.fire({
                title: "Add to Cart?",
                text: "This book will be added to your shopping cart",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#6c757d",
            })

            if (!result.isConfirmed) return

            await addToCart(book.id)
            await fetchCartItems()

            Swal.fire({
                icon: "success",
                title: "Added to Cart!",
                text: "The book has been added to your shopping cart",
                timer: 1500,
            })
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed to Add",
                text: error.message || "Failed to add to cart",
            })
        }
    }

    const handleQuickView = book => {
        navigate(`/books/${book.id}`, { replace: true })
    }

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">⚠️ {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="categories-page">
            <Navbar />
            <div className="container">
                <h1 className="text-center my-5 browse-categories-title">
                    Browse Categories
                </h1>

                {/* Search Bar */}
                <div className="search-bar mb-5 d-flex justify-content-center">
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: 400,
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-control form-control-lg shadow-sm"
                            style={{
                                borderRadius: 30,
                                paddingLeft: 44,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#aaa",
                                pointerEvents: "none",
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="row g-4">
                    {currentCategories.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <h2 className="text-danger fw-bold mb-3">
                                No Categories Found
                            </h2>
                            <p className="text-muted">
                                No categories match your search
                            </p>
                        </div>
                    ) : (
                        currentCategories.map((category, idx) => {
                            const IconComponent = getIconComponent(
                                category.icon
                            )
                            const books = categoriesBooks[category.id] || []

                            // Category colors
                            const categoryColors = [
                                "#e74c3c", // Red
                                "#fd7e14", // Orange
                                "#6f42c1", // Purple
                                "#20c997", // Teal green
                                "#0d6efd", // Blue
                                "#ffc107", // Yellow
                                "#198754", // Green
                            ]
                            const bgColor =
                                categoryColors[idx % categoryColors.length]

                            return (
                                <div
                                    key={category.id}
                                    className="col-md-6 col-lg-4"
                                >
                                    <div
                                        className="category-card card h-100 shadow-lg border-0 overflow-hidden"
                                        style={{
                                            backgroundColor: bgColor,
                                            minHeight: "400px",
                                        }}
                                    >
                                        <div className="card-body text-white d-flex flex-column p-4">
                                            <div className="d-flex align-items-center mb-4">
                                                <IconComponent
                                                    size={32}
                                                    className="me-3"
                                                />
                                                <h3 className="card-title mb-0 fs-3">
                                                    {category.name}
                                                </h3>
                                            </div>

                                            <div className="mb-4">
                                                <span className="badge bg-light text-dark fs-6 me-3">
                                                    {books.length} books
                                                </span>
                                                <Link
                                                    to={`/categories/${category.id}`}
                                                    className="btn btn-lg btn-outline-light"
                                                >
                                                    View All
                                                </Link>
                                            </div>

                                            {/* Books Preview */}
                                            {books.length > 0 ? (
                                                <div className="d-flex gap-3 justify-content-center mt-auto">
                                                    {books.map(book => (
                                                        <div
                                                            key={book.id}
                                                            className="text-center"
                                                            style={{
                                                                width: "100px",
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    book
                                                                        .images?.[0]
                                                                        ? book.images[0].startsWith(
                                                                              "http"
                                                                          )
                                                                            ? book
                                                                                  .images[0]
                                                                            : `http://localhost:8000/storage/${book.images[0]}`
                                                                        : "/placeholder.svg"
                                                                }
                                                                alt={book.title}
                                                                className="img-fluid rounded mb-2"
                                                                style={{
                                                                    height: "80px",
                                                                    width: "80px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                            <div
                                                                className="fs-6 text-truncate text-white fw-medium"
                                                                title={
                                                                    book.title
                                                                }
                                                            >
                                                                {book.title}
                                                            </div>
                                                            {/* تم حذف الأزرار الخاصة بالكتاب (wishlist/cart/view) */}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-white-50 mb-0 fs-5">
                                                    No books in this category
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Pagination (Admin-style) */}
                {filteredCategories.length > categoriesPerPage && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: 32,
                            gap: 8,
                        }}
                    >
                        <button
                            onClick={() =>
                                setCurrentPage(p => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            style={{
                                padding: "0.5rem 1rem",
                                borderRadius: 6,
                                border: "1px solid #d1d5db",
                                background:
                                    currentPage === 1 ? "#f3f4f6" : "white",
                                color: "#222",
                                cursor:
                                    currentPage === 1
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            {"<"}
                        </button>
                        {[
                            ...Array(
                                Math.ceil(
                                    filteredCategories.length /
                                        categoriesPerPage
                                )
                            ),
                        ].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    background:
                                        currentPage === idx + 1
                                            ? "#3b82f6"
                                            : "white",
                                    color:
                                        currentPage === idx + 1
                                            ? "white"
                                            : "#222",
                                    fontWeight:
                                        currentPage === idx + 1 ? 700 : 500,
                                }}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage(p =>
                                    Math.min(
                                        p + 1,
                                        Math.ceil(
                                            filteredCategories.length /
                                                categoriesPerPage
                                        )
                                    )
                                )
                            }
                            disabled={
                                currentPage ===
                                Math.ceil(
                                    filteredCategories.length /
                                        categoriesPerPage
                                )
                            }
                            style={{
                                padding: "0.5rem 1rem",
                                borderRadius: 6,
                                border: "1px solid #d1d5db",
                                background:
                                    currentPage ===
                                    Math.ceil(
                                        filteredCategories.length /
                                            categoriesPerPage
                                    )
                                        ? "#f3f4f6"
                                        : "white",
                                color: "#222",
                                cursor:
                                    currentPage ===
                                    Math.ceil(
                                        filteredCategories.length /
                                            categoriesPerPage
                                    )
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            {">"}
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                .browse-categories-title {
                    font-size: 3rem;
                    font-weight: 800;
                    padding: 1.5rem 0;
                    background: linear-gradient(90deg, #5b21b6 0%, #7c3aed 100%);
                    color: #fff;
                    border-radius: 1.5rem;
                    box-shadow: 0 4px 24px rgba(91,33,182,0.13);
                    margin-bottom: 2.5rem;
                    transition: background 0.3s, box-shadow 0.3s, transform 0.2s;
                }
                .browse-categories-title:hover {
                    background: linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%);
                    box-shadow: 0 8px 32px rgba(91,33,182,0.18);
                    transform: scale(1.03);
                }
            `}</style>
        </div>
    )
}

export default CategoriesPage
