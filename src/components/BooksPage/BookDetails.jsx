import React, { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { formatDistanceToNow } from "date-fns"
import {
    FaReply,
    FaEdit,
    FaTrash,
    FaEllipsisH,
    FaTimes,
    FaCheck,
    FaBook,
    FaTag,
    FaInfoCircle,
    FaDollarSign,
    FaHeart,
    FaRegHeart,
    FaShoppingCart,
    FaUserEdit,
    FaUserSlash,
} from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "animate.css"
import Swal from "sweetalert2"
import { useCart } from "../../hooks/useCart"
import StarRating from "./StarRating"

const BookDetails = () => {
    const { id } = useParams()
    const [book, setBook] = useState(null)
    const [authorBooks, setAuthorBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [commentInput, setCommentInput] = useState("")
    const [parentId, setParentId] = useState(null)
    const [replyingTo, setReplyingTo] = useState(null)
    const [editingComment, setEditingComment] = useState(null)
    const [editCommentText, setEditCommentText] = useState("")
    const [showOptions, setShowOptions] = useState(null)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isInCart, setIsInCart] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [mounted, setMounted] = useState(true)
    const [rating, setRating] = useState(0)
    const [userRating, setUserRating] = useState(null)
    const [avgRating, setAvgRating] = useState(0)
    const [ratingCount, setRatingCount] = useState(0)
    const [ratingLoading, setRatingLoading] = useState(false)

    const user = JSON.parse(localStorage.getItem("user"))
    const { addToCart, removeFromCart, checkCartStatus } = useCart(user?.id)

    useEffect(() => {
        return () => {
            setMounted(false)
        }
    }, [])

    const getStatusBadgeStyle = status => {
        switch (status) {
            case "available":
                return "bg-success"
            case "rented":
                return "bg-warning"
            case "sold":
                return "bg-danger"
            default:
                return "bg-secondary"
        }
    }

    const checkWishlistStatus = useCallback(
        async bookId => {
            if (!user || !mounted) return

            setLoadingStatus(true)
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/wishlist/check/${bookId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )

                if (!mounted) return
                setIsWishlisted(response.data.isWishlisted || false)
            } catch (error) {
                if (!mounted) return
                console.error("Error checking wishlist:", error)
                setIsWishlisted(false)
            } finally {
                if (mounted) {
                    setLoadingStatus(false)
                }
            }
        },
        [user, mounted]
    )

    const fetchBookDetails = useCallback(async () => {
        if (!mounted) return

        setLoading(true)
        try {
            const response = await axios.get(
                `http://localhost:8000/api/books/${id}`
            )
            const bookData = response.data.data

            if (!mounted) return
            setBook(bookData)

            if (user) {
                await Promise.all([
                    checkWishlistStatus(bookData.id),
                    checkCartStatus(bookData.id),
                ])
                await fetchRatings(bookData.id)
            }

            const userId = bookData.user?.id
            if (userId) {
                const res = await axios.get(
                    `http://localhost:8000/api/books?user_id=${userId}`
                )

                if (!mounted) return
                setAuthorBooks(res.data.data.filter(b => b.id !== bookData.id))
            }
        } catch (err) {
            if (!mounted) return
            setError(
                err.response?.data?.message || "Failed to load book details."
            )
        } finally {
            if (mounted) {
                setLoading(false)
            }
        }
    }, [id, user, mounted, checkWishlistStatus, checkCartStatus])

    const fetchBookWithComments = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/books/${id}`
            )

            if (!mounted) return
            setBook(response.data.data)
        } catch (err) {
            if (!mounted) return
            console.error("Failed to refresh comments:", err)
        }
    }, [id, mounted])

    useEffect(() => {
        fetchBookDetails()
        fetchBookWithComments()
    }, [fetchBookDetails, fetchBookWithComments])

    const handleCommentSubmit = async e => {
        e.preventDefault()
        if (!commentInput.trim()) {
            toast.warning("Please enter a comment")
            return
        }

        try {
            const response = await axios.post(
                "http://localhost:8000/api/comment",
                {
                    user_id: user.id,
                    book_id: id,
                    comment: commentInput,
                    parent_id: parentId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )

            // Create new comment object
            const newComment = {
                id: response.data.id,
                comment: commentInput,
                user_id: user.id,
                user: response.data.user || {
                    id: user.id,
                    name: user.name,
                },
                book_id: id,
                parent_id: parentId,
                created_at:
                    response.data.created_at || new Date().toISOString(),
                updated_at:
                    response.data.updated_at || new Date().toISOString(),
                replies: [],
            }

            // تحديث الكومنتات في الواجهة مباشرة
            setBook(prevBook => {
                const updatedBook = { ...prevBook }
                if (!updatedBook.comments) {
                    updatedBook.comments = []
                }
                if (parentId) {
                    // Add reply to parent comment
                    const addReplyToComment = comments => {
                        return comments.map(comment => {
                            if (comment.id === parentId) {
                                return {
                                    ...comment,
                                    replies: [
                                        ...(comment.replies || []),
                                        newComment,
                                    ],
                                }
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: addReplyToComment(comment.replies),
                                }
                            }
                            return comment
                        })
                    }
                    updatedBook.comments = addReplyToComment(
                        updatedBook.comments
                    )
                } else {
                    // Add new top-level comment
                    updatedBook.comments = [newComment, ...updatedBook.comments]
                }
                return updatedBook
            })

            setCommentInput("")
            setParentId(null)
            setReplyingTo(null)
            // Scroll to new comment with highlight
            scrollToComment(newComment.id)
            toast.success("Comment added successfully!")
        } catch (error) {
            console.error("Error submitting comment:", error)
            console.error("Error response:", error.response?.data)
            toast.error(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Failed to add comment"
            )
        }
    }

    const handleReply = (commentId, username) => {
        setParentId(commentId)
        setReplyingTo(username)
        setEditingComment(null)
        if (user) {
            const input = document.getElementById("comment-input")
            if (input) input.focus()
        }
    }

    const handleEdit = comment => {
        setEditingComment(comment.id)
        setEditCommentText(comment.comment)
        setParentId(null)
        setReplyingTo(null)
    }

    const handleUpdateComment = async () => {
        if (!editCommentText.trim()) {
            toast.warning("Comment cannot be empty")
            return
        }

        try {
            await axios.put(
                `http://localhost:8000/api/comment/${editingComment}`,
                {
                    comment: editCommentText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )

            setEditingComment(null)
            setEditCommentText("")
            await fetchBookWithComments()
            toast.success("Comment updated successfully!")
        } catch (error) {
            console.error("Error updating comment:", error)
            toast.error(
                error.response?.data?.message || "Failed to update comment"
            )
        }
    }

    const handleDeleteComment = async commentId => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
            })

            if (result.isConfirmed) {
                await axios.delete(
                    `http://localhost:8000/api/comment/${commentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                await fetchBookWithComments()
                toast.success("Comment deleted successfully!")
            }
        } catch (error) {
            console.error("Error deleting comment:", error)
            toast.error(
                error.response?.data?.message || "Failed to delete comment"
            )
        }
    }

    const handleWishlist = async () => {
        if (!user) {
            toast.info("Please login to add to wishlist")
            return
        }

        setLoadingStatus(true)
        try {
            if (isWishlisted) {
                await axios.delete(
                    `http://localhost:8000/api/wishlist/${book.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                setIsWishlisted(false)
                toast.success("Removed from wishlist")
            } else {
                await axios.post(
                    `http://localhost:8000/api/wishlist`,
                    { book_id: book.id },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                setIsWishlisted(true)
                toast.success("Added to wishlist")
            }
        } catch (error) {
            console.error("Error updating wishlist:", error)
            toast.error(
                error.response?.data?.message || "Failed to update wishlist"
            )
        } finally {
            setLoadingStatus(false)
        }
    }

    const fetchRatings = async bookId => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/ratings?book_id=${bookId}`
            )
            const ratings = response.data.data || []

            if (ratings.length > 0) {
                const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
                const avg = sum / ratings.length
                setAvgRating(avg)
                setRatingCount(ratings.length)

                if (user) {
                    const userRatingObj = ratings.find(
                        r => r.reviewer_id === user.id
                    )
                    if (userRatingObj) {
                        setUserRating(userRatingObj)
                        setRating(userRatingObj.rating)
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching ratings:", error)
        }
    }

    const handleRatingSubmit = async newRating => {
        if (!user) {
            toast.info("Please login to rate this book")
            return
        }

        setRatingLoading(true)
        try {
            if (userRating) {
                await axios.put(
                    `http://localhost:8000/api/ratings/${userRating.id}`,
                    { rating: newRating },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                toast.success("Rating updated successfully!")
            } else {
                await axios.post(
                    `http://localhost:8000/api/ratings`,
                    {
                        book_id: book.id,
                        rating: newRating,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                toast.success("Rating submitted successfully!")
            }
            setRating(newRating)
            fetchRatings(book.id)
        } catch (error) {
            console.error("Error submitting rating:", error)
            toast.error(
                error.response?.data?.message || "Failed to submit rating"
            )
        } finally {
            setRatingLoading(false)
        }
    }

    const handleCart = async () => {
        if (!user) {
            toast.info("Please login to add to cart")
            return
        }

        setLoadingStatus(true)
        try {
            if (isInCart) {
                await removeFromCart(book.id)
                setIsInCart(false)
                toast.success("Removed from cart")
            } else {
                await addToCart(book.id, { type: "buy" })
                setIsInCart(true)
                toast.success("Added to cart")
            }
        } catch (error) {
            console.error("Error updating cart:", error)
            toast.error(
                error.response?.data?.message || "Failed to update cart"
            )
        } finally {
            setLoadingStatus(false)
        }
    }

    // Scroll to a comment by id
    const scrollToComment = commentId => {
        setTimeout(() => {
            const commentElement = document.getElementById(
                `comment-${commentId}`
            )
            if (commentElement) {
                commentElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })
                // Add highlight effect
                commentElement.classList.add("comment-highlight")
                setTimeout(() => {
                    commentElement.classList.remove("comment-highlight")
                }, 3000)
            }
        }, 100)
    }

    const renderComments = (comments, depth = 0) => {
        if (!comments || !Array.isArray(comments)) return null

        return comments.map(comment => (
            <div
                key={comment.id}
                className={`mb-3 ${
                    depth > 0
                        ? "ms-4 ps-3 border-start border-2 border-primary"
                        : ""
                } animate__animated animate__fadeIn`}
            >
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center mb-2">
                                <div
                                    className="bg-primary text-white rounded-circle me-3"
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {comment.user?.name?.charAt(0) || "A"}
                                </div>
                                <div>
                                    <h6
                                        className="mb-0 fw-bold"
                                        style={{
                                            color: "#3b82f6",
                                            fontSize: "1.1rem",
                                        }}
                                    >
                                        👤{" "}
                                        {comment.user && comment.user.name
                                            ? comment.user.name
                                            : "Anonymous"}
                                        {user?.id === comment.user?.id && (
                                            <span className="badge bg-info ms-2">
                                                You
                                            </span>
                                        )}
                                    </h6>
                                    <small className="text-muted">
                                        {formatDistanceToNow(
                                            new Date(comment.created_at),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </small>
                                </div>
                            </div>

                            {(user?.id === comment.user?.id ||
                                user?.role === "admin") && (
                                <div className="dropdown">
                                    <button
                                        className="btn btn-sm btn-link text-muted"
                                        onClick={() =>
                                            setShowOptions(
                                                showOptions === comment.id
                                                    ? null
                                                    : comment.id
                                            )
                                        }
                                    >
                                        <FaEllipsisH />
                                    </button>

                                    {showOptions === comment.id && (
                                        <div className="dropdown-menu show animate__animated animate__fadeIn">
                                            <button
                                                className="dropdown-item d-flex align-items-center"
                                                onClick={() => {
                                                    handleEdit(comment)
                                                    setShowOptions(null)
                                                }}
                                            >
                                                <FaEdit className="me-2 text-primary" />{" "}
                                                Edit
                                            </button>
                                            <button
                                                className="dropdown-item d-flex align-items-center text-danger"
                                                onClick={() => {
                                                    handleDeleteComment(
                                                        comment.id
                                                    )
                                                    setShowOptions(null)
                                                }}
                                            >
                                                <FaTrash className="me-2" />{" "}
                                                Delete
                                            </button>
                                            {user?.role === "admin" &&
                                                user?.id !==
                                                    comment.user?.id && (
                                                    <>
                                                        <div className="dropdown-divider"></div>
                                                        <button
                                                            className="dropdown-item d-flex align-items-center text-warning"
                                                            onClick={() => {
                                                                toast.info(
                                                                    "User edit feature coming soon"
                                                                )
                                                                setShowOptions(
                                                                    null
                                                                )
                                                            }}
                                                        >
                                                            <FaUserEdit className="me-2" />{" "}
                                                            Edit User
                                                        </button>
                                                        <button
                                                            className="dropdown-item d-flex align-items-center text-danger"
                                                            onClick={() => {
                                                                toast.info(
                                                                    "User delete feature coming soon"
                                                                )
                                                                setShowOptions(
                                                                    null
                                                                )
                                                            }}
                                                        >
                                                            <FaUserSlash className="me-2" />{" "}
                                                            Delete User
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {editingComment === comment.id ? (
                            <div className="mt-3">
                                <textarea
                                    value={editCommentText}
                                    onChange={e =>
                                        setEditCommentText(e.target.value)
                                    }
                                    className="form-control mb-2"
                                    rows="3"
                                    autoFocus
                                />
                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        onClick={() => setEditingComment(null)}
                                        className="btn btn-outline-secondary btn-sm"
                                    >
                                        <FaTimes className="me-1" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateComment}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <FaCheck className="me-1" /> Update
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="mt-3 mb-3 ps-5">
                                    {comment.comment}
                                </p>
                                <div className="d-flex align-items-center ps-5 gap-2">
                                    <button
                                        onClick={() =>
                                            handleReply(
                                                comment.id,
                                                comment.user?.name
                                            )
                                        }
                                        className="btn btn-link btn-sm text-decoration-none"
                                    >
                                        <FaReply className="me-1" /> Reply
                                    </button>

                                    {user?.id === comment.user?.id && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleEdit(comment)
                                                }
                                                className="btn btn-link btn-sm text-decoration-none text-primary"
                                            >
                                                <FaEdit className="me-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteComment(
                                                        comment.id
                                                    )
                                                }
                                                className="btn btn-link btn-sm text-decoration-none text-danger"
                                            >
                                                <FaTrash className="me-1" />{" "}
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {renderComments(comment.replies, depth + 1)}
                    </div>
                )}
            </div>
        ))
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center">
                    {error}
                    <Link to="/" className="ms-2">
                        Go back to home
                    </Link>
                </div>
            </div>
        )
    }

    if (!book) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning text-center">
                    Book not found
                    <Link to="/" className="ms-2">
                        Browse other books
                    </Link>
                </div>
            </div>
        )
    }

    let bookImagePath = ""
    if (Array.isArray(book.images)) {
        bookImagePath = book.images[0]
    } else if (typeof book.images === "string") {
        bookImagePath = book.images
    }
    const bookImageUrl = bookImagePath
        ? bookImagePath.startsWith("http")
            ? bookImagePath
            : `http://localhost:8000/storage/${bookImagePath}`
        : "/placeholder.svg?height=300&width=200"

    const categoryColors = [
        "#6f42c1", // بنفسجي
        "#b49a7d", // كافي
        "#0dcaf0", // أزرق فاتح
        "#a084ee", // بنفسجي فاتح
        "#20c997", // تركواز
        "#fd7e14", // برتقالي
        "#adb5bd", // رمادي فاتح
    ]
    const getCategoryColor = (category, idx = 0) => {
        if (!category) return categoryColors[0]
        const normalized = category.toLowerCase()
        if (normalized.includes("رواية") || normalized.includes("novel"))
            return categoryColors[0]
        if (normalized.includes("كافي") || normalized.includes("coffee"))
            return categoryColors[1]
        if (normalized.includes("أزرق") || normalized.includes("blue"))
            return categoryColors[2]
        if (normalized.includes("بنفسجي") || normalized.includes("purple"))
            return categoryColors[3]
        if (normalized.includes("تركواز") || normalized.includes("turquoise"))
            return categoryColors[4]
        if (normalized.includes("برتقالي") || normalized.includes("orange"))
            return categoryColors[5]
        return categoryColors[idx % categoryColors.length]
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="bg-light py-5">
                <div className="container">
                    <div className="row mb-5">
                        <div className="col-md-5 mb-4 mb-md-0">
                            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                                <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ minHeight: "400px" }}
                                >
                                    {bookImageUrl ? (
                                        <img
                                            src={bookImageUrl}
                                            alt={book.title}
                                            className="img-fluid w-100 h-100 object-fit-contain p-4"
                                            loading="lazy"
                                            onError={e => {
                                                e.target.onerror = null
                                                e.target.src =
                                                    "/placeholder.svg"
                                            }}
                                        />
                                    ) : (
                                        <div className="d-flex flex-column align-items-center justify-content-center text-muted p-5">
                                            <FaBook className="display-1 mb-3" />
                                            <span>No image available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-7">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <StarRating
                                                    rating={avgRating}
                                                    size={24}
                                                />
                                                <span className="ms-2 text-muted">
                                                    ({ratingCount}{" "}
                                                    {ratingCount === 1
                                                        ? "rating"
                                                        : "ratings"}
                                                    )
                                                </span>
                                            </div>

                                            {user &&
                                                user.id !== book.user?.id && (
                                                    <div className="rating-section">
                                                        <p className="mb-2">
                                                            Your Rating:
                                                        </p>
                                                        <StarRating
                                                            rating={rating}
                                                            editable={true}
                                                            onRatingChange={
                                                                handleRatingSubmit
                                                            }
                                                            size={24}
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                        <div>
                                            <span
                                                className={`badge ${getStatusBadgeStyle(
                                                    book.status
                                                )} me-2`}
                                            >
                                                {book.status}
                                            </span>
                                            <span
                                                className="badge text-white"
                                                style={{
                                                    background:
                                                        getCategoryColor(
                                                            book.category?.name
                                                        ),
                                                }}
                                            >
                                                {book.category?.name ||
                                                    "Uncategorized"}
                                            </span>
                                        </div>
                                        <div className="d-flex gap-2">
                                            {user &&
                                                user.id !== book.user?.id && (
                                                    <>
                                                        <button
                                                            className={`btn btn-sm ${
                                                                isWishlisted
                                                                    ? "btn-danger"
                                                                    : "btn-outline-danger"
                                                            }`}
                                                            onClick={
                                                                handleWishlist
                                                            }
                                                            disabled={
                                                                loadingStatus
                                                            }
                                                        >
                                                            {isWishlisted ? (
                                                                <FaHeart />
                                                            ) : (
                                                                <FaRegHeart />
                                                            )}
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${
                                                                isInCart
                                                                    ? "btn-primary"
                                                                    : "btn-outline-primary"
                                                            }`}
                                                            onClick={handleCart}
                                                            disabled={
                                                                loadingStatus
                                                            }
                                                        >
                                                            <FaShoppingCart />
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    </div>

                                    <h1 className="h2 mb-3">{book.title}</h1>

                                    <div className="d-flex align-items-center mb-4">
                                        <div
                                            className="bg-primary text-white rounded-circle me-3"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {book.user?.name?.charAt(0) || "A"}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">
                                                Author
                                            </h6>
                                            <p className="mb-0">
                                                {book.user?.name || "Unknown"}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-muted mb-4">
                                        {book.description}
                                    </p>

                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                                <FaDollarSign className="text-success me-2" />
                                                <div>
                                                    <h6 className="mb-0 fw-bold">
                                                        Price
                                                    </h6>
                                                    <p className="mb-0">
                                                        ${book.price}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <FaDollarSign className="text-success me-2" />
                                                <div>
                                                    <h6 className="mb-0 fw-bold">
                                                        Rental Price
                                                    </h6>
                                                    <p className="mb-0">
                                                        ${book.rental_price}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                                <FaTag className="text-warning me-2" />
                                                <div>
                                                    <h6 className="mb-0 fw-bold">
                                                        Condition
                                                    </h6>
                                                    <p className="mb-0 text-capitalize">
                                                        {book.condition ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                                <FaInfoCircle className="text-info me-2" />
                                                <div>
                                                    <h6 className="mb-0 fw-bold">
                                                        ISBN
                                                    </h6>
                                                    <p className="mb-0">
                                                        {book.isbn || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                                <FaBook className="text-purple me-2" />
                                                <div>
                                                    <h6 className="mb-0 fw-bold">
                                                        Pages
                                                    </h6>
                                                    <p className="mb-0">
                                                        {book.pages || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        {user && user.id !== book.user?.id && (
                                            <>
                                                <button
                                                    className={`btn flex-grow-1 ${
                                                        isInCart
                                                            ? "btn-success"
                                                            : "btn-primary"
                                                    }`}
                                                    onClick={handleCart}
                                                    disabled={loadingStatus}
                                                >
                                                    {isInCart
                                                        ? "Added to Cart"
                                                        : "Add to Cart"}
                                                </button>
                                                <button
                                                    className={`btn ${
                                                        isWishlisted
                                                            ? "btn-danger"
                                                            : "btn-outline-danger"
                                                    }`}
                                                    onClick={handleWishlist}
                                                    disabled={loadingStatus}
                                                >
                                                    {isWishlisted
                                                        ? "Wishlisted"
                                                        : "Wishlist"}
                                                </button>
                                            </>
                                        )}
                                        {user && user.id === book.user?.id && (
                                            <Link
                                                to={`/edit-book/${book.id}`}
                                                className="btn btn-warning flex-grow-1"
                                            >
                                                Edit Book
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm mb-5 animate__animated animate__fadeIn">
                        <div className="card-header bg-white">
                            <h3 className="h5 mb-0">
                                <span className="badge bg-primary me-2">
                                    {book.comments?.length || 0}
                                </span>
                                Comments
                            </h3>
                        </div>
                        <div className="card-body">
                            {user ? (
                                <form
                                    onSubmit={handleCommentSubmit}
                                    className="mb-4"
                                >
                                    {replyingTo && (
                                        <div className="alert alert-info alert-dismissible fade show mb-3 py-2">
                                            <span>
                                                Replying to{" "}
                                                <strong>{replyingTo}</strong>
                                            </span>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => {
                                                    setParentId(null)
                                                    setReplyingTo(null)
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="form-floating mb-3">
                                        <textarea
                                            id="comment-input"
                                            value={commentInput}
                                            onChange={e =>
                                                setCommentInput(e.target.value)
                                            }
                                            placeholder="Share your thoughts about this book..."
                                            className="form-control"
                                            style={{ height: "100px" }}
                                        />
                                        <label htmlFor="comment-input">
                                            Your comment...
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loadingStatus}
                                    >
                                        {loadingStatus ? (
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                        ) : (
                                            <FaReply className="me-1" />
                                        )}
                                        Post Comment
                                    </button>
                                </form>
                            ) : (
                                <div className="alert alert-info">
                                    Please{" "}
                                    <Link to="/login" className="alert-link">
                                        login
                                    </Link>{" "}
                                    to leave a comment.
                                </div>
                            )}

                            {book.comments && book.comments.length > 0 ? (
                                <div className="mt-4">
                                    {renderComments(
                                        book.comments.filter(c => !c.parent_id)
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div
                                        className="text-muted mb-3"
                                        style={{ fontSize: "3rem" }}
                                    >
                                        💬
                                    </div>
                                    <h4 className="h5 text-muted">
                                        No comments yet
                                    </h4>
                                    <p className="text-muted">
                                        Be the first to share your thoughts!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {book.user && authorBooks.length > 0 && (
                        <div className="card shadow-sm mb-5 animate__animated animate__fadeIn">
                            <div className="card-header bg-white">
                                <h3 className="h5 mb-0">
                                    <span className="badge bg-purple me-2">
                                        {authorBooks.length}
                                    </span>
                                    More books by{" "}
                                    {book.user?.name || "this author"}
                                </h3>
                            </div>
                            <div className="card-body">
                                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                    {authorBooks.map(authorBook => {
                                        let authorBookImagePath = ""
                                        if (Array.isArray(authorBook.images)) {
                                            authorBookImagePath =
                                                authorBook.images[0]
                                        } else if (
                                            typeof authorBook.images ===
                                            "string"
                                        ) {
                                            authorBookImagePath =
                                                authorBook.images
                                        }
                                        const authorBookImageUrl =
                                            authorBookImagePath
                                                ? authorBookImagePath.startsWith(
                                                      "http"
                                                  )
                                                    ? authorBookImagePath
                                                    : `http://localhost:8000/storage/${authorBookImagePath}`
                                                : "/placeholder.svg?height=300&width=200"
                                        return (
                                            <div
                                                key={authorBook.id}
                                                className="col"
                                            >
                                                <Link
                                                    to={`/books/${authorBook.id}`}
                                                    className="text-decoration-none"
                                                >
                                                    <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                                                        <div
                                                            className="card-img-top"
                                                            style={{
                                                                height: "200px",
                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            {authorBookImageUrl ? (
                                                                <img
                                                                    src={
                                                                        authorBookImageUrl
                                                                    }
                                                                    alt={
                                                                        authorBook.title
                                                                    }
                                                                    className="img-fluid h-100 w-100 object-fit-cover"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="h-100 d-flex align-items-center justify-content-center bg-light text-muted">
                                                                    <FaBook className="display-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="card-body">
                                                            <h5 className="card-title text-truncate">
                                                                {
                                                                    authorBook.title
                                                                }
                                                            </h5>
                                                            <p className="card-text text-muted small text-truncate">
                                                                {authorBook
                                                                    .category
                                                                    ?.name ||
                                                                    "Uncategorized"}
                                                            </p>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span
                                                                    className={`badge ${getStatusBadgeStyle(
                                                                        authorBook.status
                                                                    )}`}
                                                                >
                                                                    {
                                                                        authorBook.status
                                                                    }
                                                                </span>
                                                                <span className="text-success fw-bold">
                                                                    {
                                                                        authorBook.price
                                                                    }{" "}
                                                                    $
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default BookDetails
