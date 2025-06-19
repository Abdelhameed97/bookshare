import React from 'react';
import BooksList from '../components/BooksPage/BooksList';
import Navbar from "../components/HomePage/Navbar.jsx";
import Footer from "../components/HomePage/Footer.jsx";
const BooksPage = () => {
  return (
    <div>
        <Navbar />
      <BooksList />
      <Footer />
    </div>
  );
};

export default BooksPage; 