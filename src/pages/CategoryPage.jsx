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
    Book,
} from "lucide-react"
import "../style/category.css"
import Swal from "sweetalert2"
import api from "../services/api"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import Navebar from "../components/HomePage/Navbar.jsx"

const CategoryPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { cartItems, fetchCartItems } = useCart()
    const { wishlistItems, fetchWishlist, addToWishlist, removeItem } =
        useWishlist()

    const [books, setBooks] = useState([])
    const [category, setCategory] = useState({
        name: "",
        type: "General",
    })
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [priceFilter, setPriceFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const booksPerPage = 8

    const debouncedSearch = useCallback(term => {
        let timeoutId
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            setSearchTerm(term)
        }, 300)
    }, [])

    // Fetch category books
    useEffect(() => {
        const fetchCategoryBooks = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8001/api/categories/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                            Accept: "application/json",
                        },
                    }
                )

                if (!res.ok) {
                    setApiError(true)
                    setLoading(false)
                    navigate("/not-found", { replace: true })
                    return
                }

                const data = await res.json()
                if (!data || (!data.books && !data.name)) {
                    setApiError(true)
                    navigate("/not-found", { replace: true })
                    return
                }

                const processedBooks = (data.books || []).map(book => ({
                    id: book.id,
                    user_id: book.user_id,
                    image: book.images?.[0]
                        ? book.images[0].startsWith("http")
                            ? book.images[0]
                            : `http://localhost:8001/storage/${book.images[0]}`
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
                    description:
                        book.description || "No description available",
                }))

                setBooks(processedBooks)
                setCategory({
                    name: data.name || "Category",
                    type: data.type || "General",
                })
            } catch (error) {
                console.error("❌ API error:", error)
                setApiError(true)
                navigate("/not-found", { replace: true })
            } finally {
                setLoading(false)
            }
        }

        fetchCategoryBooks()
        fetchWishlist()
        fetchCartItems()
    }, [id, navigate])

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

    // If no books found but category exists
    if (filteredBooks.length === 0 && !apiError) {
        return (
            <>
                <Navebar />
                <section className="bg-[#F5F8FF] py-16 min-h-screen">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-[#101623] mb-3">
                                {category.name} Books
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                No books found in this category.
                            </p>
                        </div>
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <Navebar />
            <section className="bg-[#F5F8FF] py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    {/* Category Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#101623] mb-3">
                            {category.name} Books
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Browse our collection of{" "}
                            {category.name.toLowerCase()} books.
                            <span className="block mt-1 text-sm text-[#199A8E]">
                                Type: {category.type}
                            </span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentBooks.map((book, index) => (
                            <div
                                key={book.id}
                                className="book-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    opacity: 0,
                                    animation: "fadeIn 0.5s forwards",
                                }}
                            >
                                <div
                                    className="book-badge absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
                                    style={{
                                        backgroundColor: getStatusColor(
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
                                            className={`action-button favorite ${
                                                isInWishlist(book.id)
                                                    ? "active"
                                                    : ""
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
                                            className="action-button view"
                                            onClick={() =>
                                                handleQuickView(book.id)
                                            }
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className={`action-button cart ${
                                                isInCart(book.id)
                                                    ? "disabled"
                                                    : ""
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

                                    <div className="category-tag absolute bottom-2 left-2 bg-white text-xs px-2 py-1 rounded text-gray-700">
                                        {book.category}
                                    </div>
                                </div>

                                <div className="p-4">
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
                                            book.status !== "available"
                                        }
                                    >
                                        {isInCart(book.id) ? (
                                            <Check size={16} />
                                        ) : (
                                            <ShoppingCart size={16} />
                                        )}
                                        <span>
                                            {isInCart(book.id)
                                                ? "In Cart"
                                                : "Add to Cart"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition flex items-center gap-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum =
                                                currentPage - 2 + i
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    setCurrentPage(
                                                        pageNum
                                                    )
                                                }
                                                className={`px-4 py-2 border rounded-lg text-sm ${
                                                    currentPage ===
                                                    pageNum
                                                        ? "bg-[#199A8E] text-white border-[#199A8E]"
                                                        : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    }
                                )}
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition flex items-center gap-1"
                            >
                                Next
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default CategoryPage