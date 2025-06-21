import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import Home from "./pages/Home";
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
import OrderDetailsPage from "./pages/OrderDetailsPage";
import BookDetails from "./pages/BookDetails";
import ContactPage from "./pages/ContactPage";
import AdminCategories from './pages/admin/AdminCategories';
import CreateCategory from './pages/admin/CreateCategory';
import EditCategory from './pages/admin/EditCategory';
import AdminLayout from './layouts/AdminLayout';



function App() {
  return (
    <Router>
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/order' element={<OrdersPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/category/:id' element={<CategoryPage />} />
        <Route path='/books' element={<BooksPage />} />
        <Route path='/books/:id' element={<BookDetails />} />
        <Route path='/orders/:id' element={<OrderDetailsPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/rag-chat' element={<RagChat />} />
        <Route path='*' element={<h1 className='text-center mt-5'>404 Not Found</h1>} />
      
         
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<CreateCategory />} />
          <Route path="categories/:id/edit" element={<EditCategory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
