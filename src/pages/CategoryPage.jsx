import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import notFoundImage from "../images/Pasted image.png";
import BookCard from "../components/BooksPage/BookCard";
import "../style/category.css";

const CategoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);
    const [categoryFound, setCategoryFound] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 8;

    // Fetch category books
    useEffect(() => {
        const fetchCategoryBooks = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/categories/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            Accept: "application/json",
                        },
                    }
                );
                if (!res.ok) {
                    setApiError(true);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                if (!data || (!data.books && !data.name)) {
                    setCategoryFound(false);
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
                    }));

                    setBooks(processedBooks);
                    setCategory(data.name || "Category");
                    setCategoryFound(true);
                }
            } catch (error) {
                console.error("❌ API error:", error);
                setApiError(true);
            } finally {
                setLoading(false);
            }
        };

        const fetchWishlist = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/wishlist", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setWishlist(data);
                }
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            }
        };

        const fetchCart = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/cart", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCart(data);
                }
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };

        fetchCategoryBooks();
        fetchWishlist();
        fetchCart();
    }, [id]);

    // Helper functions
    const isInWishlist = (bookId) => {
        return wishlist.some(item => item.book_id === bookId);
    };

    const isInCart = (bookId) => {
        return cart.some(item => item.book_id === bookId);
    };

    const handleAddToWishlist = async (bookId) => {
        try {
            const res = await fetch(`http://localhost:8000/api/wishlist`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ book_id: bookId })
            });
            
            if (res.ok) {
                const data = await res.json();
                setWishlist([...wishlist, data]);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error);
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            const res = await fetch(`http://localhost:8000/api/cart`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ book_id: bookId })
            });
            
            if (res.ok) {
                const data = await res.json();
                setCart([...cart, data]);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const handleQuickView = (bookId) => {
        navigate(`/books/${bookId}`);
    };

    // Filtering and pagination
    const filteredBooks = books.filter(
        book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (priceFilter === "" ||
                parseFloat(book.price) <= parseFloat(priceFilter))
    );

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    const handleSearchChange = e => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePriceChange = e => {
        setPriceFilter(e.target.value);
        setCurrentPage(1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#199A8E]"></div>
            </div>
        );
    }

    // Error state
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
        );
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
                                setSearchTerm("");
                                setPriceFilter("");
                            }}
                            className="bg-[#199A8E] hover:bg-[#157d74] text-white px-6 py-3 rounded-full shadow-lg transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {currentBooks.map((book, index) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    index={index}
                                    isInWishlist={isInWishlist}
                                    isInCart={isInCart}
                                    handleAddToWishlist={handleAddToWishlist}
                                    handleAddToCart={handleAddToCart}
                                    handleQuickView={handleQuickView}
                                />
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
    );
};

export default CategoryPage;