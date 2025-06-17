

"use client"
import { useState, useEffect } from "react"
import '../../style/Homepagestyle.css'; 
import clientImage from '../../images/img-client2.jpg';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      text: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      clientName: "Rehab Kamal",
      clientPosition: "Marketing Manager",
      clientImage: clientImage, 
    },
    {
      id: 2,
      text: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      clientName: "Marwa Nasser",
      clientPosition: "Editorial Director",
      clientImage: clientImage, 
    },
    {
      id: 3,
      text: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      clientName: "Abdelhameed Mohammed",
      clientPosition: "Creative Director",
      clientImage: clientImage,
    },
    {
      id: 4,
      text: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
      clientName: "Harbi Abdelallah",
      clientPosition: "Content Strategist",
      clientImage: clientImage, 
    },
  ]

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [testimonials.length])

  const goToSlide = (index) => { 
    setCurrentIndex(index)
  }

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">BookShare Team</h2>
        </div>

        {/* Testimonials Slider */}
        <div className="testimonials-slider">
          <div className="testimonials-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-slide">
                <div className="testimonial-content">
                  <div className="quote-mark">"</div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="client-info">
                    <img
                      src={testimonial.clientImage || "/placeholder.svg"}
                      alt={testimonial.clientName}
                      className="client-image"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                    <div className="client-details">
                      <h4 className="client-name">{testimonial.clientName}</h4>
                      <span className="client-position">{testimonial.clientPosition}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="pagination-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials