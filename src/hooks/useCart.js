import { useState, useEffect } from 'react';
import api from '../services/api';

export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCartItems = async () => {
        setLoading(true);
        try {
            const response = await api.getCart();
            setCartItems(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load cart');
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);

    return {
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        fetchCartItems,
        setCartItems
    };
};