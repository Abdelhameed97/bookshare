import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { FaReply, FaEdit, FaTrash, FaEllipsisH, FaTimes, FaCheck, FaBook, FaUser, FaTag, FaInfoCircle, FaDollarSign } from 'react-icons/fa';

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [authorBooks, setAuthorBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [parentId, setParentId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [showOptions, setShowOptions] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    // Helper to get status badge color
    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case "available":
                return { background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "white" };
            case "rented":
                return { background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "white" };
            case "sold":
                return { background: "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)", color: "white" };
            default:
                return { background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)", color: "white" };
        }
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:8000/api/books/${id}`)
            .then(response => {
                setBook(response.data.data);
                setLoading(false);
                // Fetch author's books after book is loaded
                const userId = response.data.data.user?.id;
                if (userId) {
                    axios
                        .get(`http://localhost:8000/api/books?user_id=${userId}`)
                        .then(res => {
                            // Exclude the current book
                            const filtered = res.data.data.filter(
                                b => b.id !== response.data.data.id
                            );
                            setAuthorBooks(filtered);
                        })
                        .catch(() => setAuthorBooks([]));
                }
            })
            .catch(err => {
                setError("Failed to load book details.");
                setLoading(false);
            });
    }, [id]);

    const fetchBookWithComments = () => {
        axios
            .get(`http://localhost:8000/api/books/${id}`)
            .then(response => {
                setBook(response.data.data);
            })
            .catch(err => {
                console.error("Failed to refresh comments:", err);
            });
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        try {
            await axios.post('http://localhost:8000/api/comment', {
                user_id: user.id,
                book_id: id,
                comment: commentInput,
                parent_id: parentId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setCommentInput("");
            setParentId(null);
            setReplyingTo(null);
            fetchBookWithComments();
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const handleReply = (commentId, username) => {
        setParentId(commentId);
        setReplyingTo(username);
        setEditingComment(null);
        document.getElementById("comment-input").focus();
    };

    const handleEdit = (comment) => {
        setEditingComment(comment.id);
        setEditCommentText(comment.content);
        setParentId(null);
        setReplyingTo(null);
    };

    const handleUpdateComment = async () => {
        if (!editCommentText.trim()) return;

        try {
            await axios.put(`http://localhost:8000/api/comment/${editingComment}`, {
                comment: editCommentText
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setEditingComment(null);
            setEditCommentText("");
            fetchBookWithComments();
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                await axios.delete(`http://localhost:8000/api/comment/${commentId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                fetchBookWithComments();
            } catch (error) {
                console.error("Error deleting comment:", error);
            }
        }
    };

    const renderComments = (comments, depth = 0) => {
        return comments.map(comment => (
            <div 
                key={comment.id} 
                className={`mb-3 ${depth > 0 ? 'ml-4 pl-3 border-l-2 border-blue-200' : ''} transition-all duration-300 transform hover:scale-[1.01]`}
            >
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center mb-2">
                            <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                                {comment.user?.name?.charAt(0) || "A"}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    {comment.user?.name || "Anonymous"}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                        
                        {user && (user.id === comment.user?.id || user.role === 'admin') && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowOptions(showOptions === comment.id ? null : comment.id)}
                                    className="text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    <FaEllipsisH size={16} />
                                </button>
                                
                                {showOptions === comment.id && (
                                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden animate-fadeIn">
                                        <button 
                                            onClick={() => {
                                                handleEdit(comment);
                                                setShowOptions(null);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                        >
                                            <FaEdit className="mr-2 text-blue-500" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => {
                                                handleDeleteComment(comment.id);
                                                setShowOptions(null);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <FaTrash className="mr-2" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {editingComment === comment.id ? (
                        <div className="mt-3">
                            <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                                rows="3"
                                autoFocus
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                                <button
                                    onClick={() => setEditingComment(null)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes className="mr-1" /> Cancel
                                </button>
                                <button
                                    onClick={handleUpdateComment}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                                >
                                    <FaCheck className="mr-1" /> Update
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-gray-700 mt-3 mb-3 pl-11">{comment.content}</div>
                            <div className="flex items-center text-sm pl-11">
                                <button
                                    onClick={() => handleReply(comment.id, comment.user?.name)}
                                    className="text-blue-500 hover:text-blue-700 flex items-center transition-colors"
                                >
                                    <FaReply className="mr-1" /> Reply
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Render replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {renderComments(comment.replies, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading book details...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Book</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link 
                    to="/" 
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
    
    if (!book) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-yellow-500 text-5xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Not Found</h2>
                <p className="text-gray-600 mb-6">The book you're looking for doesn't exist or has been removed.</p>
                <Link 
                    to="/" 
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Browse Other Books
                </Link>
            </div>
        </div>
    );

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="container max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="relative">
                    {/* Book Cover */}
                    <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={book.title}
                                    className="max-h-56 rounded-xl shadow-2xl border-4 border-white transform rotate-3"
                                />
                            ) : (
                                <div className="bg-gray-200 text-gray-500 p-5 rounded h-56 w-40 flex items-center justify-center">
                                    <FaBook className="text-4xl text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Book Details */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3 flex justify-center">
                                <div className="w-64 h-80 bg-white rounded-xl shadow-lg p-4 flex items-center justify-center">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={book.title}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-gray-500 flex flex-col items-center">
                                            <FaBook className="text-6xl mb-3" />
                                            <span>No Cover</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="md:w-2/3">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{book.title}</h1>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                            <FaUser className="text-blue-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Author</p>
                                            <p className="text-lg font-semibold text-blue-600">
                                                {book.user?.name || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-full mr-4">
                                            <FaTag className="text-green-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Category</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {book.category?.name || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                                            <FaInfoCircle className="text-purple-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Status</p>
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white shadow-md"
                                                style={getStatusBadgeStyle(book.status)}
                                            >
                                                {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className="bg-yellow-100 p-3 rounded-full mr-4">
                                            <FaDollarSign className="text-yellow-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Price</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {book.price} $
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-5 mt-5">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                            <FaInfoCircle className="mr-2 text-blue-500" />
                                            Description
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {book.description || "No description available."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <hr className="my-8 border-t border-gray-200" />
                        
                        {/* Comments Section */}
                        <div className="comments-section">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                                <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white mr-3">💬</span>
                                Comments ({book.comments?.length || 0})
                            </h3>
                            
                            {/* Comment Form */}
                            {user && (
                                <div className="mb-8 bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                                    {replyingTo && (
                                        <div className="flex items-center text-sm text-gray-600 mb-3 bg-blue-50 px-3 py-2 rounded-lg">
                                            <span className="font-medium">Replying to {replyingTo}</span>
                                            <button 
                                                onClick={() => {
                                                    setParentId(null);
                                                    setReplyingTo(null);
                                                }}
                                                className="ml-2 text-gray-500 hover:text-gray-700"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <form onSubmit={handleCommentSubmit}>
                                        <textarea
                                            id="comment-input"
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            placeholder="Share your thoughts about this book..."
                                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            rows="4"
                                        />
                                        <div className="flex justify-end mt-3">
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md flex items-center"
                                            >
                                                <FaReply className="mr-2" />
                                                Post Comment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            
                            {/* Comments List */}
                            {book.comments && book.comments.length > 0 ? (
                                <div className="space-y-5">
                                    {renderComments(book.comments.filter(c => !c.parent_id))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <div className="text-gray-400 text-5xl mb-4">💬</div>
                                    <h4 className="text-xl font-medium text-gray-600 mb-2">No comments yet</h4>
                                    <p className="text-gray-500 mb-4">Be the first to share your thoughts!</p>
                                    {!user && (
                                        <Link 
                                            to="/login" 
                                            className="inline-block px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Login to Comment
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <hr className="my-8 border-t border-gray-200" />
                        
                        {/* Author's other books */}
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                                <span className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white mr-3">📚</span>
                                More books by {book.user?.name || "this author"}
                            </h3>
                            {authorBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                    {authorBooks.map(book => {
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
                                            <div key={book.id} className="col-span-1">
                                                <Link
                                                    to={`/books/${book.id}`}
                                                    className="block no-underline"
                                                >
                                                    <div className="card h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={book.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="text-gray-400">
                                                                    <FaBook className="text-4xl" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <h5 className="font-bold text-gray-800 mb-1 truncate">
                                                                {book.title}
                                                            </h5>
                                                            <p className="text-sm text-gray-600 mb-2 truncate">
                                                                {book.category?.name || "Uncategorized"}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <span
                                                                    className="badge text-xs px-2 py-1 rounded-full"
                                                                    style={getStatusBadgeStyle(book.status)}
                                                                >
                                                                    {book.status}
                                                                </span>
                                                                <span className="text-green-600 font-bold">
                                                                    {book.price} $
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <div className="text-gray-400 text-5xl mb-4">📭</div>
                                    <h4 className="text-xl font-medium text-gray-600 mb-2">No other books found</h4>
                                    <p className="text-gray-500">This author hasn't published other books yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;