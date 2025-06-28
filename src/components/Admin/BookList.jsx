import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../../api/auth"
import Navbar from "../HomePage/Navbar"
import Footer from "../HomePage/Footer"
import Swal from "sweetalert2"
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from "react-icons/fa"
import "../../components/Library/Dashboard.css"

const BookList = () => {
    const [books, setBooks] = useState([])
    const [categories, setCategories] = useState([])
    const [libraries, setLibraries] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [showModal, setShowModal] = useState(false)

    const [searchParams, setSearchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(
        searchParams.get("title") || ""
    )
    const [selectedLibrary, setSelectedLibrary] = useState(
        searchParams.get("user_id") || ""
    )

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        quantity: "1",
        category_id: "",
        condition: "new",
        status: "available",
    })
    const [imageFile, setImageFile] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [formError, setFormError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [editId, setEditId] = useState(null)
    const booksPerPage = 5

    useEffect(() => {
        const query = searchParams.toString()
        fetchBooks(query)
        if (!categories.length) fetchCategories()
        if (!libraries.length) fetchLibraries()
    }, [searchParams])

    const fetchBooks = async (query = "") => {
        setLoading(true)
        try {
            const response = await api.get(`/books?${query}`)
            setBooks(response.data.data || [])
        } catch (error) {
            setBooks([])
            console.error(
                "Failed to fetch books:",
                error.response?.data?.message || error.message
            )
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories")
            setCategories(response.data.categories || [])
        } catch (error) {
            console.error("Failed to fetch categories", error)
        }
    }

    const fetchLibraries = async () => {
        try {
            const response = await api.get("/users?role=owner")
            const owners = response.data.data.filter(
                user => user.role === "owner"
            )
            setLibraries(owners || [])
        } catch (error) {
            console.error("Failed to fetch libraries", error)
        }
    }

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (searchTerm) params.set("title", searchTerm)
        if (selectedLibrary) params.set("user_id", selectedLibrary)
        setSearchParams(params)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchTerm("")
        setSelectedLibrary("")
        setSearchParams({})
    }

    const openModal = (book = null) => {
        if (book) {
            setForm({
                title: book.title || "",
                description: book.description || "",
                price: book.price || "",
                quantity: book.quantity || "1",
                category_id: book.category_id || "",
                condition: book.condition || "new",
                status: book.status || "available",
            })
            setEditId(book.id)
            if (book.images && book.images[0]) {
                setPreviewImage(
                    `http://localhost:8001/storage/${book.images[0]}`
                )
            }
        } else {
            setForm({
                title: "",
                description: "",
                price: "",
                quantity: "1",
                category_id: "",
                condition: "new",
                status: "available",
            })
            setEditId(null)
        }
        setImageFile(null)
        if (!book) setPreviewImage(null)
        setFormError("")
        setShowModal(true)
    }

    const closeModal = () => setShowModal(false)
    const handleFormChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value })
    const handleFileChange = e => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setFormError("")
        if (!form.title || !form.price || !form.category_id) {
            setFormError("Title, Price, and Category are required fields.")
            return
        }
        setSubmitting(true)
        const formData = new FormData()
        Object.keys(form).forEach(key => formData.append(key, form[key]))

        if (imageFile) {
            // The backend expects 'images' as the key for file uploads, in an array format
            formData.append("images[0]", imageFile)
        }

        try {
            if (editId) {
                formData.append("_method", "PUT") // Method spoofing for Laravel
                await api.post(`/books/${editId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                Swal.fire("Success", "Book updated successfully!", "success")
            } else {
                if (!imageFile) {
                    setFormError("Book cover image is required for new books.")
                    setSubmitting(false)
                    return
                }
                await api.post("/books", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                Swal.fire("Success", "Book created successfully!", "success")
            }
            fetchBooks(searchParams.toString())
            closeModal()
        } catch (error) {
            const errorData = error.response?.data
            const errorMsg = errorData?.errors
                ? Object.values(errorData.errors).flat().join(" ")
                : errorData?.message || "An unexpected error occurred."
            setFormError(errorMsg)
            Swal.fire("Error", errorMsg, "error")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async id => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        })
        if (result.isConfirmed) {
            try {
                await api.delete(`/books/${id}`)
                fetchBooks(searchParams.toString())
                Swal.fire("Deleted!", "Book has been deleted.", "success")
            } catch (error) {
                Swal.fire(
                    "Error",
                    error.response?.data?.message || "Failed to delete book.",
                    "error"
                )
            }
        }
    }

    const indexOfLast = currentPage * booksPerPage
    const indexOfFirst = indexOfLast - booksPerPage
    const currentBooks = books.slice(indexOfFirst, indexOfLast)
    const totalPages = Math.ceil(books.length / booksPerPage)

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <h1 style={{ fontWeight: 700, color: "#1e293b" }}>
                        Manage Books
                    </h1>
                    <button
                        onClick={() => openModal()}
                        style={{
                            background: "#3b82f6",
                            color: "white",
                            borderRadius: 8,
                            padding: "0.6rem 1.2rem",
                            fontWeight: 600,
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <FaPlus /> Add New Book
                    </button>
                </div>
                <div
                    style={{
                        background: "#f8fafc",
                        padding: "1rem",
                        borderRadius: 8,
                        marginBottom: "2rem",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                    }}
                >
                    <div style={{ flex: 1, position: "relative" }}>
                        <FaSearch
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "1rem",
                                transform: "translateY(-50%)",
                                color: "#9ca3af",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search by book title..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyPress={e =>
                                e.key === "Enter" && handleSearch()
                            }
                            style={{
                                width: "100%",
                                padding: "0.6rem 1rem 0.6rem 2.5rem",
                                borderRadius: 6,
                                border: "1px solid #d1d5db",
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <select
                            value={selectedLibrary}
                            onChange={e => setSelectedLibrary(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.6rem",
                                borderRadius: 6,
                                border: "1px solid #d1d5db",
                            }}
                        >
                            <option value="">Filter by Library</option>
                            {libraries.map(lib => (
                                <option key={lib.id} value={lib.id}>
                                    {lib.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSearch}
                        style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            padding: "0.6rem 1.2rem",
                            fontWeight: 500,
                        }}
                    >
                        Search
                    </button>
                    <button
                        onClick={clearFilters}
                        style={{
                            background: "#64748b",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            padding: "0.6rem 1.2rem",
                            fontWeight: 500,
                        }}
                    >
                        Clear
                    </button>
                </div>
                <div
                    style={{
                        background: "white",
                        borderRadius: 12,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                        padding: "2rem",
                    }}
                >
                    <table
                        className="admin-table"
                        style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                        <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                                <th style={{ padding: "0.75rem 1rem" }}>
                                    Cover
                                </th>
                                <th
                                    style={{
                                        padding: "0.75rem 1rem",
                                        textAlign: "left",
                                    }}
                                >
                                    Title & Author
                                </th>
                                <th style={{ padding: "0.75rem 1rem" }}>
                                    Category
                                </th>
                                <th style={{ padding: "0.75rem 1rem" }}>
                                    Price
                                </th>
                                <th style={{ padding: "0.75rem 1rem" }}>Qty</th>
                                <th style={{ padding: "0.75rem 1rem" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign: "center",
                                            padding: "2rem",
                                        }}
                                    >
                                        Loading books...
                                    </td>
                                </tr>
                            ) : currentBooks.length > 0 ? (
                                currentBooks.map(book => (
                                    <tr
                                        key={book.id}
                                        style={{
                                            borderBottom: "1px solid #f3f4f6",
                                        }}
                                    >
                                        <td style={{ padding: "0.75rem 1rem" }}>
                                            <img
                                                src={
                                                    book.images &&
                                                    book.images[0]
                                                        ? `http://localhost:8001/storage/${book.images[0]}`
                                                        : "https://via.placeholder.com/50x70"
                                                }
                                                alt={book.title}
                                                style={{
                                                    width: 50,
                                                    height: "auto",
                                                    objectFit: "cover",
                                                    borderRadius: 4,
                                                    boxShadow:
                                                        "0 2px 4px rgba(0,0,0,0.1)",
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: "0.75rem 1rem" }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: "#334155",
                                                }}
                                            >
                                                {book.title}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#64748b",
                                                }}
                                            >
                                                by {book.user?.name || "N/A"}
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.75rem 1rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    background: "#eef2f6",
                                                    color: "#475569",
                                                    padding: "0.25rem 0.6rem",
                                                    borderRadius: 12,
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                }}
                                            >
                                                {book.category?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.75rem 1rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            ${parseFloat(book.price).toFixed(2)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.75rem 1rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            {book.quantity || 1}
                                        </td>
                                        <td
                                            style={{
                                                padding: "0.75rem 1rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            <button
                                                onClick={() => openModal(book)}
                                                style={{
                                                    background: "#f0fdf4",
                                                    color: "#15803d",
                                                    border: "1px solid #bbf7d0",
                                                    borderRadius: 6,
                                                    padding: "0.4rem 0.7rem",
                                                    marginRight: 8,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(book.id)
                                                }
                                                style={{
                                                    background: "#fef2f2",
                                                    color: "#b91c1c",
                                                    border: "1px solid #fecaca",
                                                    borderRadius: 6,
                                                    padding: "0.4rem 0.7rem",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign: "center",
                                            color: "#888",
                                            padding: "2rem",
                                        }}
                                    >
                                        No books found for the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: 24,
                                gap: 8,
                            }}
                        >
                            <button
                                onClick={() =>
                                    setCurrentPage(p => Math.max(p - 1, 1))
                                }
                                disabled={currentPage === 1}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    cursor: "pointer",
                                }}
                            >
                                {"<"}
                            </button>
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx + 1}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        borderRadius: 6,
                                        border: "1px solid #d1d5db",
                                        background:
                                            currentPage === idx + 1
                                                ? "#3b82f6"
                                                : "white",
                                        color:
                                            currentPage === idx + 1
                                                ? "white"
                                                : "#222",
                                        fontWeight:
                                            currentPage === idx + 1 ? 700 : 500,
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentPage(p =>
                                        Math.min(p + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    cursor: "pointer",
                                }}
                            >
                                {">"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.25)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: 12,
                            padding: "2rem",
                            minWidth: 550,
                            maxWidth: "90vw",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={closeModal}
                            style={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                background: "none",
                                border: "none",
                                color: "#888",
                                fontSize: 20,
                                cursor: "pointer",
                            }}
                        >
                            <FaTimes />
                        </button>
                        <h2
                            style={{
                                marginBottom: 20,
                                color: "#1e293b",
                                fontWeight: 700,
                            }}
                        >
                            {editId ? "Edit Book" : "Create Book"}
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            <div style={{ display: "flex", gap: "1.5rem" }}>
                                <div style={{ flex: "0 0 150px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Cover
                                    </label>
                                    <div
                                        style={{
                                            width: 150,
                                            height: 220,
                                            border: "2px dashed #d1d5db",
                                            borderRadius: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#f9fafb",
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                    >
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <span
                                                style={{
                                                    color: "#6b7280",
                                                    fontSize: 14,
                                                    textAlign: "center",
                                                }}
                                            >
                                                Upload Image
                                            </span>
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                opacity: 0,
                                                cursor: "pointer",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem",
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: 6,
                                                color: "#374151",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleFormChange}
                                            style={{
                                                width: "100%",
                                                padding: "0.6rem",
                                                borderRadius: 6,
                                                border: "1px solid #d1d5db",
                                                fontSize: 16,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: 6,
                                                color: "#374151",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleFormChange}
                                            rows="4"
                                            style={{
                                                width: "100%",
                                                padding: "0.6rem",
                                                borderRadius: 6,
                                                border: "1px solid #d1d5db",
                                                fontSize: 16,
                                                resize: "vertical",
                                            }}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Category
                                    </label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleFormChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            fontSize: 16,
                                        }}
                                    >
                                        <option value="">
                                            Select Category
                                        </option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={form.price}
                                        onChange={handleFormChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            fontSize: 16,
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={form.quantity}
                                        onChange={handleFormChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            fontSize: 16,
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Condition
                                    </label>
                                    <select
                                        name="condition"
                                        value={form.condition}
                                        onChange={handleFormChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            fontSize: 16,
                                        }}
                                    >
                                        <option value="new">New</option>
                                        <option value="used">Used</option>
                                    </select>
                                </div>
                            </div>
                            {formError && (
                                <div
                                    style={{
                                        color: "#ef4444",
                                        marginTop: 10,
                                        background: "#fee2e2",
                                        padding: "0.5rem",
                                        borderRadius: 6,
                                        border: "1px solid #fca5a5",
                                        textAlign: "center",
                                    }}
                                >
                                    {formError}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "0.7rem 1.5rem",
                                    fontWeight: 600,
                                    fontSize: 16,
                                    width: "100%",
                                    marginTop: "1rem",
                                }}
                            >
                                {submitting
                                    ? "Saving..."
                                    : editId
                                    ? "Save Changes"
                                    : "Create Book"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </>
    )
}

export default BookList
