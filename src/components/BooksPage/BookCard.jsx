import { Heart, Eye, ShoppingCart, Star, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookCard = ({ book, index, isInWishlist, isInCart, handleAddToWishlist, handleAddToCart, handleQuickView }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "#199A8E";
      case "rented": return "#3B82F6";
      case "sold": return "#EF4444";
      default: return "#199A8E";
    }
  };

  return (
    <div
      className="book-card bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
      style={{
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        animation: "fadeIn 0.5s forwards",
      }}
    >
      {/* Book Badge */}
      <div
        className="book-badge absolute top-3 left-3 z-10 px-3 py-1 text-xs font-semibold text-white rounded-full shadow"
        style={{ backgroundColor: getStatusColor(book.status) }}
      >
        {book.badge}
      </div>

      {/* Book Image */}
      <div className="relative group h-64 overflow-hidden">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=300&width=200";
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToWishlist(book.id);
            }}
            className={`p-2 rounded-full shadow transition ${
              isInWishlist(book.id) ? "bg-[#199A8E] text-white" : "bg-white hover:bg-[#199A8E] hover:text-white"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={isInWishlist(book.id) ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickView(book.id);
            }}
            className="bg-white p-2 rounded-full shadow hover:bg-[#199A8E] hover:text-white transition"
            aria-label="View details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              !isInCart(book.id) && handleAddToCart(book.id);
            }}
            disabled={isInCart(book.id) || book.status !== "available"}
            className={`p-2 rounded-full shadow transition ${
              isInCart(book.id) ? "bg-green-500 text-white" : "bg-white hover:bg-[#199A8E] hover:text-white"
            }`}
            aria-label="Add to cart"
          >
            {isInCart(book.id) ? <Check size={18} /> : <ShoppingCart size={18} />}
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
                className={i < Math.floor(book.rating) ? "fill-current" : ""}
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm ml-1">
            {book.rating} ({book.reviews} reviews)
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
          onClick={(e) => {
            e.stopPropagation();
            !isInCart(book.id) && handleAddToCart(book.id);
          }}
          disabled={isInCart(book.id) || book.status !== "available"}
          className={`w-full py-2 rounded-lg shadow transition flex items-center justify-center gap-2 ${
            isInCart(book.id)
              ? "bg-green-500 text-white"
              : "bg-[#199A8E] hover:bg-[#157d74] text-white"
          }`}
        >
          {isInCart(book.id) ? <Check size={16} /> : <ShoppingCart size={16} />}
          <span>{isInCart(book.id) ? "In Cart" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default BookCard;