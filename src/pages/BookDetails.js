import React from 'react';
import BookDetails from '../components/BooksPage/BookDetails';
import Navbar from "../components/HomePage/Navbar.jsx";
import Footer from "../components/HomePage/Footer.jsx";


const BooksPage = () => {
    return (
        <div>
            <Navbar />
            <BookDetails />
            <Footer />
        </div>
    );
};

export default BooksPage; 