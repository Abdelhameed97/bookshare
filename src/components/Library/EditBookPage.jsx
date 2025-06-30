import React, { useState, useEffect, useMemo } from "react"
import { Save, ArrowLeft, AlertCircle } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import apiService from "../../services/api"
import Swal from "sweetalert2"
import Navbar from "../HomePage/Navbar"
import "./EditBookPage.css"

const EditBookPage = () => {
    const { id } = useParams()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        author: "",
        genre: "",
        educational_level: "",
        condition: "new",
        price: "",
        rental_price: "",
        category_id: "",
        status: "available",
        quantity: 1,
        images: [], // new images
        existingImages: [], // old images
    })
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [fetching, setFetching] = useState(true)

    const navigate = useNavigate()
    const currentUser = useMemo(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            try {
                return JSON.parse(storedUser)
            } catch {
                return null
            }
        }
        return null
    }, [])

    useEffect(() => {
        if (!currentUser || currentUser.role !== "owner") {
            navigate("/login")
            return
        }
        fetchCategories()
        fetchBook()
        // eslint-disable-next-line
    }, [currentUser, id])

    const fetchCategories = async () => {
        try {
            const response = await apiService.get("/categories")
            const categoriesData =
                response.data?.categories ||
                response.data?.data ||
                response.data ||
                []
            setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        } catch (error) {
            setCategories([])
        }
    }

    const fetchBook = async () => {
        setFetching(true)
        try {
            const response = await apiService.get(`/books/${id}`)
            const book =
                response.data.data || response.data.book || response.data
            setFormData(prev => ({
                ...prev,
                ...book,
                category_id: book.category_id || "",
                images: [], // for new uploads
                existingImages: book.images || [], // old images
            }))
        } catch (error) {
            Swal.fire("Error", "Failed to fetch book data", "error")
            navigate("/dashboard")
        } finally {
            setFetching(false)
        }
    }

    const handleInputChange = e => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    }

    const handleImageChange = e => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter(file => {
            const isValidType = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
            ].includes(file.type)
            const isValidSize = file.size <= 2 * 1024 * 1024
            if (!isValidType)
                Swal.fire(
                    "Invalid File",
                    `${file.name} is not a valid image file.`,
                    "error"
                )
            if (!isValidSize)
                Swal.fire(
                    "File Too Large",
                    `${file.name} is too large. Max 2MB.`,
                    "error"
                )
            return isValidType && isValidSize
        })
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...validFiles],
        }))
    }

    const removeImage = (index, type = "new") => {
        if (type === "new") {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index),
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                existingImages: prev.existingImages.filter(
                    (_, i) => i !== index
                ),
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.title.trim()) newErrors.title = "Title is required"
        if (!formData.author.trim()) newErrors.author = "Author is required"
        if (!formData.description.trim())
            newErrors.description = "Description is required"
        if (!formData.price || parseFloat(formData.price) <= 0)
            newErrors.price = "Valid price is required"
        if (!formData.category_id)
            newErrors.category_id = "Category is required"
        if (!formData.quantity || parseInt(formData.quantity) <= 0)
            newErrors.quantity = "Valid quantity is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!validateForm()) return
        try {
            setLoading(true)
            const formDataToSend = new FormData()
            formDataToSend.append("title", formData.title)
            formDataToSend.append("description", formData.description)
            formDataToSend.append("author", formData.author)
            formDataToSend.append("genre", formData.genre)
            formDataToSend.append(
                "educational_level",
                formData.educational_level
            )
            formDataToSend.append("condition", formData.condition)
            formDataToSend.append("price", formData.price)
            formDataToSend.append("rental_price", formData.rental_price || "")
            formDataToSend.append("category_id", formData.category_id)
            formDataToSend.append("status", formData.status)
            formDataToSend.append("quantity", formData.quantity)
            formDataToSend.append("user_id", currentUser.id)
            // Existing images to keep
            formDataToSend.append(
                "existingImages",
                JSON.stringify(formData.existingImages)
            )
            // New images
            formData.images.forEach((image, index) => {
                formDataToSend.append(`images[${index}]`, image)
            })
            formDataToSend.append("_method", "PUT") // Laravel method spoofing
            await apiService.post(`/books/${id}`, formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            await Swal.fire({
                icon: "success",
                title: "Book Updated!",
                text: `${formData.title} has been updated.`,
                timer: 2000,
            })
            navigate("/dashboard")
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Failed to update book"
            Swal.fire("Error", errorMsg, "error")
        } finally {
            setLoading(false)
        }
    }

    if (fetching)
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                Loading book data...
            </div>
        )

    return (
        <>
            <Navbar />
            <div className="edit-book-container">
                <div className="edit-book-card">
                    <div className="edit-book-header">
                        <Link to="/dashboard" className="edit-book-back-link">
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </Link>
                        <h1>Edit Book</h1>
                        <p>Edit your book details</p>
                    </div>
                    <form onSubmit={handleSubmit} className="edit-book-form">
                        <div className="edit-book-row">
                            <div className="edit-book-col">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={errors.title ? "error" : ""}
                                />
                                {errors.title && (
                                    <div className="edit-book-error-message">
                                        <AlertCircle size={16} /> {errors.title}
                                    </div>
                                )}
                            </div>
                            <div className="edit-book-col">
                                <label>Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    className={errors.author ? "error" : ""}
                                />
                                {errors.author && (
                                    <div className="edit-book-error-message">
                                        <AlertCircle size={16} />{" "}
                                        {errors.author}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="edit-book-row">
                            <div className="edit-book-col">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={
                                        errors.description ? "error" : ""
                                    }
                                    rows={2}
                                />
                                {errors.description && (
                                    <div className="edit-book-error-message">
                                        <AlertCircle size={16} />{" "}
                                        {errors.description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="edit-book-row">
                            <div className="edit-book-col">
                                <label>Genre</label>
                                <input
                                    type="text"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="edit-book-col">
                                <label>Educational Level</label>
                                <input
                                    type="text"
                                    name="educational_level"
                                    value={formData.educational_level}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="edit-book-col">
                                <label>Condition</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                >
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                </select>
                            </div>
                        </div>
                        <div className="edit-book-row">
                            <div className="edit-book-col">
                                <label>Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={errors.price ? "error" : ""}
                                />
                                {errors.price && (
                                    <div className="edit-book-error-message">
                                        <AlertCircle size={16} /> {errors.price}
                                    </div>
                                )}
                            </div>
                            <div className="edit-book-col">
                                <label>Rental Price</label>
                                <input
                                    type="number"
                                    name="rental_price"
                                    value={formData.rental_price}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="edit-book-col">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className={errors.quantity ? "error" : ""}
                                />
                                {errors.quantity && (
                                    <div className="edit-book-error-message">
                                        <AlertCircle size={16} />{" "}
                                        {errors.quantity}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="edit-book-row">
                            <div className="edit-book-col">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="available">Available</option>
                                    <option value="rented">Rented</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                            <div className="edit-book-col">
                                <label>Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    className={
                                        errors.category_id ? "error" : ""
                                    }
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <div className="edit-book-error-message">
                                        <AlertCircle size={16} />{" "}
                                        {errors.category_id}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="edit-book-row">
                            <div className="edit-book-col edit-book-image-preview-area">
                                <label>Images</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                <div className="edit-book-image-preview-list">
                                    {formData.existingImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="edit-book-image-preview"
                                        >
                                            <img
                                                src={
                                                    img.startsWith("http")
                                                        ? img
                                                        : `http://localhost:8000/storage/${img}`
                                                }
                                                alt="book"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(idx, "existing")
                                                }
                                                className="edit-book-remove-image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="edit-book-image-preview"
                                        >
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt="book"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(idx, "new")
                                                }
                                                className="edit-book-remove-image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="edit-book-form-actions">
                            <button
                                type="submit"
                                className="edit-book-btn-primary"
                                disabled={loading}
                            >
                                <Save size={18} />
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                            <Link
                                to="/dashboard"
                                className="edit-book-btn-secondary"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditBookPage
