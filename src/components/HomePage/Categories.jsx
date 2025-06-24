import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Book, Heart, Palette, Clock } from "lucide-react" // استيراد أيقونات بديلة لو ماكانش في icon مخصص
import HomePageTitle from "../shared/HomePageTitle"
import HomePageButton from "../shared/HomePageButton"
import "../../style/Homepagestyle.css"

const BookCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/categories")
                if (!res.ok) throw new Error("Failed to fetch categories")
                const data = await res.json()
                setCategories(data.categories || [])
            } catch (error) {
                console.error("❌ Error loading categories:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

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
                {/* Section Header */}
                <div className="section-header">
                    <HomePageTitle>Explore Our Categories</HomePageTitle>
                    <p
                        className="section-description"
                        style={{ color: "#666666" }}
                    >
                        Discover your next favorite read across our carefully
                        curated collection of genres
                    </p>
                    <div className="section-divider"></div>
                </div>

                {/* Categories Grid */}
                <div className="categories-grid">
                    {categories.map((category, index) => {
                        // Use Lucide icons as fallback if no icon provided
                        const IconComponent =
                            category.icon === "Book"
                                ? Book
                                : category.icon === "Heart"
                                ? Heart
                                : category.icon === "Palette"
                                ? Palette
                                : category.icon === "Clock"
                                ? Clock
                                : Book

                        return (
                            <Link
                                to={`/category/${category.id}`}
                                key={index}
                                className={`category-card ${category.colorClass}`}
                            >
                                {/* Background Overlay */}
                                <div className="card-overlay"></div>

                                {/* Content */}
                                <div className="card-content">
                                    <div className="icon-container">
                                        <IconComponent className="category-icon" />
                                    </div>
                                    <h3 className="category-title">
                                        {category.name}
                                    </h3>
                                    <div className="category-divider"></div>
                                    <p className="category-description">
                                        {category.description}
                                    </p>
                                    <div className="explore-link">
                                        <span
                                            className="explore-text"
                                            style={{ color: "#666666" }}
                                        >
                                            Explore Collection
                                            <svg
                                                className="explore-arrow"
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
                                </div>

                                {/* Decorative Circles */}
                                <div className="decorative-circle-1"></div>
                                <div className="decorative-circle-2"></div>
                            </Link>
                        )
                    })}
                </div>

                {/* Call to Action */}
                <div className="cta-section text-center mt-8">
                    <Link to="/categories">
                        <HomePageButton>
                            View All Categories
                            <svg
                                className="button-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </HomePageButton>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default BookCategories
