import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const useWishlist = (userId) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            if (!userId) {
                setWishlistItems([]);
                setError(null);
                return;
            }

            const response = await api.getWishlist();
            const items = response.data?.data || [];
            setWishlistItems(items);
            setError(null);
            return items;
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            }
            setError(err.response?.data?.message || err.message);
            setWishlistItems([]);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [userId]);

    const addToWishlist = async (bookId) => {
        try {
            if (!userId) {
                navigate('/login', { state: { from: '/books' } });
                return { success: false, error: 'Please login first' };
            }

            const response = await api.addToWishlist(bookId);
            if (!response.data || !response.data.success) {
                throw new Error('Failed to add to wishlist');
            }

            await fetchWishlist();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to add to wishlist'
            };
        }
    };

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
            if (!userId) {
                navigate('/login', { state: { from: '/wishlist' } });
                return { success: false, error: 'Please login first' };
            }

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
            if (!userId) {
                navigate('/login', { state: { from: '/wishlist' } });
                return { success: false, error: 'Please login first' };
            }

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