"use client"
import { Book, Heart, Palette, Clock } from "lucide-react"
import '../../style/Homepagestyle.css'; // Adjust the path as necessary


const BookCategories = () => {
  const categories = [
    {
      title: "Children's Books",
      description:
        "Discover magical worlds and adventures that spark imagination and foster a lifelong love of reading in young minds.",
      icon: Book,
      colorClass: "blue",
    },
    {
      title: "Romance",
      description:
        "Explore passionate love stories and heartwarming tales that celebrate the beauty of human connection and emotion.",
      icon: Heart,
      colorClass: "pink",
    },
    {
      title: "Art & Architecture",
      description:
        "Immerse yourself in visual masterpieces and architectural wonders that showcase human creativity and design excellence.",
      icon: Palette,
      colorClass: "purple",
    },
    {
      title: "History",
      description:
        "Journey through time and uncover fascinating stories of civilizations, cultures, and events that shaped our world.",
      icon: Clock,
      colorClass: "amber",
    },
  ]

  return (
    <section className="book-categories-section">
      <div className="book-categories-container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Explore Our Categories</h2>
          <p className="section-description" style={{ color: "#666666" }}>
            Discover your next favorite read across our carefully curated collection of genres
          </p>
          <div className="section-divider"></div>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <div key={index} className={`category-card ${category.colorClass}`}>
                {/* Background Gradient Overlay */}
                <div className="card-overlay"></div>

                {/* Card Content */}
                <div className="card-content">
                  {/* Icon Container */}
                  <div className="icon-container">
                    <IconComponent className="category-icon" />
                  </div>

                  {/* Title */}
                  <h3 className="category-title">{category.title}</h3>

                  {/* Divider */}
                  <div className="category-divider"></div>

                  {/* Description */}
                  <p className="category-description">{category.description}</p>

                  {/* Hover Arrow */}
                  <div className="explore-link">
                    <span className="explore-text" style={{ color: "#666666" }}>
                      Explore Collection
                      <svg className="explore-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="decorative-circle-1"></div>
                <div className="decorative-circle-2"></div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <button className="cta-button">
            View All Categories
            <svg className="cta-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default BookCategories
