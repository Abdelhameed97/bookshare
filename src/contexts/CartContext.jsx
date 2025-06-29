import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');

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

            const response = await api.addToCart(bookId, payload);
            
            // Update local state immediately
            if (response.data) {
                setCartItems(prev => {
                    const existingItem = prev.find(item => item.book_id === bookId);
                    if (existingItem) {
                        return prev.map(item => 
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

    const removeFromCart = async (bookId) => {
        try {
            const cartItem = cartItems.find(item => item.book_id === bookId);
            if (cartItem) {
                await api.removeCartItem(cartItem.id);
                
                // Update local state immediately
                setCartItems(prev => prev.filter(item => item.book_id !== bookId));
            }
            return true;
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    };

    const updateCartItemQuantity = async (bookId, quantity) => {
        try {
            const cartItem = cartItems.find(item => item.book_id === bookId);
            if (cartItem) {
                await api.updateCartItemQuantity(cartItem.id, { quantity });
                
                // Update local state immediately
                setCartItems(prev => prev.map(item => 
                    item.book_id === bookId 
                        ? { ...item, quantity }
                        : item
                ));
            }
            return true;
        } catch (error) {
            console.error("Error updating cart item quantity:", error);
            throw error;
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    useEffect(() => {
        fetchCartItems();
    }, [user?.id]);

    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        fetchCartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        setCartItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 