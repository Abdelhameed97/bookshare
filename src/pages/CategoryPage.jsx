import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";
import notFoundImage from "../images/Pasted image.png";
import "../style/category.css"; 

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [categoryFound, setCategoryFound] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      try {
const res = await fetch(`http://localhost:8001/api/categories/${id}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  },
});
        if (!res.ok) {
          setApiError(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (!data || (!data.books && !data.name)) {
          setCategoryFound(false);
        } else {
          const processedBooks = (data.books || []).map((book) => ({
            id: book.id,
            image: book.images?.[0]
              ? book.images[0].startsWith("http")
                ? book.images[0]
                : `http://localhost:8000/storage/${book.images[0]}`
              : "/placeholder.svg?height=300&width=200",
            price: `${book.price}`,
            originalPrice: book.rental_price ? `${book.rental_price}` : null,
            title: book.title,
            author: book.user?.name || "Unknown Author",
            rating: book.ratings?.length
              ? (
                  book.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
                  book.ratings.length
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
            description: book.description || "No description available",
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

    fetchCategoryBooks();
  }, [id]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (priceFilter === "" || parseFloat(book.price) <= parseFloat(priceFilter))
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full md:w-1/3 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
          />
          <input
            type="number"
            placeholder="Max price"
            min="0"
            value={priceFilter}
            onChange={handlePriceChange}
            className="w-full md:w-1/3 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#199A8E]"
          />
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
                <div key={book.id} className="book-item bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden transition">
                  <div className={`book-badge p-1 px-3 text-xs text-white rounded-tl-2xl ${book.badge.toLowerCase()}`}>
                    {book.badge}
                  </div>

                  <div className="relative group">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                      onError={(e) =>
                        (e.target.src = "/placeholder.svg?height=300&width=200")
                      }
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => console.log("Add to wishlist", book.id)}
                        className="bg-white p-2 rounded-full shadow"
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/books/${book.id}`)}
                        className="bg-white p-2 rounded-full shadow"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => console.log("Add to cart", book.id)}
                        className="bg-white p-2 rounded-full shadow"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>

                    <div className="flex justify-center items-center gap-1 text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(book.rating) ? "fill-current" : ""}
                        />
                      ))}
                      <span className="text-gray-600 text-sm">
                        {book.rating} ({book.reviews})
                      </span>
                    </div>

                    <div className="mb-3">
                      {book.originalPrice && (
                        <span className="text-sm line-through text-gray-400 mr-2">
                          ${book.originalPrice}
                        </span>
                      )}
                      <span className="text-md font-bold text-[#199A8E]">
                        ${book.price}
                      </span>
                    </div>

                    <button
                      onClick={() => console.log("Add to cart", book.id)}
                      className="bg-[#199A8E] hover:bg-[#157d74] text-white px-4 py-2 rounded-full shadow transition"
                    >
                      <ShoppingCart size={16} className="inline-block mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm text-gray-600 disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === i + 1
                        ? "bg-[#199A8E] text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm text-gray-600 disabled:opacity-50"
                >
                  Next
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
