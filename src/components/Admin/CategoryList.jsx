import React, { useState, useEffect } from "react"
import api from "../../api/auth"
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa"
import Navbar from "../HomePage/Navbar"
import Footer from "../HomePage/Footer"
import Swal from "sweetalert2"
import "../../components/Library/Dashboard.css"
// يمكنك إضافة ملف CSS خاص بهذه الصفحة لتنسيق الجدول والأزرار
// import './CategoryList.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({
        name: "",
        type: "general",
        customType: "",
    })
    const [formError, setFormError] = useState("")
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const categoriesPerPage = 6

    // حساب التصنيفات المعروضة في الصفحة الحالية
    const indexOfLast = currentPage * categoriesPerPage
    const indexOfFirst = indexOfLast - categoriesPerPage
    const currentCategories = categories.slice(indexOfFirst, indexOfLast)
    const totalPages = Math.ceil(categories.length / categoriesPerPage)

    // عند تغيير التصنيفات، ارجع للصفحة الأولى
    useEffect(() => {
        setCurrentPage(1)
    }, [categories.length])

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const response = await api.get("/categories")
            setCategories(response.data.categories)
        } catch (error) {
            setCategories([])
        } finally {
            setLoading(false)
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
                await api.delete(`/categories/${id}`)
                await fetchCategories()
                Swal.fire("Deleted!", "Category has been deleted.", "success")
            } catch (error) {
                Swal.fire("Error", "Failed to delete category.", "error")
            }
        }
    }

    const openModal = (category = null) => {
        if (category) {
            setForm({ name: category.name, type: category.type })
            setEditId(category.id)
        } else {
            setForm({ name: "", type: "general" })
            setEditId(null)
        }
        setFormError("")
        setShowModal(true)
    }
    const closeModal = () => {
        setShowModal(false)
        setFormError("")
        setEditId(null)
    }

    const handleFormChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleAddOrEditCategory = async e => {
        e.preventDefault()
        setFormError("")
        setAdding(true)
        if (!form.name.trim()) {
            setFormError("Category name is required")
            setAdding(false)
            return
        }
        if (form.type === "other" && !form.customType.trim()) {
            setFormError("Please enter the custom type")
            setAdding(false)
            return
        }
        // أرسل فقط الحقول المطلوبة للباكند
        let dataToSend = {
            name: form.name,
            type: form.type === "other" ? form.customType : form.type,
        }
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, dataToSend)
                Swal.fire(
                    "Success",
                    "Category updated successfully!",
                    "success"
                )
            } else {
                await api.post("/categories", dataToSend)
                Swal.fire("Success", "Category added successfully!", "success")
            }
            fetchCategories()
            closeModal()
        } catch (error) {
            setFormError(
                error.response?.data?.message || "Failed to save category"
            )
            Swal.fire(
                "Error",
                error.response?.data?.message || "Failed to save category",
                "error"
            )
        } finally {
            setAdding(false)
        }
    }

    // دالة لإرجاع لون مخصص لكل كاتيجوري
    const getCategoryColor = category => {
        switch ((category || "").toLowerCase()) {
            case "children's books":
            case "أطفال":
            case "kids":
                return "#0d6efd" // أزرق
            case "romance":
            case "روايات":
            case "novel":
                return "#e75480" // وردي
            case "art & architecture":
            case "فن":
            case "art":
            case "architecture":
                return "#a259e6" // بنفسجي
            case "history":
            case "تاريخ":
                return "#fd7e14" // برتقالي
            case "science":
            case "علوم":
                return "#20c997" // أخضر تركواز
            default:
                return "#adb5bd" // رمادي
        }
    }

    if (loading) return <p>Loading categories...</p>

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div
                    className="admin-page-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "2rem",
                    }}
                >
                    <h1 style={{ fontWeight: 700, color: "#1e293b" }}>
                        Manage Categories
                    </h1>
                    <button
                        className="btn-add-new"
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
                        onClick={() => openModal()}
                    >
                        <FaPlus /> Add New Category
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
                                <th style={{ padding: "0.75rem" }}>ID</th>
                                <th style={{ padding: "0.75rem" }}>Name</th>
                                <th style={{ padding: "0.75rem" }}>Type</th>
                                <th style={{ padding: "0.75rem" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCategories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            textAlign: "center",
                                            color: "#888",
                                            padding: "2rem",
                                        }}
                                    >
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                            {currentCategories.map(category => (
                                <tr
                                    key={category.id}
                                    style={{
                                        borderBottom: "1px solid #f3f4f6",
                                    }}
                                >
                                    <td style={{ padding: "0.75rem" }}>
                                        {category.id}
                                    </td>
                                    <td style={{ padding: "0.75rem" }}>
                                        {category.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "0.75rem",
                                            fontWeight: 600,
                                            color: getCategoryColor(
                                                category.type
                                            ),
                                        }}
                                    >
                                        {category.type}
                                    </td>
                                    <td style={{ padding: "0.75rem" }}>
                                        <button
                                            className="btn-edit"
                                            style={{
                                                background: "#10b981",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "0.4rem 0.7rem",
                                                marginRight: 8,
                                            }}
                                            onClick={() => openModal(category)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-delete"
                                            style={{
                                                background: "#ef4444",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "0.4rem 0.7rem",
                                            }}
                                            onClick={() =>
                                                handleDelete(category.id)
                                            }
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
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
                                    background:
                                        currentPage === 1 ? "#f3f4f6" : "white",
                                    color: "#222",
                                    cursor:
                                        currentPage === 1
                                            ? "not-allowed"
                                            : "pointer",
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
                                    background:
                                        currentPage === totalPages
                                            ? "#f3f4f6"
                                            : "white",
                                    color: "#222",
                                    cursor:
                                        currentPage === totalPages
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                {">"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal for Add/Edit Category */}
                {showModal && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.18)",
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
                                minWidth: 340,
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
                                {editId ? "Edit Category" : "Add Category"}
                            </h2>
                            <form onSubmit={handleAddOrEditCategory}>
                                <div style={{ marginBottom: 18 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
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
                                <div style={{ marginBottom: 18 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: 6,
                                            color: "#374151",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleFormChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.6rem",
                                            borderRadius: 6,
                                            border: "1px solid #d1d5db",
                                            fontSize: 16,
                                        }}
                                    >
                                        <option value="general">General</option>
                                        <option value="fiction">Fiction</option>
                                        <option value="science">Science</option>
                                        <option value="history">History</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {form.type === "other" && (
                                    <div style={{ marginBottom: 18 }}>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: 6,
                                                color: "#374151",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Custom Type
                                        </label>
                                        <input
                                            type="text"
                                            name="customType"
                                            value={form.customType}
                                            onChange={handleFormChange}
                                            style={{
                                                width: "100%",
                                                padding: "0.6rem",
                                                borderRadius: 6,
                                                border: "1px solid #d1d5db",
                                                fontSize: 16,
                                            }}
                                            placeholder="Enter custom type..."
                                        />
                                    </div>
                                )}
                                {formError && (
                                    <div
                                        style={{
                                            color: "#ef4444",
                                            marginBottom: 10,
                                        }}
                                    >
                                        {formError}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={adding}
                                    style={{
                                        background: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "0.7rem 1.5rem",
                                        fontWeight: 600,
                                        fontSize: 16,
                                        width: "100%",
                                    }}
                                >
                                    {adding
                                        ? editId
                                            ? "Saving..."
                                            : "Adding..."
                                        : editId
                                        ? "Save Changes"
                                        : "Add Category"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default CategoryList
