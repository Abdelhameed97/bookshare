import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BookCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("❌ Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="ftco-section bg-light">
      <div className="container">
        <div className="row justify-content-center mb-5 pb-3">
          <div className="col-md-7 heading-section text-center">
            <h2 className="mb-4">Browse Categories</h2>
            <p>Discover books from various categories that suit your taste</p>
          </div>
        </div>
        <div className="row">
          {Array.isArray(categories) &&
            categories.map((category) => (
              <div className="col-md-3" key={category.id}>
                <Link
                  to={`/category/${category.id}`}
                  className="ftco-category text-center"
                >
                  <span className="icon d-flex justify-content-center align-items-center">
                    <span className="flaticon-book"></span>
                  </span>
                  <h4>{category.name}</h4>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default BookCategories;