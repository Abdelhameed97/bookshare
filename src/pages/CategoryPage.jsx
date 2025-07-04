import { useParams } from "react-router-dom"
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

const BookCard = ({
    book,
    isInWishlist,
    isInCart,
    onWishlist,
    onAddToCart,
    onQuickView,
    index,
}) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, index * 100)

        return () => clearTimeout(timer)
    }, [index])

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

    const getCategoryColor = (category, idx = 0) => {
        const categoryColors = [
            "#6f42c1",
            "#b49a7d",
            "#0dcaf0",
            "#a084ee",
            "#20c997",
            "#fd7e14",
            "#adb5bd",
        ]
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

    if (!book) return null

    return (
        <div className={`book-card ${isVisible ? "visible" : ""}`}>
            <div
                className="book-badge"
                style={{ backgroundColor: getStatusColor(book.status) }}
            >
                {book.badge}
            </div>

            <div className="book-image-container">
                <img
                    src={book.image}
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
                        onClick={() => !isInCart && onAddToCart()}
                        disabled={isInCart || book.status !== "available"}
                    >
                        {isInCart ? (
                            <Check size={18} />
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                    </button>
                </div>

                <div
                    className="category-tag"
                    style={{
                        backgroundColor: getCategoryColor(book.category, index),
                    }}
                >
                    {book.category}
                </div>
            </div>

            <div className="book-content">
                <div className="book-rating">
                    <div className="stars">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={
                                    i < Math.floor(book.rating) ? "filled" : ""
                                }
                            />
                        ))}
                    </div>
                    <span className="rating-text">
                        {book.rating} ({book.reviews} reviews)
                    </span>
                </div>

                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>

                <div className="book-price">
                    {book.originalPrice && (
                        <span className="original-price">
                            {book.originalPrice}
                        </span>
                    )}
                    <span className="current-price">{book.price}</span>
                </div>

                <button
                    className={`add-to-cart-btn ${isInCart ? "in-cart" : ""}`}
                    onClick={() => !isInCart && onAddToCart()}
                    disabled={isInCart || book.status !== "available"}
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
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .book-card.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .book-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
                }
                .book-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
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
                .category-tag {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                    z-index: 2;
                }
                .book-content {
                    padding: 15px;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                .book-rating {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .stars {
                    display: flex;
                    gap: 2px;
                }
                .stars .filled {
                    color: #fbbf24;
                    fill: currentColor;
                }
                .rating-text {
                    font-size: 12px;
                    color: #64748b;
                    margin-left: 4px;
                }
                .book-title {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
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
                    margin-top: auto;
                }
                .add-to-cart-btn:hover {
                    background: #6d28d9;
                }
                .add-to-cart-btn:disabled,
                .add-to-cart-btn.in-cart {
                    background: #94a3b8;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    )
}

const CategoryPage = () => {
    const { id } = useParams()
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

    const debouncedSearch = useCallback(term => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(term)
            setSearchLoading(false)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [])

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
                            : "/placeholder.svg",
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
                        category: book.category?.name || "categorized",
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
    }, [id])

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
            const book = books.find(b => b.id === bookId)

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
            // If the error is 409 (already in cart), still fetch cart items to update UI
            if (err.response && err.response.status === 409) {
                await fetchCartItems()
                await Swal.fire({
                    icon: "info",
                    title: "Already in Cart",
                    text: "This book is already in your shopping cart.",
                    timer: 1500,
                })
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Failed to Add",
                    text: err.message,
                })
            }
        }
    }

    const handleQuickView = bookId => {
        window.location.href = `/books/${bookId}`
    }

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
        setSearchLoading(true)
        debouncedSearch(e.target.value)
        setCurrentPage(1)
    }

    const handlePriceChange = e => {
        setPriceFilter(e.target.value)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm("")
        setPriceFilter("")
        setCurrentPage(1)
    }

    const goToPage = page => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

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
                    <div className="text-center mb-12">
                        <div className="category-header-bg hoverable-bg">
                            <h2 className="text-4xl font-bold text-white mb-2">
                                {category} Books
                            </h2>
                            <p className="category-desc">
                                Browse our collection of{" "}
                                {category.toLowerCase()} books. Find your next
                                favorite read!
                            </p>
                        </div>
                    </div>

                    <div className="mb-10 flex justify-center items-center w-full">
                        <div
                            className="relative flex justify-center items-center w-full"
                            style={{ maxWidth: "340px", margin: "0 auto" }}
                        >
                            <input
                                type="text"
                                placeholder="Search for a book..."
                                onChange={handleSearchChange}
                                className="modern-search-input text-center search-with-icon"
                                style={{ paddingLeft: 40 }}
                            />
                            <span className="search-icon-inside">
                                <Search className="text-gray-400" size={18} />
                            </span>
                            {searchLoading && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#199A8E]" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6 flex justify-between items-center">
                        <span className="text-gray-600">
                            {filteredBooks.length} book
                            {filteredBooks.length !== 1 ? "s" : ""} found
                            {searchTerm && ` for "${searchTerm}"`}
                        </span>
                    </div>

                    {filteredBooks.length === 0 ? (
                        <div className="text-center bg-white p-10 rounded-xl shadow-sm">
                            <h3 className="text-2xl fw-bold text-danger mb-2">
                                No Books Found
                            </h3>
                            <p className="text-lg text-muted mb-0">
                                No categories match your search
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="row g-4">
                                {currentBooks.map((book, index) => (
                                    <div
                                        key={`${book.id}-${index}`}
                                        className="col-12 col-sm-6 col-md-4"
                                    >
                                        <BookCard
                                            book={book}
                                            isInWishlist={isInWishlist(book.id)}
                                            isInCart={isInCart(book.id)}
                                            onWishlist={() =>
                                                handleAddToWishlist(book.id)
                                            }
                                            onAddToCart={() =>
                                                handleAddToCart(book.id)
                                            }
                                            onQuickView={() =>
                                                handleQuickView(book.id)
                                            }
                                            index={index}
                                        />
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center mt-12 gap-2">
                                    <button
                                        onClick={() =>
                                            goToPage(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-4 py-2 border rounded-md ${
                                                currentPage === page
                                                    ? "bg-[#199A8E] text-white"
                                                    : ""
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            goToPage(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <style>{`
                .category-header-bg {
                    background: linear-gradient(
                        90deg,
                        #5b21b6 0%,
                        #7c3aed 100%
                    );
                    border-radius: 18px;
                    padding: 32px 0 24px 0;
                    margin-bottom: 18px;
                    box-shadow: 0 4px 16px rgba(91, 33, 182, 0.13);
                    transition: background 0.3s;
                    position: relative;
                }
                .category-header-bg .category-desc {
                    color: #e0e7ff;
                    font-size: 1.15rem;
                    margin: 0 auto;
                    max-width: 600px;
                    font-weight: 500;
                }
                .category-header-bg.hoverable-bg:hover {
                    background: linear-gradient(
                        90deg,
                        #7c3aed 0%,
                        #5b21b6 100%
                    );
                    box-shadow: 0 8px 32px rgba(91, 33, 182, 0.18);
                }
                .search-with-icon {
                    position: relative;
                }
                .search-icon-inside {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    z-index: 2;
                }
                .modern-search-input {
                    width: 100%;
                    max-width: 260px;
                    padding: 8px 36px 8px 38px;
                    border-radius: 999px;
                    border: none;
                    background: linear-gradient(
                        90deg,
                        #e0e7ff 0%,
                        #f0fdfa 100%
                    );
                    box-shadow: 0 2px 8px rgba(25, 154, 142, 0.08);
                    font-size: 1rem;
                    color: #22223b;
                    transition: box-shadow 0.2s, border 0.2s;
                    outline: none;
                    font-family: inherit;
                    text-align: center;
                }
                .modern-search-input:focus {
                    box-shadow: 0 4px 16px rgba(25, 154, 142, 0.18);
                    border: 1.5px solid #199a8e;
                    background: linear-gradient(
                        90deg,
                        #f0fdfa 0%,
                        #e0e7ff 100%
                    );
                }
                .modern-search-input::placeholder {
                    color: #94a3b8;
                    font-size: 1rem;
                }
            `}</style>
        </>
    )
}

export default CategoryPage
