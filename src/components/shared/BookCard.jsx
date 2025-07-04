import React from "react"
import {
    Heart,
    Eye,
    ShoppingCart,
    Check,
    Star,
    SquarePen,
    Trash2,
} from "lucide-react"

const BookCard = ({
    book,
    isInWishlist = false,
    isInCart = false,
    onWishlist,
    onAddToCart,
    onQuickView,
    onEdit,
    onDelete,
    showActions = true,
    showBadge = true,
    showCategory = true,
    showRating = true,
    showPrice = true,
    currentUser,
}) => {
    return (
        <div
            className="book-card"
            style={{ minHeight: 420, animation: "fadeIn 0.5s" }}
        >
            <div className="book-image">
                <img
                    src={book.image || book.images?.[0] || "/placeholder.svg"}
                    alt={book.title}
                    style={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        borderRadius: 12,
                    }}
                    onError={e => {
                        e.currentTarget.src =
                            "/placeholder.svg?height=300&width=200"
                    }}
                />
                {/* حالة الكتاب */}
                {book.status && (
                    <div
                        className="book-status"
                        style={{
                            backgroundColor:
                                book.status === "available"
                                    ? "#10B981"
                                    : book.status === "rented"
                                    ? "#F59E0B"
                                    : book.status === "sold"
                                    ? "#EF4444"
                                    : "#6B7280",
                            color: "#fff",
                            position: "absolute",
                            top: 10,
                            left: 10,
                            borderRadius: 8,
                            padding: "2px 12px",
                            fontWeight: 700,
                            fontSize: 13,
                        }}
                    >
                        {book.status}
                    </div>
                )}
                {/* Overlay Actions */}
                <div className="book-overlay">
                    <div className="overlay-actions">
                        {onQuickView && (
                            <button
                                className="overlay-btn view"
                                title="View Book"
                                onClick={() => onQuickView(book)}
                            >
                                <Eye size={16} />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                className="overlay-btn edit"
                                title="Edit Book"
                                onClick={() => onEdit(book)}
                            >
                                <SquarePen size={16} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                className="overlay-btn delete"
                                title="Delete Book"
                                onClick={() => onDelete(book)}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="book-info" style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                    {book.title}
                </h3>
                <p
                    className="book-author"
                    style={{ color: "#555", marginBottom: 4 }}
                >
                    By {book.author || "Unknown Author"}
                </p>
                <div className="book-category" style={{ marginBottom: 4 }}>
                    <span
                        className="category-badge"
                        style={{
                            background: "#f3f4f6",
                            color: "#6f42c1",
                            borderRadius: 8,
                            padding: "2px 10px",
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        {book.category}
                    </span>
                </div>
                <div className="book-details" style={{ marginBottom: 4 }}>
                    <span
                        className="detail-badge condition"
                        style={{
                            background: "#e2e8f0",
                            color: "#333",
                            borderRadius: 8,
                            padding: "2px 10px",
                            fontWeight: 500,
                            fontSize: 12,
                        }}
                    >
                        {book.condition || "new"}
                    </span>
                </div>
                <div
                    className="book-rating"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 4,
                    }}
                >
                    <Star size={16} color="#FBBF24" fill="#FBBF24" />
                    <span>{book.rating || 0}</span>
                    <span
                        className="rating-count"
                        style={{ color: "#888", fontSize: 12 }}
                    >
                        ({book.reviews || 0})
                    </span>
                </div>
                <div className="book-pricing" style={{ marginBottom: 4 }}>
                    <p
                        className="book-price"
                        style={{
                            color: "#3b82f6",
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {book.price}
                    </p>
                </div>
                <div
                    className="book-meta"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 4,
                    }}
                >
                    {book.quantity && (
                        <span
                            className="quantity-badge"
                            style={{
                                background: "#f3f4f6",
                                color: "#333",
                                borderRadius: 8,
                                padding: "2px 10px",
                                fontWeight: 500,
                                fontSize: 12,
                            }}
                        >
                            Qty: {book.quantity}
                        </span>
                    )}
                    {book.created_at && (
                        <p
                            className="book-date"
                            style={{ color: "#888", fontSize: 12 }}
                        >
                            Added:{" "}
                            {new Date(book.created_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
                {book.description && (
                    <p
                        className="book-description"
                        style={{
                            color: "#444",
                            fontSize: 13,
                            marginTop: 4,
                            maxHeight: 40,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {book.description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default BookCard
