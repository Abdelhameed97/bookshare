import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const OrderContext = createContext();

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchOrders = async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getOrders();
      setOrders(response.data || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { state: { from: window.location.pathname } });
      }
      setError(err.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((order) => order.status === "pending").length;
  }, [orders]);

  const uniqueBooksCount = useMemo(() => {
    const bookIds = new Set();
    orders.forEach((order) => {
      order.order_items?.forEach((item) => {
        bookIds.add(item.book_id);
      });
    });
    return bookIds.size;
  }, [orders]);

  useEffect(() => {
    fetchOrders();

    const handleStorageChange = () => {
      const newUser = JSON.parse(localStorage.getItem("user") || "null");
      if (newUser?.id !== user?.id) {
        fetchOrders();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user?.id]);

  const value = {
    orders,
    pendingOrdersCount,
    uniqueBooksCount,
    loading,
    error,
    fetchOrders,
    setOrders,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
