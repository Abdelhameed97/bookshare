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
                setError(null);
                return;
            }

            const response = await api.getCart();
            setCartItems(response.data);
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            }
            setError(err.response?.data?.message || 'Failed to load cart');
            setCartItems([]);
        } finally {
            setLoading(false);
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
        setCartItems
    };
};