import { useState, useEffect } from 'react';
import api from '../services/api';

export const useWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const response = await api.getWishlist();
            const items = response.data?.data || [];

            if (!Array.isArray(items)) {
                throw new Error('Expected array in response data');
            }

            setWishlistItems(items);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeItem = async (itemId) => {
        try {
            await api.removeWishlistItem(itemId);
            setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            return { success: true };
        } catch (err) {
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
        removeItem,
        moveToCart,
        moveAllToCart 
    };
};
