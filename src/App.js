// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import RegisterPage from "./pages/form/RegisterPage";
import LoginPage from "./pages/form/LoginPage";
import GuestRoute from "./components/GuestRoute/GuestRoute";
import GetStartedPage from "./pages/form/GetStartedPage";
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
import PaymentsPage from "./pages/PaymentsPage";
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import AllOrdersPage from './components/Library/AllOrdersPage';

import useAuth from "./hooks/useAuth";
import NotFound from "./pages/NotFound";
import SocialCallback from "./pages/SocialCallback";
import CategoryPage from "./pages/CategoryPage";
 import RagChat from "./pages/RagChat";
import FloatingChatButton from "./components/FloatingChatButton";
import './App.css';

import AdminDashboard from './components/Admin/Dashboard';
import CategoryList from './components/Admin/CategoryList';
import UserList from './components/Admin/UserList';
import BookList from './components/Admin/BookList';
import AdminOrders from './components/Admin/AdminOrders';
import AdminRoute from './components/GuestRoute/AdminRoute';
import OwnerRoute from './components/GuestRoute/OwnerRoute';
import EditBookPage from './components/Library/EditBookPage';

// import Users from './components/admin/Users';
// import Categories from './components/admin/Categories';

function RedirectToDashboardOrHome() {
  const { user } = useAuth();
  if (user && user.role === "owner") {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } 
  return <Home />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<RedirectToDashboardOrHome />} />
        <Route path='/about' element={<About />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/orders' element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payment/:orderId" element={<PaymentDetailsPage />} />
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
        <Route 
          path="/get-started" 
          element={
            <GuestRoute>
              <GetStartedPage />
            </GuestRoute>
          }
        />
        <Route path="/social-callback" element={<SocialCallback />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<OwnerRoute><Dashboard /></OwnerRoute>} />
        <Route path="/edit-profile" element={<OwnerRoute><EditProfile /></OwnerRoute>} />
        <Route path="/add-book" element={<OwnerRoute><AddBookPage /></OwnerRoute>} />
        <Route path="/libraries" element={<OwnerRoute><LibrariesPage /></OwnerRoute>} />
        <Route path="/library/:id" element={<OwnerRoute><LibraryDetails /></OwnerRoute>} />
        <Route path="/all-orders" element={<OwnerRoute><AllOrdersPage /></OwnerRoute>} />
        <Route path="/edit-book/:id" element={<OwnerRoute><EditBookPage /></OwnerRoute>} />
        

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><CategoryList /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserList /></AdminRoute>} />
        <Route path="/admin/books" element={<AdminRoute><BookList /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

        <Route path='*' element={<NotFound />} />

      </Routes>
       <FloatingChatButton />

    </Router>
  );
}

export default App;