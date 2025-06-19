import React from 'react';
import BooksList from '../components/BooksPage/BooksList';
import Navbar from "../components/HomePage/Navbar.jsx";

const BooksPage = () => {
  return (
    <div>
        <Navbar />
      <BooksList />
    </div>
  );
};

export default BooksPage; 