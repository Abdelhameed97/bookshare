import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import BookCard from "../components/BookCard";
import Navbar from "../components/HomePage/Navbar";
import Footer from "../components/HomePage/Footer";

const HomeBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/books");
      setBooks(res.data.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="text-center mb-4">All Books</h2>
        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : (
          <div className="row">
            {books.map((book) => (
              <div className="col-md-4 mb-4" key={book.id}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default HomeBooks;

