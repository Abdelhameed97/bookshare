// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import RegisterPage from "./pages/form/RegisterPage";
import LoginPage from "./pages/form/LoginPage";
import About from "./components/About.jsx/Aboutus";
import BooksPage from "./pages/BooksPage";
import CategoryPage from "./pages/CategoryPage";
import Navbar from "./components/HomePage/Navbar.jsx";
import RagChat from "./pages/RagChat";



function App() {
  return (
    <Router>

      <Navbar />
        {/* Auth context provider wraps the routes to provide auth state */}
        
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/order' element={<OrdersPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='*' element={<h1 className='text-center mt-5'>404 Not Found</h1>} />
       
        <Route path="/category/:id" element={<CategoryPage />} />

        {/* Add more routes as needed */}
        <Route path="/books" element={<BooksPage />} />
        <Route path="/rag-chat" element={<RagChat />} />


      </Routes>
    </Router>   

  );
}

export default App;
