"use client"
import { Book, Heart, Palette, Clock } from "lucide-react"
import HomePageTitle from "../components/shared/HomePageTitle"
import "../style/Homepagestyle.css"
import { useEffect, useState } from "react"
import api from "../api/auth"
import { useNavigate } from "react-router-dom"
import Navbar from '../components/HomePage/Navbar';
import Footer from '../components/HomePage/Footer';


const BookCategories = () => {
    const [categories, setCategories] = useState([])
    const [categoryBooks, setCategoryBooks] = useState({})
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const categoryColors = [
        "#A7C7E7",
        "#C8A2C8",
        "#89CFF0",
        "#B19CD9",
        "#ADD8E6",
    ]

    const getIconComponent = (iconName) => {
        const icons = { Book, Heart, Palette, Clock }
        return icons[iconName] || Book
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories")
                setCategories(response.data.categories || [])
            } catch (error) {
                console.error("Error fetching categories:", error)
                setCategories([])
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchBooksForCategories = async () => {
            const booksMap = {}
            for (const cat of categories) {
                try {
                    const res = await api.get(`/categories/${cat.id}`)
                    booksMap[cat.id] = res.data.books
                        ? res.data.books.slice(0, 3)
                        : []
                } catch {
                    booksMap[cat.id] = []
                }
            }
            setCategoryBooks(booksMap)
        }

        if (categories.length > 0) fetchBooksForCategories()
    }, [categories])

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <Navbar />
            
            <section className="book-categories-section">
                <div className="book-categories-container">
                    <div className="section-header">
                        <HomePageTitle>Explore Our Categories</HomePageTitle>
                        <p className="section-description">
                            Discover your next favorite read across our carefully
                            curated collection of genres
                        </p>
                        <div className="section-divider"></div>
                        <button
                            className="view-all-categories-btn"
                            style={{
                                background:
                                    "linear-gradient(hsl(216, 98.3%, 45.7%))",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 20px",
                                fontWeight: 600,
                                marginTop: 12,
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/categories")}
                        >
                            View All Categories
                        </button>
                    </div>

                    <div className="categories-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                        {categories.map((category, idx) => {
                            const IconComponent = getIconComponent(category.icon)
                            const books = categoryBooks[category.id] || []

                            return (
                                <div
                                    key={category.id}
                                    className="category-card hover:shadow-lg transition-shadow duration-300 relative"
                                    style={{
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        background:
                                            categoryColors[
                                                idx % categoryColors.length
                                            ],
                                    }}
                                >
                                    <div className="card-overlay"></div>
                                    <div className="card-content p-6 relative z-10">
                                        <div className="icon-container mb-4">
                                            <IconComponent className="category-icon w-12 h-12" />
                                        </div>
                                        <h3 className="category-title text-xl font-bold mb-2">
                                            {category.name}
                                        </h3>
                                        <p className="category-description mb-4">
                                            {category.description}
                                        </p>

                                        {/* زر Explore Collection */}
                                        <div className="explore-link mb-4">
                                            <button
                                                className="explore-text flex items-center text-primary font-medium"
                                                onClick={() =>
                                                    navigate(
                                                        `/categories/${category.id}`
                                                    )
                                                }
                                            >
                                                Explore Collection
                                                <svg
                                                    className="explore-arrow ml-2 w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* صور الكتب */}
                                        {books.length > 0 && (
                                            <div className="d-flex gap-2 mt-2">
                                                {books.map((book) => (
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
                                                                        : `${process.env.REACT_APP_API_URL}/storage/${book.images[0]}`
                                                                    : "/placeholder.svg"
                                                            }
                                                            alt={book.title}
                                                            className="img-fluid rounded mb-1"
                                                            style={{
                                                                height: 60,
                                                                objectFit: "cover",
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

                                    {/* الدوائر التزيينية */}
                                    <div className="decorative-circle-1"></div>
                                    <div className="decorative-circle-2"></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

export default BookCategories