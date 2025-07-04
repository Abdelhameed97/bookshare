import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchCartItems = async () => {
    if (!user?.id) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getCart();
      setCartItems(response.data || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { state: { from: window.location.pathname } });
      }
      setError(err.response?.data?.message || "Failed to load cart");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const cartCount = useMemo(() => {
    const uniqueBookIds = new Set();
    cartItems.forEach((item) => {
      uniqueBookIds.add(item.book_id);
    });
    return uniqueBookIds.size;
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0
    );
  }, [cartItems]);

  const addToCart = async (bookId, data = {}) => {
    try {
      const payload = {
        type: data.type ?? "buy",
      };

      const response = await api.addToCart(bookId, payload);

      if (response.data) {
        setCartItems((prev) => {
          const existingItem = prev.find((item) => item.book_id === bookId);
          if (existingItem) {
            return prev.map((item) =>
              item.book_id === bookId
                ? { ...item, quantity: (item.quantity || 0) + 1 }
                : item
            );
          } else {
            return [...prev, response.data];
          }
        });
      }

      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.removeCartItem(cartItemId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
      if (isNaN(quantity) || quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      await api.updateCartItem(cartItemId, { quantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
      return true;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      throw error;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await api.updateCartItem(cartItemId, { quantity });
      await fetchCartItems();
      return true;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update cart item";
    }
  };

  const clearCart = async () => {
    try {
      await Promise.all(cartItems.map((item) => api.removeCartItem(item.id)));
      setCartItems([]);
      return true;
    } catch (error) {
      throw error.response?.data?.message || "Failed to clear cart";
    }
  };

  const checkCartStatus = async (bookId) => {
    try {
      const response = await api.getCart();
      return {
        isInCart: response.data.some((item) => item.book_id === bookId),
        cartItem: response.data.find((item) => item.book_id === bookId),
      };
    } catch (error) {
      console.error("Error checking cart status:", error);
      return { isInCart: false, cartItem: null };
    }
  };

  const applyCoupon = async (couponCode, subtotal) => {
    try {
      const response = await api.applyCoupon(couponCode, subtotal);
      return {
        success: true,
        coupon: response.coupon,
        discount: response.discount,
        newSubtotal: response.newSubtotal,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to apply coupon",
      };
    }
  };

  useEffect(() => {
    fetchCartItems();

    const handleStorageChange = () => {
      const newUser = JSON.parse(localStorage.getItem("user") || "null");
      if (newUser?.id !== user?.id) {
        fetchCartItems();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user?.id]);

  const value = {
    cartItems,
    cartCount,
    totalQuantity,
    cartTotal,
    loading,
    error,
    fetchCartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItem,
    clearCart,
    setCartItems,
    checkCartStatus,
    applyCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
