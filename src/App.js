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
import OrderDetailsPage from "./pages/OrderDetailsPage";
import BooksPage from "./pages/BooksPage";
import BookDetails from "./pages/BookDetails";
import ContactPage from "./pages/ContactPage";
import Dashboard from "./components/Library/Dashboard";
import EditProfile from "./components/Library/EditProfile";


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/order' element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path='*' element={<h1 className='text-center mt-5'>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
