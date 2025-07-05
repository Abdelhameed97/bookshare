"use client";
import { useState, useEffect } from "react";
import HomePageTitle from "../shared/HomePageTitle";
import "../../style/Homepagestyle.css";
import RehabImage from "../../images/Rehab.Kamal.jpg";
import MarwaImage from "../../images/Marwa.Nasser.jpg";
import AbdelhameedImage from "../../images/Abdelhameed.Mohammed.jpg";
import HarbiImage from "../../images/Harbi.Abdelallah.jpg";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "Code with purpose, design with empathy — full-stack from idea to impact.",
      clientName: "Rehab Kamal",
      clientPosition: "Full Stack Developer",
      clientImage: RehabImage,
    },
    {
      id: 2,
      text: "Craft full-stack solutions with a front-end soul and a back-end brain — clean, smart, and made to last.",
      clientName: "Marwa Nasser",
      clientPosition: "Full Stack Developer",
      clientImage: MarwaImage,
    },
    {
      id: 3,
      text: "Blending form and function — interfaces users love, and backends developers trust.",
      clientName: "Abdelhameed Mohammed",
      clientPosition: "Full Stack Developer",
      clientImage: AbdelhameedImage,
    },
    {
      id: 4,
      text: "Where logic meets design — crafting web apps that think, feel, and perform.",
      clientName: "Harbi Abdelallah",
      clientPosition: "Full Stack Developer",
      clientImage: HarbiImage,
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="testimonials-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <HomePageTitle>BookShare Team</HomePageTitle>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Meet our dedicated team of professionals who make BookShare possible
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="testimonials-slider">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-slide">
                <div className="testimonial-content">
                  <div className="quote-mark">"</div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="client-info">
                    <div className="client-image-container">
                      <img
                        src={testimonial.clientImage || "/placeholder.svg"}
                        alt={testimonial.clientName}
                        className="client-image"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=80&width=80";
                        }}
                      />
                      <div className="image-ring"></div>
                    </div>
                    <div className="client-details">
                      <h4 className="client-name">{testimonial.clientName}</h4>
                      <span className="client-position">
                        {testimonial.clientPosition}
                      </span>
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

      {/* Background Decorations */}
      <div className="bg-decoration decoration-1"></div>
      <div className="bg-decoration decoration-2"></div>
      <div className="bg-decoration decoration-3"></div>
    </section>
  );
};

export default Testimonials;
