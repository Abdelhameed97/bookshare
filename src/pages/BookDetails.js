import React from 'react';
import BookDetails from '../components/BooksPage/BookDetails';
import Navbar from "../components/HomePage/Navbar.jsx";


const BooksPage = () => {
  return (
    <div>
        <Navbar />
      <BookDetails />
    </div>
  );
};

export default BooksPage; 