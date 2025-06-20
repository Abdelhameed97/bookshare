import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import notFoundImage from "../images/Pasted image.png";

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [categoryFound, setCategoryFound] = useState(true);

  // Search + Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/category/${id}`);
        if (!res.ok) {
          setApiError(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("✅ Category data:", data);

        if (!data || (!data.books && !data.name)) {
          setCategoryFound(false);
        } else {
          setBooks(data.books || []);
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

    fetchCategoryBooks();
  }, [id]);

  // Filter books by search and price
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (priceFilter === "" || parseFloat(book.price) <= parseFloat(priceFilter))
  );

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#199A8E]"></div>
      </div>
    );
  }

  if (apiError || !categoryFound) {
    return (
      <section className="bg-[#F5F8FF] py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img
            src={notFoundImage}
            alt="Error or Not Found"
            className="mx-auto mb-6 w-72 opacity-80 rounded-xl shadow-md"
          />
          <p className="text-lg text-gray-600 mb-4">
            {apiError
              ? "Oops! We're unable to load the category right now."
              : "The category you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#199A8E] hover:bg-[#157d74] text-white px-6 py-2 rounded-full shadow-lg transition"
          >
            🏠 Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F5F8FF] py-16 min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[#101623] mb-10">
          {category} Books
        </h2>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="relative w-full md:w-1/3">
            <input
              type="number"
              placeholder="Max price"
              min="0"
              value={priceFilter}
              onChange={handlePriceChange}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
            />
            {priceFilter && (
              <button
                onClick={() => setPriceFilter("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-gray-600">
          Showing {currentBooks.length} of {filteredBooks.length} books
        </div>

        {/* Books List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center">
            <img
              src={notFoundImage}
              alt="No books found"
              className="mx-auto mb-6 w-72 opacity-80 rounded-xl shadow-md"
            />
            <p className="text-lg text-gray-600 mb-4">
              No books match your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setPriceFilter("");
              }}
              className="bg-[#199A8E] hover:bg-[#157d74] text-white px-6 py-2 rounded-full shadow-lg transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {currentBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 hover:-translate-y-1"
                >
                  <Link to={`/book/${book.id}`} className="block">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={book.image || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#199A8E] text-white px-3 py-1 rounded text-xs font-medium">
                        ${book.price}
                      </span>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {book.user?.name || "Unknown Author"}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-8 mt-8">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaChevronLeft /> Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-[#199A8E] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentPage === totalPages
                          ? "bg-[#199A8E] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next <FaChevronRight />
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