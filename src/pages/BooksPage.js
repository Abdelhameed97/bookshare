import React, { useEffect } from 'react';
import BooksList from '../components/BooksPage/BooksList';
import Navbar from "../components/HomePage/Navbar.jsx";
import Footer from './../components/HomePage/Footer';

const BooksPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Navbar />
      <BooksList />
      <Footer />
    </div>
  );
};

export default BooksPage; 