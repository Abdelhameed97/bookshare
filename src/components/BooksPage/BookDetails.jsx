import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [authorBooks, setAuthorBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [parentId, setParentId] = useState(null);
    const [user, setUser] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [showOptions, setShowOptions] = useState(null);

    // Helper to get status badge color
    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case "available":
                return { background: "#10B981", color: "white" };
            case "rented":
                return { background: "#F59E0B", color: "white" };
            case "sold":
                return { background: "#EF4444", color: "white" };
            default:
                return { background: "#6B7280", color: "white" };
        }
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:8000/api/books/${id}`)
            .then((response) => {
                setBook(response.data.data);
                setLoading(false);
                // Fetch author's books after book is loaded
                const userId = response.data.data.user?.id;
                if (userId) {
                    axios
                        .get(`http://localhost:8000/api/books?user_id=${userId}`)
                        .then((res) => {
                            // Exclude the current book
                            const filtered = res.data.data.filter(
                                (b) => b.id !== response.data.data.id
                            );
                            setAuthorBooks(filtered);
                        })
                        .catch(() => setAuthorBooks([]));
                }
            })
            .catch((err) => {
                setError("Failed to load book details.");
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="alert alert-danger mt-5">{error}</div>;
    if (!book)
        return <div className="alert alert-warning mt-5">Book not found.</div>;

    // Handle image path (array or string)
    let imagePath = "";
    if (Array.isArray(book.images)) {
        imagePath = book.images[0];
    } else if (typeof book.images === "string") {
        imagePath = book.images;
    }
    const imageUrl = imagePath
        ? imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:8000/storage/${imagePath}`
        : "/placeholder.svg?height=300&width=200";

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
                padding: "40px 0",
            }}
        >
            <div
                className="container animate__animated animate__fadeIn"
                style={{
                    maxWidth: 900,
                    background: "#fff",
                    borderRadius: "2rem",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    padding: "2.5rem 2rem",
                    margin: "0 auto",
                }}
            >
                <div className="row g-4 align-items-start">
                    <div className="col-md-4 text-center">
                        <div
                            className="shadow rounded overflow-hidden book-image-wrapper"
                            style={{
                                transition: "transform 0.4s cubic-bezier(.4,2,.3,1)",
                                cursor: "pointer",
                                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                                background: "#fff",
                                padding: "1.5rem",
                                borderRadius: "1.5rem",
                                display: "inline-block",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.transform = "scale(1.05)")
                            }
                            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={book.title}
                                    className="img-fluid"
                                    style={{
                                        maxHeight: "350px",
                                        objectFit: "cover",
                                        borderRadius: "1rem",
                                        boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.10)",
                                        transition: "box-shadow 0.3s",
                                    }}
                                />
                            ) : (
                                <div className="bg-secondary text-white p-5 rounded">
                                    No Image
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className="col-md-8 animate__animated animate__fadeInRight"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <h2
                            className="mb-3 fw-bold"
                            style={{ letterSpacing: "1px", fontSize: "2.5rem" }}
                        >
                            {book.title}
                        </h2>
                        <p className="mb-2" style={{ fontSize: "1.3rem" }}>
                            <strong>Author:</strong>{" "}
                            <span className="text-primary" style={{ fontWeight: 600 }}>
                                {book.user?.name || "Unknown"}
                            </span>
                        </p>
                        <p className="mb-2" style={{ fontSize: "1.2rem" }}>
                            <strong>Category:</strong>{" "}
                            <span className="badge bg-secondary" style={{ fontSize: "1rem" }}>
                                {book.category?.name || "N/A"}
                            </span>
                        </p>
                        <p className="mb-2" style={{ fontSize: "1.2rem" }}>
                            <strong>Status:</strong>{" "}
                            <span
                                className="badge"
                                style={{
                                    fontSize: "1rem",
                                    ...getStatusBadgeStyle(book.status),
                                }}
                            >
                                {book.status}
                            </span>
                        </p>
                        <p className="mb-2" style={{ fontSize: "1.2rem" }}>
                            <strong>Price:</strong>{" "}
                            <span
                                className="text-success fw-bold"
                                style={{ fontSize: "1.3rem" }}
                            >
                                {book.price} $
                            </span>
                        </p>
                        <p className="mb-3" style={{ fontSize: "1.15rem" }}>
                            <strong>Description:</strong>{" "}
                            <span className="text-muted">
                                {book.description || "No description."}
                            </span>
                        </p>
                    </div>
                </div>
                <hr className="my-5" />
                <div
                    className="comments-section animate__animated animate__fadeInUp"
                    style={{ animationDelay: "0.4s" }}
                >
                    <h4 className="mb-4 fw-bold" style={{ fontSize: "2rem" }}>
                        Comments
                    </h4>
                    {book.comments && book.comments.length > 0 ? (
                        <div className="list-group">
                            {book.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="list-group-item mb-3 shadow-sm rounded border-0 comment-item"
                                    style={{
                                        transition: "transform 0.3s, box-shadow 0.3s",
                                        background: "#f8f9fa",
                                        borderRadius: "1rem",
                                        border: "1px solid #e3e6ea",
                                        fontSize: "1.15rem",
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.boxShadow =
                                            "0 8px 32px 0 rgba(31, 38, 135, 0.10)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow =
                                            "0 2px 8px 0 rgba(31, 38, 135, 0.05)";
                                    }}
                                >
                                    <div className="d-flex align-items-center mb-2">
                                        <span
                                            className="fw-bold me-2 text-primary"
                                            style={{ fontSize: "1.1rem" }}
                                        >
                                            {comment.user?.name || "Anonymous"}
                                        </span>
                                        <span className="text-muted small">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-dark">{comment.content}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted" style={{ fontSize: "1.1rem" }}>
                            No comments yet.
                        </div>
                    )}
                </div>
                {/* Author's other books */}
                <div
                    className="mt-5 animate__animated animate__fadeInUp"
                    style={{ animationDelay: "0.6s" }}
                >
                    <h4 className="fw-bold mb-4" style={{ fontSize: "2rem" }}>
                        More books by this author
                    </h4>
                    {authorBooks.length > 0 ? (
                        <div className="row g-4">
                            {authorBooks.map((book) => {
                                let imagePath = "";
                                if (Array.isArray(book.images)) {
                                    imagePath = book.images[0];
                                } else if (typeof book.images === "string") {
                                    imagePath = book.images;
                                }
                                const imageUrl = imagePath
                                    ? imagePath.startsWith("http")
                                        ? imagePath
                                        : `http://localhost:8000/storage/${imagePath}`
                                    : "/placeholder.svg?height=300&width=200";
                                return (
                                    <div
                                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                                        key={book.id}
                                    >
                                        <Link
                                            to={`/books/${book.id}`}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <div
                                                className="card h-100 shadow-sm border-0"
                                                style={{
                                                    borderRadius: "1.2rem",
                                                    transition: "transform 0.3s, box-shadow 0.3s",
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.04)";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 8px 32px 0 rgba(31, 38, 135, 0.10)";
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 2px 8px 0 rgba(31, 38, 135, 0.05)";
                                                }}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={book.title}
                                                    className="card-img-top"
                                                    style={{
                                                        height: "180px",
                                                        objectFit: "cover",
                                                        borderTopLeftRadius: "1.2rem",
                                                        borderTopRightRadius: "1.2rem",
                                                    }}
                                                />
                                                <div className="card-body">
                                                    <h5
                                                        className="card-title mb-2"
                                                        style={{
                                                            fontSize: "1.1rem",
                                                            color: "#222",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {book.title}
                                                    </h5>
                                                    <p
                                                        className="card-text mb-1"
                                                        style={{ fontSize: "1rem", color: "#666" }}
                                                    >
                                                        {book.category?.name || "Uncategorized"}
                                                    </p>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            fontSize: "0.95rem",
                                                            ...getStatusBadgeStyle(book.status),
                                                        }}
                                                    >
                                                        {book.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-muted" style={{ fontSize: "1.1rem" }}>
                            No other books by this author.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetails;