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
      const ordersData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      const ordersWithCount = ordersData.map((order) => ({
        ...order,
        items_count: order.order_items?.length || 0,
        total: parseFloat(order.total_price) || 0,
      }));

      setOrders(ordersWithCount);
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

  const cancelOrder = async (orderId) => {
    try {
      await api.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to cancel order",
      };
    }
  };

  const countPendingOrders = () => {
    return orders.filter((order) => order.status === "pending").length;
  };

  const countBooksInPendingOrders = () => {
    return orders
      .filter((order) => order.status === "pending")
      .reduce((total, order) => total + (order.order_items?.length || 0), 0);
  };

  const getOrderDetails = async (orderId) => {
    try {
      const response = await api.getOrderDetails(orderId);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch order details";
    }
  };

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
    cancelOrder,
    countPendingOrders,
    countBooksInPendingOrders,
    getOrderDetails,
    setOrders,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
