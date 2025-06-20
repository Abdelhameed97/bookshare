// src/components/CommentsSection.jsx
import { useEffect, useState } from "react"

const CommentsSection = ({ bookId, currentUser }) => {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [replyTo, setReplyTo] = useState(null)
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editedComment, setEditedComment] = useState("")

    const fetchComments = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/comment")
            const data = await res.json()
            const filtered = data.filter(c => c.book_id === bookId)
            setComments(filtered)
        } catch (err) {
            console.error("Failed to fetch comments", err)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [bookId])

    const handleCommentSubmit = async e => {
        e.preventDefault()
        if (!newComment.trim()) return

        const body = {
            comment: newComment,
            book_id: bookId,
            user_id: currentUser.id,
            parent_id: replyTo,
        }

        try {
            const res = await fetch("http://localhost:8000/api/comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error("Failed to add comment")

            setNewComment("")
            setReplyTo(null)
            fetchComments()
        } catch (err) {
            console.error("❌ Failed to add comment:", err)
        }
    }

    const handleDelete = async id => {
        if (!window.confirm("Are you sure you want to delete this comment?"))
            return
        try {
            await fetch(`http://localhost:8000/api/comment/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            fetchComments()
        } catch (err) {
            console.error("Delete failed", err)
        }
    }

    const handleEdit = comment => {
        setEditingCommentId(comment.id)
        setEditedComment(comment.comment)
    }

    const handleEditSubmit = async id => {
        try {
            await fetch(`http://localhost:8000/api/comment/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ comment: editedComment }),
            })
            setEditingCommentId(null)
            setEditedComment("")
            fetchComments()
        } catch (err) {
            console.error("Edit failed", err)
        }
    }

    const renderComment = (comment, isReply = false) => {
        const isOwnerOrAdmin =
            currentUser &&
            (comment.user_id === currentUser.id || currentUser.role === "admin")

        return (
            <div
                key={comment.id}
                className={`border rounded-lg p-4 mb-4 ${
                    isReply ? "ml-6 bg-gray-50" : "bg-white"
                }`}
            >
                <p className="font-bold text-[#199A8E]">{comment.user?.name}</p>
                {editingCommentId === comment.id ? (
                    <div>
                        <textarea
                            className="w-full border rounded p-2 mt-2"
                            value={editedComment}
                            onChange={e => setEditedComment(e.target.value)}
                        />
                        <div className="mt-2 space-x-2">
                            <button
                                onClick={() => handleEditSubmit(comment.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                                ✅ Save
                            </button>
                            <button
                                onClick={() => setEditingCommentId(null)}
                                className="bg-gray-400 text-white px-3 py-1 rounded"
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 mt-1 whitespace-pre-line">
                        {comment.comment}
                    </p>
                )}

                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {currentUser && (
                        <button
                            className="text-blue-500 hover:underline"
                            onClick={() => setReplyTo(comment.id)}
                        >
                            ↩️ Reply
                        </button>
                    )}
                    {isOwnerOrAdmin && (
                        <>
                            <button
                                className="text-yellow-600 hover:underline"
                                onClick={() => handleEdit(comment)}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleDelete(comment.id)}
                            >
                                🗑 Delete
                            </button>
                        </>
                    )}
                </div>

                {comment.replies?.length > 0 && (
                    <div className="mt-4">
                        {comment.replies.map(reply =>
                            renderComment(reply, true)
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">💬 Comments</h3>

            {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
                        rows={3}
                        placeholder={
                            replyTo
                                ? "Write a reply..."
                                : "Write a comment about this book..."
                        }
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    ></textarea>
                    {replyTo && (
                        <p className="text-sm text-gray-500 mt-1">
                            Replying to comment #{replyTo}{" "}
                            <button
                                type="button"
                                className="text-red-500 ml-2 hover:underline"
                                onClick={() => setReplyTo(null)}
                            >
                                Cancel
                            </button>
                        </p>
                    )}
                    <button
                        type="submit"
                        className="mt-2 bg-[#199A8E] text-white px-4 py-2 rounded hover:bg-[#157d74]"
                    >
                        ➕ {replyTo ? "Reply" : "Add Comment"}
                    </button>
                </form>
            ) : (
                <p className="text-gray-500 mb-4">
                    You must be logged in to comment.
                </p>
            )}

            {comments.length === 0 ? (
                <p className="text-gray-400 italic">No comments yet.</p>
            ) : (
                comments
                    .filter(c => c.parent_id === null)
                    .map(c => renderComment(c))
            )}
        </div>
    )
}

export default CommentsSection
