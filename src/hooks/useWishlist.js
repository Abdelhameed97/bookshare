import { useState, useEffect } from 'react';
import api from '../services/api';

export const useWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            console.log("Fetching wishlist...");
            const response = await api.getWishlist();
            console.log("Wishlist API response:", response);

            const items = response.data?.data || [];

            if (!Array.isArray(items)) {
                throw new Error('Expected array in response data');
            }

            setWishlistItems(items);
            setError(null);
            return items;
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError(err.response?.data?.message || err.message);
            setWishlistItems([]);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const addToWishlist = async (bookId) => {
        try {
            console.log("Adding to wishlist, book ID:", bookId);
            const response = await api.addToWishlist(bookId);
            console.log("Add to wishlist response:", response);

            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to add to wishlist');
            }

            await fetchWishlist();
            return { success: true };
        } catch (err) {
            console.error("Add to wishlist error:", err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to add to wishlist'
            };
        }
    };

    const removeItem = async (itemId) => {
        try {
            console.log("Removing wishlist item ID:", itemId);
            const response = await api.removeWishlistItem(itemId);
            console.log("Remove item response:", response);

            setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            return { success: true };
        } catch (err) {
            console.error("Remove item error:", err);
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to remove item'
            };
        }
    };

    const moveToCart = async (itemId) => {
        try {
            await api.moveToCart(itemId);
            setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to move to cart'
            };
        }
    };

    const moveAllToCart = async () => {
        try {
            const response = await api.moveAllToCart();
            return {
                success: true,
                count: response.data.moved_items_count
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to move items to cart'
            };
        }
    };

    return {
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        error,
        fetchWishlist,
        addToWishlist,
        removeItem,
        moveToCart,
        moveAllToCart
    };
};