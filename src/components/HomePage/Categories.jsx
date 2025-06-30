"use client"
import { Book, Heart, Palette, Clock } from "lucide-react"
import HomePageTitle from "../shared/HomePageTitle"
import "../../style/Homepagestyle.css"
import { useEffect, useState } from "react"

const BookCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    // جلب الكتب لكل كاتيجوري (لعرض preview)
    const [categoryBooks, setCategoryBooks] = useState({})
    useEffect(() => {
        const fetchBooksForCategories = async () => {
            const booksMap = {}
            for (const cat of categories) {
                try {
                    const res = await fetch(
                        `http://localhost:8000/api/categories/${cat.id}`
                    )
                    if (res.ok) {
                        const data = await res.json()
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
            setCategoryBooks(booksMap)
        }
        if (categories.length > 0) fetchBooksForCategories()
    }, [categories])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8000/api/categories"
                )
                if (!response.ok) throw new Error("Failed to fetch categories")
                const data = await response.json()
                setCategories(data.categories)
            } catch (error) {
                console.error("Error fetching categories:", error)
                setCategories(getDefaultCategories())
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
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

    const getDefaultCategories = () => [
        {
            id: 1,
            name: "Children's Books",
            description:
                "Discover magical worlds and adventures that spark imagination and foster a lifelong love of reading in young minds.",
            color_class: "blue",
            icon: "Book",
        },
        {
            id: 2,
            name: "Romance",
            description:
                "Explore passionate love stories and heartwarming tales that celebrate the beauty of human connection and emotion.",
            color_class: "pink",
            icon: "Heart",
        },
        {
            id: 3,
            name: "Art & Architecture",
            description:
                "Immerse yourself in visual masterpieces and architectural wonders that showcase human creativity and design excellence.",
            color_class: "purple",
            icon: "Palette",
        },
        {
            id: 4,
            name: "History",
            description:
                "Journey through time and uncover fascinating stories of civilizations, cultures, and events that shaped our world.",
            color_class: "amber",
            icon: "Clock",
        },
    ]

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
        <section className="book-categories-section">
            <div className="book-categories-container">
                <div className="section-header">
                    <HomePageTitle>Explore Our Categories</HomePageTitle>
                    <p className="section-description">
                        Discover your next favorite read across our carefully
                        curated collection of genres
                    </p>
                    <div className="section-divider"></div>
                </div>
                <div className="categories-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category, idx) => {
                        const IconComponent = getIconComponent(category.icon)
                        const books = categoryBooks[category.id] || []
                        // لا حاجة للون ثابت، الكارت سيأخذ لونه من CSS حسب الثيم
                        return (
                            <div
                                key={category.id}
                                className={`category-card hover:shadow-lg transition-shadow duration-300`}
                                style={{
                                    borderRadius: 16,
                                    overflow: "hidden",
                                }}
                            >
                                <div className="card-overlay"></div>
                                <div className="card-content p-6">
                                    <div className="icon-container mb-4">
                                        <IconComponent className="category-icon w-12 h-12" />
                                    </div>
                                    <h3 className="category-title text-xl font-bold mb-2">
                                        {category.name}
                                    </h3>
                                    <p className="category-description mb-4">
                                        {category.description}
                                    </p>
                                    <div className="explore-link mb-2">
                                        <span className="explore-text flex items-center text-primary font-medium">
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
                                        </span>
                                    </div>
                                    {books.length > 0 && (
                                        <div className="d-flex gap-2 mt-2">
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
                                <div className="decorative-circle-1"></div>
                                <div className="decorative-circle-2"></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default BookCategories
