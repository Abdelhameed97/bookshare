import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const WishlistContext = createContext();

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error(
      "useWishlistContext must be used within a WishlistProvider"
    );
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchWishlist = async () => {
    if (!user?.id) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getWishlist();
      const items = response.data?.data || [];
      setWishlistItems(items);
      setError(null);
      return items;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { state: { from: window.location.pathname } });
      }
      setError(err.response?.data?.message || err.message);
      setWishlistItems([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (bookId) => {
    try {
      if (!user?.id) {
        navigate("/login", { state: { from: "/books" } });
        return { success: false, error: "Please login first" };
      }

      const bookResponse = await api.getBookDetails(bookId);
      const book = bookResponse.data;

      if (!book) {
        throw new Error("Book not found");
      }

      if (book.user_id === user.id) {
        throw new Error("You cannot add your own book to your wishlist");
      }

      const response = await api.addToWishlist(bookId);
      if (!response.data || !response.data.success) {
        throw new Error("Failed to add to wishlist");
      }

      // Update local state immediately
      setWishlistItems((prev) => {
        const existingItem = prev.find((item) => item.book_id === bookId);
        if (!existingItem) {
          return [...prev, { id: Date.now(), book_id: bookId, book: book }];
        }
        return prev;
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to add to wishlist",
      };
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeWishlistItem(itemId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to remove item",
      };
    }
  };

  const moveToCart = async (itemId) => {
    try {
      if (!user?.id) {
        navigate("/login", { state: { from: "/wishlist" } });
        return { success: false, error: "Please login first" };
      }

      await api.moveToCart(itemId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to move to cart",
      };
    }
  };

  const moveAllToCart = async () => {
    try {
      if (!user?.id) {
        navigate("/login", { state: { from: "/wishlist" } });
        return { success: false, error: "Please login first" };
      }

      const response = await api.moveAllToCart();
      setWishlistItems([]); // Clear wishlist after moving all items
      return {
        success: true,
        count: response.data.moved_items_count,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to move items to cart",
      };
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  const wishlistCount = wishlistItems.length;

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeItem,
    moveToCart,
    moveAllToCart,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
