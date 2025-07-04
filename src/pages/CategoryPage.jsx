import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import {
    Search,
    Filter,
    Heart,
    Eye,
    ShoppingCart,
    Star,
    Check,
} from "lucide-react"
import Swal from "sweetalert2"
import api from "../services/api"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import Navbar from "../components/HomePage/Navbar"
import axios from "axios"
import NotFound from "./NotFound"

const CategoryPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { cartItems, fetchCartItems } = useCart()
    const { wishlistItems, fetchWishlist, addToWishlist, removeItem } =
        useWishlist()

    const [books, setBooks] = useState([])
    const [category, setCategory] = useState("")
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(false)
    const [categoryFound, setCategoryFound] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [priceFilter, setPriceFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const booksPerPage = 6

    // Debounced search logic (if it was different before, restore it here)
    const debouncedSearch = useCallback(term => {
        let timeoutId
        clearTimeout(timeoutId)
        setSearchLoading(true)
        timeoutId = setTimeout(() => {
            setSearchTerm(term)
            setSearchLoading(false)
        }, 300)
    }, [])

    // Fetch category books
    useEffect(() => {
        const fetchCategoryBooks = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8000/api/categories/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                            Accept: "application/json",
                        },
                    }
                )
                if (!res.status || res.status !== 200) {
                    setApiError(true)
                    setLoading(false)
                    return
                }
                const data = res.data
                if (!data || (!data.books && !data.name)) {
                    setCategoryFound(false)
                } else {
                    const processedBooks = (data.books || []).map(book => ({
                        id: book.id,
                        user_id: book.user_id,
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
                    }))

                    setBooks(processedBooks)
                    setCategory(data.name || "Category")
                    setCategoryFound(true)
                }
            } catch (error) {
                console.error("❌ API error:", error)
                setApiError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchCategoryBooks()
        fetchWishlist()
        fetchCartItems()
    }, [id, fetchWishlist, fetchCartItems])

    // Helper functions
    const isInCart = bookId => {
        return (
            Array.isArray(cartItems) &&
            cartItems.some(item => item.book_id === bookId)
        )
    }

    const isInWishlist = bookId => {
        return (
            Array.isArray(wishlistItems) &&
            wishlistItems.some(item => item.book_id === bookId)
        )
    }

    const handleAddToWishlist = async bookId => {
        try {
            const currentUser = JSON.parse(localStorage.getItem("user"))
            const book = books.find(b => b.id === bookId)

            if (!book || !currentUser) {
                throw new Error("Missing book or user info")
            }

            const isOwnBook = book.user_id === currentUser.id

            if (isOwnBook) {
                await Swal.fire({
                    icon: "info",
                    title: "Invalid Action",
                    text: "You cannot add your own book to your wishlist.",
                    timer: 2000,
                })
                return
            }

            if (isInWishlist(bookId)) {
                const itemToRemove = wishlistItems.find(
                    item => item.book_id === bookId
                )
                await removeItem(itemToRemove.id)
                await Swal.fire({
                    icon: "success",
                    title: "Removed!",
                    text: "Book removed from wishlist",
                    timer: 1500,
                })
            } else {
                await addToWishlist(bookId)
                await Swal.fire({
                    icon: "success",
                    title: "Added!",
                    text: "Book added to wishlist",
                    timer: 1500,
                })
            }

            await fetchWishlist()
        } catch (err) {
            console.error("Wishlist error:", err)
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
            })
        }
    }

    const handleAddToCart = async bookId => {
        try {
            const result = await Swal.fire({
                title: "Add to Cart?",
                text: "This book will be added to your shopping cart",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#6c757d",
            })

            if (!result.isConfirmed) return

            const book = books.find(b => b.id === bookId)
            const type = book.originalPrice ? "rent" : "buy"

            await api.addToCart(book.id, { type, quantity: 1 })
            await fetchCartItems()

            await Swal.fire({
                icon: "success",
                title: "Added to Cart!",
                text: "The book has been added to your shopping cart",
                timer: 1500,
            })
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Failed to Add",
                text: err.message,
            })
        }
    }

    const handleQuickView = bookId => navigate(`/books/${bookId}`)

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

    const categoryColors = [
        "#6f42c1", // Purple
        "#b49a7d", // Coffee
        "#0dcaf0", // Light Blue
        "#a084ee", // Light Purple
        "#20c997", // Turquoise
        "#fd7e14", // Orange
        "#adb5bd", // Light Gray
    ]

    const getCategoryColor = (category, idx = 0) => {
        if (!category) return categoryColors[0]
        const normalized = category.toLowerCase()
        if (normalized.includes("novel")) return categoryColors[0]
        if (normalized.includes("coffee")) return categoryColors[1]
        if (normalized.includes("blue")) return categoryColors[2]
        if (normalized.includes("purple")) return categoryColors[3]
        if (normalized.includes("turquoise")) return categoryColors[4]
        if (normalized.includes("orange")) return categoryColors[5]
        return categoryColors[idx % categoryColors.length]
    }

    // Filtering and pagination
    const filteredBooks = books.filter(
        book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (priceFilter === "" ||
                parseFloat(book.price) <= parseFloat(priceFilter))
    )

    const indexOfLastBook = currentPage * booksPerPage
    const indexOfFirstBook = indexOfLastBook - booksPerPage
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage)

    const handleSearchChange = e => {
        debouncedSearch(e.target.value)
        setCurrentPage(1)
    }

    const handlePriceChange = e => {
        setPriceFilter(e.target.value)
        setCurrentPage(1)
    }

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1)
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
    }

    const clearFilters = () => {
        setSearchTerm("")
        setPriceFilter("")
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#199A8E]"></div>
            </div>
        )
    }

    if (apiError || !categoryFound || books.length === 0) {
        return <NotFound />
    }

    return (
        <>
            <Navbar />
            <section className="bg-[#F5F8FF] py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    {/* Category Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#101623] mb-3">
                            {category} Books
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Browse our collection of {category.toLowerCase()}{" "}
                            books. Find your next favorite read!
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-10 bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search
                                        className="text-gray-400"
                                        size={18}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search books by title..."
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
                                />
                                {searchLoading && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#199A8E]"></div>
                                    </div>
                                )}
                            </div>

                            <div className="relative w-full md:w-1/3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter
                                        className="text-gray-400"
                                        size={18}
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Max price"
                                    min="0"
                                    value={priceFilter}
                                    onChange={handlePriceChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results info */}
                    <div className="mb-6 flex justify-between items-center">
                        <span className="text-gray-600">
                            {filteredBooks.length} book
                            {filteredBooks.length !== 1 ? "s" : ""} found
                            {searchTerm && ` for "${searchTerm}"`}
                        </span>
                        {(searchTerm || priceFilter) && (
                            <button
                                onClick={clearFilters}
                                className="text-[#199A8E] hover:text-[#157d74] text-sm font-medium"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Books List */}
                    {filteredBooks.length === 0 ? (
                        <div className="text-center bg-white p-10 rounded-xl shadow-sm">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                No books found
                            </h3>
                            <p className="text-lg text-gray-600 mb-6">
                                Try adjusting your search or filter to find what
                                you're looking for.
                            </p>
                            <button
                                onClick={clearFilters}
                                className="bg-[#199A8E] hover:bg-[#157d74] text-white px-6 py-3 rounded-full shadow-lg transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="row" style={{ rowGap: "1.5rem" }}>
                                {currentBooks.map((book, index) => (
                                    <div
                                        key={book.id}
                                        className="col-12 col-sm-6 col-md-4 mb-4 d-flex align-items-stretch"
                                    >
                                        <div
                                            className="book-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 relative w-100 d-flex flex-column"
                                            style={{
                                                animationDelay: `${
                                                    index * 0.1
                                                }s`,
                                                opacity: 0,
                                                animation:
                                                    "fadeIn 0.5s forwards",
                                            }}
                                        >
                                            <div
                                                className="book-badge absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
                                                style={{
                                                    backgroundColor:
                                                        getStatusColor(
                                                            book.status
                                                        ),
                                                }}
                                            >
                                                {book.badge}
                                            </div>
                                            <div className="book-image-container relative">
                                                <img
                                                    src={book.image}
                                                    alt={book.title}
                                                    className="w-full h-48 object-cover"
                                                    loading="lazy"
                                                    onError={e => {
                                                        e.currentTarget.src =
                                                            "/placeholder.svg?height=300&width=200"
                                                    }}
                                                />
                                                <div className="image-overlay absolute inset-0 bg-black opacity-0 hover:opacity-10 transition duration-300"></div>

                                                <div className="hover-actions absolute top-2 right-2 flex flex-col gap-2 opacity-0 hover:opacity-100 transition duration-300">
                                                    <button
                                                        className={`action-button p-2 rounded-full ${
                                                            isInWishlist(
                                                                book.id
                                                            )
                                                                ? "bg-red-100 text-red-500"
                                                                : "bg-white text-gray-700"
                                                        }`}
                                                        onClick={() =>
                                                            handleAddToWishlist(
                                                                book.id
                                                            )
                                                        }
                                                    >
                                                        <Heart
                                                            size={18}
                                                            fill={
                                                                isInWishlist(
                                                                    book.id
                                                                )
                                                                    ? "currentColor"
                                                                    : "none"
                                                            }
                                                        />
                                                    </button>
                                                    <button
                                                        className="action-button p-2 rounded-full bg-white text-gray-700"
                                                        onClick={() =>
                                                            handleQuickView(
                                                                book.id
                                                            )
                                                        }
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className={`action-button p-2 rounded-full ${
                                                            isInCart(book.id)
                                                                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                                                : "bg-white text-gray-700"
                                                        }`}
                                                        onClick={
                                                            !isInCart(book.id)
                                                                ? () =>
                                                                      handleAddToCart(
                                                                          book.id
                                                                      )
                                                                : undefined
                                                        }
                                                        disabled={
                                                            isInCart(book.id) ||
                                                            book.status !==
                                                                "available"
                                                        }
                                                    >
                                                        {isInCart(book.id) ? (
                                                            <Check size={18} />
                                                        ) : (
                                                            <ShoppingCart
                                                                size={18}
                                                            />
                                                        )}
                                                    </button>
                                                </div>

                                                <div
                                                    className="category-tag absolute bottom-2 left-2 text-xs px-2 py-1 rounded text-white font-bold"
                                                    style={{
                                                        backgroundColor:
                                                            getCategoryColor(
                                                                book.category,
                                                                index
                                                            ),
                                                    }}
                                                >
                                                    {book.category}
                                                </div>
                                            </div>
                                            <div className="p-4 flex-grow-1 d-flex flex-column">
                                                <div className="book-rating flex items-center mb-2">
                                                    <div className="stars flex">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={
                                                                        i <
                                                                        Math.floor(
                                                                            book.rating
                                                                        )
                                                                            ? "text-yellow-400 fill-current"
                                                                            : "text-gray-300"
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <span className="rating-text text-xs text-gray-500 ml-1">
                                                        {book.rating} (
                                                        {book.reviews} reviews)
                                                    </span>
                                                </div>
                                                <h3 className="book-title font-semibold text-lg mb-1 line-clamp-1">
                                                    {book.title}
                                                </h3>
                                                <p className="book-author text-sm text-gray-500 mb-3">
                                                    {book.author}
                                                </p>
                                                <div className="book-price flex items-center gap-2 mb-3">
                                                    {book.originalPrice && (
                                                        <span className="original-price text-sm text-gray-400 line-through">
                                                            {book.originalPrice}
                                                        </span>
                                                    )}
                                                    <span className="current-price font-bold text-[#199A8E]">
                                                        {book.price}
                                                    </span>
                                                </div>
                                                <button
                                                    className={`w-full py-2 rounded-md flex items-center justify-center gap-2 ${
                                                        isInCart(book.id)
                                                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                                            : "bg-[#199A8E] hover:bg-[#157d74] text-white"
                                                    }`}
                                                    onClick={
                                                        !isInCart(book.id)
                                                            ? () =>
                                                                  handleAddToCart(
                                                                      book.id
                                                                  )
                                                            : undefined
                                                    }
                                                    disabled={
                                                        isInCart(book.id) ||
                                                        book.status !==
                                                            "available"
                                                    }
                                                >
                                                    {isInCart(book.id) ? (
                                                        <Check size={16} />
                                                    ) : (
                                                        <ShoppingCart
                                                            size={16}
                                                        />
                                                    )}
                                                    <span>
                                                        {isInCart(book.id)
                                                            ? "In Cart"
                                                            : "Add to Cart"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls (Admin-style) */}
                            {totalPages > 1 && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: 48,
                                        gap: 8,
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            setCurrentPage(p =>
                                                Math.max(p - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            background:
                                                currentPage === 1
                                                    ? "#f3f4f6"
                                                    : "white",
                                            color: "#222",
                                            cursor:
                                                currentPage === 1
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                    >
                                        {"<"}
                                    </button>
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx + 1}
                                            onClick={() =>
                                                setCurrentPage(idx + 1)
                                            }
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
                                                    currentPage === idx + 1
                                                        ? 700
                                                        : 500,
                                            }}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setCurrentPage(p =>
                                                Math.min(p + 1, totalPages)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            background:
                                                currentPage === totalPages
                                                    ? "#f3f4f6"
                                                    : "white",
                                            color: "#222",
                                            cursor:
                                                currentPage === totalPages
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                    >
                                        {">"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    )
}

export default CategoryPage
