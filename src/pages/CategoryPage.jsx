import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Heart, Eye, ShoppingCart, Star, Search, Filter } from "lucide-react"
import notFoundImage from "../images/Pasted image.png"
import "../style/category.css"

const CategoryPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [books, setBooks] = useState([])
    const [category, setCategory] = useState("")
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(false)
    const [categoryFound, setCategoryFound] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [priceFilter, setPriceFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const booksPerPage = 8

    useEffect(() => {
        const fetchCategoryBooks = async () => {
            try {
                const res = await fetch(
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
                if (!res.ok) {
                    setApiError(true)
                    setLoading(false)
                    return
                }

                const data = await res.json()
                if (!data || (!data.books && !data.name)) {
                    setCategoryFound(false)
                } else {
                    const processedBooks = (data.books || []).map(book => ({
                        id: book.id,
                        image: book.images?.[0]
                            ? book.images[0].startsWith("http")
                                ? book.images[0]
                                : `http://localhost:8000/storage/${book.images[0]}`
                            : "/placeholder.svg?height=300&width=200",
                        price: `${book.price}`,
                        originalPrice: book.rental_price
                            ? `${book.rental_price}`
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
    }, [id])

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
        setSearchTerm(e.target.value)
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#199A8E]"></div>
            </div>
        )
    }

    if (apiError || !categoryFound) {
        return (
            <section className="bg-[#F5F8FF] py-16 min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <img
                        src={notFoundImage}
                        alt="Error or Not Found"
                        className="mx-auto mb-6 w-72 opacity-80 rounded-xl shadow-md"
                    />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {apiError
                            ? "Oops! Something went wrong"
                            : "Category not found"}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                        {apiError
                            ? "We're unable to load the category right now. Please try again later."
                            : "The category you're looking for doesn't exist or has been removed."}
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-[#199A8E] hover:bg-[#157d74] text-white px-6 py-3 rounded-full shadow-lg transition flex items-center justify-center gap-2 mx-auto"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Back to Home
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-[#F5F8FF] py-16 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Category Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#101623] mb-3">
                        {category} Books
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Browse our collection of {category.toLowerCase()} books.
                        Find your next favorite read!
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-10 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-1/2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search books by title..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
                            />
                        </div>

                        <div className="relative w-full md:w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="text-gray-400" size={18} />
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

                {/* Books List */}
                {filteredBooks.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-xl shadow-sm">
                        <img
                            src={notFoundImage}
                            alt="No books found"
                            className="mx-auto mb-6 w-72 opacity-80 rounded-xl shadow-md"
                        />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            No books found
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">
                            Try adjusting your search or filter to find what
                            you're looking for.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("")
                                setPriceFilter("")
                            }}
                            className="bg-[#199A8E] hover:bg-[#157d74] text-white px-6 py-3 rounded-full shadow-lg transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {currentBooks.map(book => (
                                <div
                                    key={book.id}
                                    className="book-item bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
                                >
                                    {/* Book Badge */}
                                    <div
                                        className={`book-badge ${book.status.toLowerCase()} absolute top-3 left-3 z-10 px-3 py-1 text-xs font-semibold text-white rounded-full shadow`}
                                    >
                                        {book.badge}
                                    </div>

                                    {/* Book Image */}
                                    <div className="relative group h-64 overflow-hidden">
                                        <img
                                            src={book.image}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={e =>
                                                (e.target.src =
                                                    "/placeholder.svg?height=300&width=200")
                                            }
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button
                                                onClick={() =>
                                                    console.log(
                                                        "Add to wishlist",
                                                        book.id
                                                    )
                                                }
                                                className="bg-white p-2 rounded-full shadow hover:bg-[#199A8E] hover:text-white transition"
                                                aria-label="Add to wishlist"
                                            >
                                                <Heart size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/books/${book.id}`
                                                    )
                                                }
                                                className="bg-white p-2 rounded-full shadow hover:bg-[#199A8E] hover:text-white transition"
                                                aria-label="View details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    console.log(
                                                        "Add to cart",
                                                        book.id
                                                    )
                                                }
                                                className="bg-white p-2 rounded-full shadow hover:bg-[#199A8E] hover:text-white transition"
                                                aria-label="Add to cart"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Book Info */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg mb-1 text-gray-900 line-clamp-1">
                                            {book.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-3">
                                            {book.author}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-3">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={
                                                            i <
                                                            Math.floor(
                                                                book.rating
                                                            )
                                                                ? "fill-current"
                                                                : ""
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-gray-600 text-sm ml-1">
                                                {book.rating} ({book.reviews}{" "}
                                                reviews)
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4">
                                            {book.originalPrice && (
                                                <span className="text-sm line-through text-gray-400 mr-2">
                                                    ${book.originalPrice}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold text-[#199A8E]">
                                                ${book.price}
                                            </span>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() =>
                                                console.log(
                                                    "Add to cart",
                                                    book.id
                                                )
                                            }
                                            className="w-full bg-[#199A8E] hover:bg-[#157d74] text-white py-2 rounded-lg shadow transition flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart size={16} />
                                            Add to Cart
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
                                                pageNum = currentPage - 2 + i
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() =>
                                                        setCurrentPage(pageNum)
                                                    }
                                                    className={`px-4 py-2 border rounded-lg text-sm ${
                                                        currentPage === pageNum
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
                    </>
                )}
            </div>
        </section>
    )
}

export default CategoryPage
