import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import PaymentDetailsPage from "./pages/PaymentDetailsPage";
import AllOrdersPage from "./components/Library/AllOrdersPage";
import NotificationsPage from "./components/Library/NotificationsPage";
import ClientNotificationsPage from "./pages/ClientNotificationsPage";
import EditClientProfile from "./components/forms/EditClientProfile";

import useAuth from "./hooks/useAuth";
import NotFound from "./pages/NotFound";
import SocialCallback from "./pages/SocialCallback";
import RagChat from "./pages/RagChat";
import FloatingChatButton from "./components/FloatingChatButton";
import ForgotPassword from "./components/forms/ForgotPassword";
import ResetPassword from "./components/forms/ResetPassword";
import "./App.css";

import AdminDashboard from "./components/Admin/Dashboard";
import CategoryList from "./components/Admin/CategoryList";
import UserList from "./components/Admin/UserList";
import BookList from "./components/Admin/BookList";
import AdminOrders from "./components/Admin/AdminOrders";
import AdminNotificationsPage from "./components/Admin/NotificationsPage";
import AdminRoute from "./components/GuestRoute/AdminRoute";
import OwnerRoute from "./components/GuestRoute/OwnerRoute";
import EditBookPage from "./components/Library/EditBookPage";

import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { OrderProvider } from "./contexts/OrderContext";
import { PaymentProvider } from "./contexts/PaymentContext";

import VerifyEmailReminder from "./pages/form/VerifyEmailReminder";
import EmailVerified from "./pages/form/EmailVerified";

function RedirectToDashboardOrHome() {
  const { user } = useAuth();
  if (user && user.role === "owner") {
    return <Navigate to='/dashboard' replace />;
  }
  if (user && user.role === "admin") {
    return <Navigate to='/admin/dashboard' replace />;
  }
  return <Home />;
}

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <PaymentProvider>
              <Routes>
                <Route path='/' element={<RedirectToDashboardOrHome />} />
                <Route path='/about' element={<About />} />
                <Route path='/cart' element={<CartPage />} />
                <Route path='/orders' element={<OrdersPage />} />
                <Route path='/orders/:id' element={<OrderDetailsPage />} />
                <Route path='/wishlist' element={<WishlistPage />} />
                <Route path='/payments' element={<PaymentsPage />} />
                <Route
                  path='/payment/:orderId'
                  element={<PaymentDetailsPage />}
                />
                <Route path='/books' element={<BooksPage />} />
                <Route path='/books/:id' element={<BookDetails />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route
                  path='/login'
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path='/get-started'
                  element={
                    <GuestRoute>
                      <GetStartedPage />
                    </GuestRoute>
                  }
                />
                <Route path='/verify-email' element={<VerifyEmailReminder />} />
                <Route path='/email-verified' element={<EmailVerified />} />
                <Route path='/social-callback' element={<SocialCallback />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/contact' element={<ContactPage />} />
                <Route
                  path='/client-notifications'
                  element={<ClientNotificationsPage />}
                />
                <Route
                  path='/edit-client-profile'
                  element={<EditClientProfile />}
                />

                {/* Owner Routes */}
                <Route
                  path='/dashboard'
                  element={
                    <OwnerRoute>
                      <Dashboard />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/edit-profile'
                  element={
                    <OwnerRoute>
                      <EditProfile />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/add-book'
                  element={
                    <OwnerRoute>
                      <AddBookPage />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/libraries'
                  element={
                    <OwnerRoute>
                      <LibrariesPage />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/library/:id'
                  element={
                    <OwnerRoute>
                      <LibraryDetails />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/all-orders'
                  element={
                    <OwnerRoute>
                      <AllOrdersPage />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/edit-book/:id'
                  element={
                    <OwnerRoute>
                      <EditBookPage />
                    </OwnerRoute>
                  }
                />
                <Route
                  path='/notifications'
                  element={
                    <OwnerRoute>
                      <NotificationsPage />
                    </OwnerRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path='/admin'
                  element={<Navigate to='/admin/dashboard' replace />}
                />
                <Route
                  path='/admin/dashboard'
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/categories'
                  element={
                    <AdminRoute>
                      <CategoryList />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/users'
                  element={
                    <AdminRoute>
                      <UserList />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/books'
                  element={
                    <AdminRoute>
                      <BookList />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/orders'
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/notifications'
                  element={
                    <AdminRoute>
                      <AdminNotificationsPage />
                    </AdminRoute>
                  }
                />

                <Route path='*' element={<NotFound />} />
              </Routes>
              <FloatingChatButton />
            </PaymentProvider>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
