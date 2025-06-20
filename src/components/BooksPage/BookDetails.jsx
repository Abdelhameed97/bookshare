import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './BookDetails.css'; // Assuming you have a CSS file for styling
import { FaHeart, FaReply, FaEllipsisH, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [parentId, setParentId] = useState(null);
  const [user, setUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [showOptions, setShowOptions] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBook();
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    if (token) {
      try {
        const res = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user');
      }
    }
  };

  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/books/${id}`);
      const bookData = response.data.data;
      setBook(bookData);

      const userId = bookData.user?.id;
      if (userId) {
        const res = await axios.get(`http://localhost:8000/api/books?user_id=${userId}`);
        const filtered = res.data.data.filter((b) => b.id !== bookData.id);
        setAuthorBooks(filtered);
      }
    } catch (err) {
      console.error('Error loading book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await axios.post(
        'http://localhost:8000/api/comment',
        {
          user_id: user.id,
          book_id: book.id,
          comment: commentInput,
          parent_id: parentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentInput('');
      setParentId(null);
      setReplyingTo(null);
      setEditingComment(null);
      fetchBook();
    } catch (err) {
      console.error('Error adding comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8000/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBook();
      setShowOptions(null);
    } catch (err) {
      console.error('Delete error');
    }
  };

  const handleEdit = async (commentId, newContent) => {
    try {
      await axios.put(
        `http://localhost:8000/api/comment/${commentId}`,
        { comment: newContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBook();
      setEditingComment(null);
    } catch (err) {
      console.error('Edit error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComments = (comments, parent = null, depth = 0) => {
    return comments
      .filter((c) => c.parent_id === parent)
      .map((comment) => (
        <div 
          key={comment.id} 
          className={`comment-container ${depth > 0 ? 'reply-comment' : ''}`}
          style={{ 
            marginLeft: depth > 0 ? `${depth * 30}px` : '0',
            borderLeft: depth > 0 ? '2px solid #e5e7eb' : 'none',
          }}
        >
          <div className="comment-header">
            <div className="comment-author">
              <img 
                src={comment.user?.avatar || '/default-avatar.png'} 
                alt={comment.user?.name}
                className="comment-avatar"
              />
              <div>
                <strong>{comment.user?.name}</strong>
                <div className="comment-date">{formatDate(comment.created_at)}</div>
              </div>
            </div>
            
            {user && (user.id === comment.user_id || user.role === 'admin') && (
              <div className="comment-options">
                <button 
                  className="options-btn"
                  onClick={() => setShowOptions(showOptions === comment.id ? null : comment.id)}
                >
                  <FaEllipsisH />
                </button>
                
                {showOptions === comment.id && (
                  <div className="options-menu">
                    <button 
                      onClick={() => {
                        setEditingComment(comment.id);
                        setCommentInput(comment.comment);
                        setShowOptions(null);
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(comment.id)}>
                      <FaTrash /> Delete
                    </button>
                    <button onClick={() => setShowOptions(null)}>
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="comment-content">
            {editingComment === comment.id ? (
              <div className="edit-comment">
                <textarea
                  className="form-control mb-2"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows="3"
                />
                <div className="edit-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(comment.id, commentInput)}
                  >
                    Save
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingComment(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p>{comment.comment}</p>
            )}
          </div>
          
          <div className="comment-actions">
            <button className="like-btn">
              <FaHeart /> Like
            </button>
            <button 
              className="reply-btn"
              onClick={() => {
                setParentId(comment.id);
                setReplyingTo(comment.user?.name);
                setEditingComment(null);
              }}
            >
              <FaReply /> Reply
            </button>
          </div>
          
          {/* Render replies */}
          {renderComments(comments, comment.id, depth + 1)}
          
          {/* Reply input when active */}
          {parentId === comment.id && (
            <div className="reply-input-container">
              <div className="reply-prompt">
                Replying to <strong>{replyingTo}</strong>
                <button 
                  className="cancel-reply"
                  onClick={() => {
                    setParentId(null);
                    setReplyingTo(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <textarea
                className="form-control mb-2"
                placeholder="Write your reply..."
                rows="2"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleAddComment}
              >
                Reply
              </button>
            </div>
          )}
        </div>
      ));
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading book details...</p>
    </div>
  );
  
  if (!book) return (
    <div className="alert-container">
      <div className="alert alert-danger">Book not found</div>
    </div>
  );

  const imagePath = Array.isArray(book.images) ? book.images[0] : book.images;
  const imageUrl = imagePath
    ? imagePath.startsWith('http')
      ? imagePath
      : `http://localhost:8000/storage/${imagePath}`
    : '/placeholder.svg';

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'available':
        return { backgroundColor: '#10B981', color: '#fff' };
      case 'rented':
        return { backgroundColor: '#F59E0B', color: '#fff' };
      case 'sold':
        return { backgroundColor: '#EF4444', color: '#fff' };
      default:
        return { backgroundColor: '#6B7280', color: '#fff' };
    }
  };

  return (
    <div className="book-details-container">
      <div className="book-header">
        <div className="book-cover">
          <img src={imageUrl} alt={book.title} className="book-image" />
          <div className="book-status" style={getStatusBadgeStyle(book.status)}>
            {book.status.toUpperCase()}
          </div>
        </div>
        
        <div className="book-info">
          <h1>{book.title}</h1>
          
          <div className="book-meta">
            <div className="meta-item">
              <span className="meta-label">Author:</span>
              <span className="meta-value">{book.user?.name}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{book.category?.name}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Price:</span>
              <span className="meta-value">${book.price}</span>
            </div>
          </div>
          
          <div className="book-description">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="section-title">
          Comments {book.comments?.length > 0 && `(${book.comments.length})`}
        </h2>
        
        {user && (
          <div className="new-comment">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.name}
              className="user-avatar"
            />
            <div className="comment-input-container">
              <textarea
                className="form-control"
                placeholder="Write a comment..."
                rows="3"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <div className="comment-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                >
                  Post
                </button>
                {parentId && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setParentId(null);
                      setReplyingTo(null);
                      setCommentInput('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="comments-list">
          {book.comments?.length > 0 ? (
            renderComments(book.comments)
          ) : (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          )}
        </div>
      </div>

      {/* More books by author */}
      {authorBooks.length > 0 && (
        <div className="author-books">
          <h2 className="section-title">More by {book.user?.name}</h2>
          <div className="books-grid">
            {authorBooks.map((book) => {
              const img = Array.isArray(book.images) ? book.images[0] : book.images;
              const url = img?.startsWith('http')
                ? img
                : `http://localhost:8000/storage/${img}`;
              return (
                <Link to={`/books/${book.id}`} key={book.id} className="book-card">
                  <div className="book-card-image">
                    <img src={url || '/placeholder.svg'} alt={book.title} />
                    <div className="book-card-status" style={getStatusBadgeStyle(book.status)}>
                      {book.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="book-card-info">
                    <h3>{book.title}</h3>
                    <p className="price">${book.price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
