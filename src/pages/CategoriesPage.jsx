"use client"
import { Book, Heart, Palette, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/HomePage/Navbar"
import "../style/Categories.css"
import axios from "axios"
import BookCard from "../components/shared/BookCard"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"

const CategoriesPage = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [categoriesPerPage] = useState(6)
    // إضافة state للباجنيشن الخاص بالكتب داخل كل كاتوجري
    const [booksPage, setBooksPage] = useState({})
    const booksPerCategory = 3

    // جلب الكتب لكل كاتيجوري (لعرض preview)
    const [categoriesBooks, setCategoriesBooks] = useState({})
    useEffect(() => {
        const fetchBooksForCategories = async () => {
            const booksMap = {}
            for (const cat of categories) {
                try {
                    const res = await axios.get(
                        `http://localhost:8000/api/categories/${cat.id}`
                    )
                    if (res.status === 200) {
                        const data = res.data
                        booksMap[cat.id] = data.books
                            ? data.books.slice(0, 3)
                            : []
                    } else {
                        booksMap[cat.id] = []
                    }
                } catch {
                    booksMap[cat.id] = []
                }
            }
            setCategoriesBooks(booksMap)
        }
        if (categories.length > 0) fetchBooksForCategories()
    }, [categories])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/categories"
                )
                if (response.status !== 200)
                    throw new Error("Failed to fetch categories")
                const data = response.data
                setCategories(data.categories || data)
            } catch (error) {
                console.error("Error fetching categories:", error)
                setError(error.message)
                setCategories(getDefaultCategories())
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    // تحديث تلقائي كل دقيقة
    useEffect(() => {
        const interval = setInterval(() => {
            // إعادة جلب التصنيفات
            axios
                .get("http://localhost:8000/api/categories")
                .then(response => {
                    if (response.status === 200) {
                        const data = response.data
                        setCategories(data.categories || data)
                    }
                })
                .catch(() => {})
        }, 60000) // كل 60 ثانية
        return () => clearInterval(interval)
    }, [])

    const getIconComponent = iconName => {
        const icons = {
            Book: Book,
            Heart: Heart,
            Palette: Palette,
            Clock: Clock,
        }
        return icons[iconName] || Book
    }

    // دالة لإرجاع لون بنفسجي موحد لكل الكاتيجوري
    const getCategoryColor = category => {
        return "#6f42c1" // بنفسجي موحد
    }

    const getDefaultCategories = () => [
        {
            id: 1,
            name: "Children's Books",
            type: "general",
            color_class: "blue",
            icon: "Book",
            image: "/images/children-books.jpg",
        },
        {
            id: 2,
            name: "علوم",
            type: "كتب  علوم خاصه بمرحة ابتدائي",
            color_class: "pink",
            icon: "Heart",
            image: "/images/romance-books.jpg",
        },
        {
            id: 3,
            name: "Art & Architecture",
            type: "fiction",
            color_class: "purple",
            icon: "Palette",
            image: "/images/art-books.jpg",
        },
        {
            id: 4,
            name: "History",
            type: "history",
            color_class: "amber",
            icon: "Clock",
            image: "/images/history-books.jpg",
        },
    ]

    const filteredCategories = categories.filter(categories =>
        categories.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const indexOfLastCategories = currentPage * categoriesPerPage
    const indexOfFirstCategories = indexOfLastCategories - categoriesPerPage
    const currentCategories = filteredCategories.slice(
        indexOfFirstCategories,
        indexOfLastCategories
    )

    const paginate = pageNumber => setCurrentPage(pageNumber)

    // جلب بيانات المستخدم الحالي
    const currentUser = JSON.parse(localStorage.getItem("user"))
    const userId = currentUser?.id
    const { cartItems, fetchCartItems, addToCart } = useCart(userId)
    const { wishlistItems, fetchWishlist, addToWishlist, removeItem } =
        useWishlist(userId)

    // دوال المساعدة
    const isInCart = bookId => cartItems.some(item => item.book_id === bookId)
    const isInWishlist = bookId =>
        wishlistItems.some(item => item.book_id === bookId)

    const handleAddToWishlist = async book => {
        try {
            if (isInWishlist(book.id)) {
                const itemToRemove = wishlistItems.find(
                    item => item.book_id === book.id
                )
                await removeItem(itemToRemove.id)
            } else {
                await addToWishlist(book.id)
            }
            await fetchWishlist()
        } catch {}
    }
    const handleAddToCart = async book => {
        try {
            if (!isInCart(book.id)) {
                await addToCart(book.id)
                await fetchCartItems()
            }
        } catch {}
    }
    const handleQuickView = book => {
        window.location.href = `/books/${book.id}`
    }
    // دالة لتغيير صفحة الباجنيشن الخاصة بالكتب
    const handleBooksPageChange = (categoryId, page) => {
        setBooksPage(prev => ({ ...prev, [categoryId]: page }))
    }

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">⚠️ {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="categories-page">
            <Navbar />
            <div className="container">
                {/* تم حذف العناوين والوصف بناءً على طلبك */}
                <div className="categories-grid row g-4">
                    {currentCategories.length === 0 ||
                    currentCategories.every(
                        cat => (categoriesBooks[cat.id] || []).length === 0
                    ) ? (
                        <div
                            className="error-container"
                            style={{ textAlign: "center", padding: "60px 0" }}
                        >
                            <h2
                                style={{
                                    color: "#c00",
                                    fontWeight: "bold",
                                    marginBottom: 16,
                                }}
                            >
                                Not Found
                            </h2>
                            <p style={{ color: "#555" }}>
                                لا توجد كتب متاحة في أي كاتوجري حالياً.
                            </p>
                        </div>
                    ) : (
                        currentCategories.map((categories, idx) => {
                            const IconComponent = getIconComponent(
                                categories.icon
                            )
                            // ترتيب الكتب من الأحدث للأقدم
                            const allBooks = (
                                categoriesBooks[categories.id] || []
                            ).sort(
                                (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at)
                            )
                            const currentBooksPage =
                                booksPage[categories.id] || 1
                            const indexOfLastBook =
                                currentBooksPage * booksPerCategory
                            const indexOfFirstBook =
                                indexOfLastBook - booksPerCategory
                            const books = allBooks.slice(
                                indexOfFirstBook,
                                indexOfLastBook
                            )
                            const totalBooksPages = Math.ceil(
                                allBooks.length / booksPerCategory
                            )
                            // نفس ألوان الهوم بيج
                            const categoryColors = [
                                "#e74c3c", // أحمر
                                "#fd7e14", // برتقالي
                                "#6f42c1", // بنفسجي
                                "#20c997", // أخضر تركواز
                                "#0d6efd", // أزرق
                                "#ffc107", // أصفر
                                "#198754", // أخضر
                            ]
                            const bgColor =
                                categoryColors[idx % categoryColors.length]
                            return (
                                <div
                                    key={categories.id}
                                    className="category-card hover:shadow-lg transition-shadow duration-300 col-md-6 col-lg-4 col-xl-3 mb-4"
                                    style={{
                                        background: bgColor,
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        minWidth: 260,
                                        maxWidth: 340,
                                        minHeight: 340,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        margin: "0 auto 32px auto",
                                    }}
                                >
                                    <div className="card-overlay"></div>
                                    <div className="card-content p-4">
                                        <div className="icon-container mb-3">
                                            <IconComponent className="category-icon w-12 h-12" />
                                        </div>
                                        <h3
                                            className="category-title text-xl font-bold mb-2"
                                            style={{ color: "#fff" }}
                                        >
                                            {categories.name}
                                        </h3>
                                        {/* حذف الوصف/الديسكريبشن والاكتفاء بعدد الكتب */}
                                        <div className="mb-2">
                                            <span className="badge bg-light text-dark me-2">
                                                {books.length} كتاب
                                            </span>
                                            <Link
                                                to={`/categories/${categories.id}`}
                                                className="btn btn-sm btn-outline-light ms-2"
                                            >
                                                عرض كل الكتب
                                            </Link>
                                        </div>
                                        {/* عرض جميع الكتب الخاصة بالكاتيجوري */}
                                        {books.length > 0 && (
                                            <div className="d-flex gap-2 mt-2 justify-content-center">
                                                {books.map(book => (
                                                    <div
                                                        key={book.id}
                                                        style={{
                                                            width: 60,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                book.images?.[0]
                                                                    ? book.images[0].startsWith(
                                                                          "http"
                                                                      )
                                                                        ? book
                                                                              .images[0]
                                                                        : `http://localhost:8000/storage/${book.images[0]}`
                                                                    : "/placeholder.svg"
                                                            }
                                                            alt={book.title}
                                                            className="img-fluid rounded mb-1"
                                                            style={{
                                                                height: 60,
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                        <div
                                                            className="small text-truncate text-white"
                                                            title={book.title}
                                                        >
                                                            {book.title}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="decorative-circle-1"></div>
                                    <div className="decorative-circle-2"></div>
                                </div>
                            )
                        })
                    )}
                </div>
                {filteredCategories.length > categoriesPerPage && (
                    <div className="pagination d-flex justify-content-center mt-4 gap-2">
                        {Array.from({
                            length: Math.ceil(
                                filteredCategories.length / categoriesPerPage
                            ),
                        }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`page-button btn btn-sm ${
                                    currentPage === index + 1
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`}
                                style={{ minWidth: 36 }}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoriesPage
