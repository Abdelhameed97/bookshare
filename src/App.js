// App.js
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
import GuestRoute from "./components/GuestRoute/GuestRoute";
import About from "./components/About.jsx/Aboutus";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import BooksPage from "./pages/BooksPage";
import BookDetails from "./pages/BookDetails";
import ContactPage from "./pages/ContactPage";
import Dashboard from "./components/Library/Dashboard";
import EditProfile from "./components/Library/EditProfile";
import AddBookPage from "./components/Library/AddBookPage";
import LibrariesPage from "./components/Library/LibrariesPage";
import LibraryDetails from "./components/Library/LibraryDetails";
import PaymentPage from "./pages/PaymentPage";
import AllOrdersPage from './components/Library/AllOrdersPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/orders' element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetails />} />


        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />


        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/libraries" element={<LibrariesPage />} />
        <Route path="/library/:id" element={<LibraryDetails />} />
        <Route path="/all-orders" element={<AllOrdersPage />} />
        <Route path='*' element={<h1 className='text-center mt-5'>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;