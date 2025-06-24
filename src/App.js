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
import GetStartedPage from "./pages/form/GetStartedPage";
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
import PaymentsPage from "./pages/PaymentsPage";
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import AllOrdersPage from './components/Library/AllOrdersPage';
import useAuth from "./hooks/useAuth";
import NotFound from "./pages/NotFound";
import SocialCallback from "./pages/SocialCallback";

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

        {/* صفحات عامة */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/rag-chat" element={<RagChat />} />

        {/* الكتب والتصنيفات */}
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/category/:id" element={<CategoryPage />} />

        {/* الطلبات */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/all-orders" element={<AllOrdersPage />} />

        {/* الدفع */}
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payment/:orderId" element={<PaymentDetailsPage />} />

        {/* المفضلة */}
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* تسجيل المستخدمين */}
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/get-started"
          element={
            <GuestRoute>
              <GetStartedPage />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route path="/social-callback" element={<SocialCallback />} />

        {/* المكتبة */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/libraries" element={<LibrariesPage />} />
        <Route path="/library/:id" element={<LibraryDetails />} />

        {/* لوحة تحكم الأدمن */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<CreateCategory />} />
          <Route path="categories/:id/edit" element={<EditCategory />} />
        </Route>

        {/* صفحة غير موجودة */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <FloatingChatButton />
    </Router>
  );
}

export default App;
