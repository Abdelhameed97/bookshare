// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";

// الصفحات والمكونات
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import RegisterPage from "./pages/form/RegisterPage";
import LoginPage from "./pages/form/LoginPage";
import GuestRoute from "./components/GuestRoute/GuestRoute";
import About from "./components/About.jsx/Aboutus";
import BooksPage from "./pages/BooksPage";
import CategoryPage from "./pages/CategoryPage";
import RagChat from "./pages/RagChat";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import BookDetails from "./pages/BookDetails";
import ContactPage from "./pages/ContactPage";
import Dashboard from "./components/Library/Dashboard";
import EditProfile from "./components/Library/EditProfile";
import AddBookPage from "./components/Library/AddBookPage";
import AdminCategories from "./pages/admin/AdminCategories";
import CreateCategory from "./pages/admin/CreateCategory";
import EditCategory from "./pages/admin/EditCategory";
import AdminLayout from "./layouts/AdminLayout";
import Navbar from "./components/HomePage/Navbar";
import FloatingChatButton from "./components/FloatingChatButton";
import LibrariesPage from "./components/Library/LibrariesPage";
import LibraryDetails from "./components/Library/LibraryDetails";
import PaymentPage from "./pages/PaymentPage";
import AllOrdersPage from "./components/Library/AllOrdersPage";
import useAuth from "./hooks/useAuth";

function RedirectToDashboardOrHome() {
  const { user } = useAuth();
  if (user && user.role === "owner") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Home />;
}

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<RedirectToDashboardOrHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrdersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/rag-chat" element={<RagChat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/libraries" element={<LibrariesPage />} />
        <Route path="/library/:id" element={<LibraryDetails />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/all-orders" element={<AllOrdersPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<CreateCategory />} />
          <Route path="categories/:id/edit" element={<EditCategory />} />
        </Route>

        <Route path="*" element={<h1 className="text-center mt-5">404 Not Found</h1>} />
      </Routes>
      <FloatingChatButton />
    </Router>
  );
}

export default App;
