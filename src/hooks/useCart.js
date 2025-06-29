import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const useCart = (userId) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCartItems = async () => {
        setLoading(true);
        try {
            if (!userId) {
                setCartItems([]);
                setError('Please login to view your cart');
                return;
            }

            const response = await api.getCart();
            setCartItems(response.data || []);
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login', { state: { from: window.location.pathname } });
            }
            setError(err.response?.data?.message || 'Failed to load cart');
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (bookId, data = {}) => {
        try {
            const payload = {
                type: data.type ?? 'buy',
            };

            await api.addToCart(bookId, payload);
            await fetchCartItems();
            return true;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error.response?.data?.message || 'Failed to add item to cart';
        }
    };

    const removeFromCart = async (bookId) => {
        try {
            const cartItem = cartItems.find(item => item.book_id === bookId);
            if (cartItem) {
                await api.removeCartItem(cartItem.id);
                await fetchCartItems();
            }
            return true;
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error.response?.data?.message || 'Failed to remove item from cart';
        }
    };

    const checkCartStatus = async (bookId) => {
        try {
            const response = await api.getCart();
            const isInCart = response.data.some(item => item.book_id === bookId);
            return isInCart;
        } catch (error) {
            console.error("Error checking cart status:", error);
            return false;
        }
    };

    const applyCoupon = async (couponCode, subtotal) => {
        try {
            const response = await api.applyCoupon(couponCode, subtotal);

            return {
                success: true,
                coupon: response.coupon,
                discount: response.discount,
                newSubtotal: response.newSubtotal
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to apply coupon'
            };
        }
    };
    
    const updateCartItem = async (cartItemId, quantity) => {
        try {
            await api.updateCartItem(cartItemId, { quantity });
            await fetchCartItems();
            return true;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update cart item';
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, [userId]);

    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);

    return {
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        fetchCartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        checkCartStatus,
        applyCoupon,
        setCartItems
    };
};