import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "../style/categories.css";
import { BookOpen } from "react-feather";
import Navbar from "../components/HomePage/Navbar";  // Corrected import path

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        if (Array.isArray(response.data?.categories)) {
          setCategories(response.data.categories);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#199A8E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-20">
        <h1 className="text-4xl font-bold text-center mb-12">All Categories</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link 
              to={`/categories/${category.id}`} 
              key={category.id}
              className="category-card hover:shadow-lg transition-shadow duration-300 bg-white rounded-lg overflow-hidden"
            >
              <div className="p-6 text-center">
                <BookOpen className="text-gray-400 mx-auto" size={48} />
              </div>
              <div className="category-info p-4 border-t">
                <h3 className="category-name text-xl font-semibold mb-1">{category.name}</h3>
                <p className="category-type text-sm text-gray-600">
                  {category.type || 'General Category'}
                </p>
                <p className="text-blue-600 mt-2">View books →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;