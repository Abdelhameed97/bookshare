import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const useOrders = (userId) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            if (!userId) {
                setOrders([]);
                setError('Please login to view your orders');
                return;
            }

            const response = await api.getOrders();
            const ordersData = response.data?.data || [];

            if (!Array.isArray(ordersData)) {
                throw new Error('Expected array in response data');
            }

            const ordersWithCount = ordersData.map(order => ({
                ...order,
                items_count: order.order_items?.length || 0,
                total: parseFloat(order.total_price) || 0
            }));

            setOrders(ordersWithCount);
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login', { state: { from: window.location.pathname } });
            }
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            await api.cancelOrder(orderId);
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            ));
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Failed to cancel order'
            };
        }
    };

    const countPendingOrders = () => {
        return orders.filter(order => order.status === 'pending').length;
    };

    const countBooksInPendingOrders = () => {
        return orders
            .filter(order => order.status === 'pending')
            .reduce((total, order) => total + (order.order_items?.length || 0), 0);
    };

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    return {
        orders,
        loading,
        error,
        fetchOrders,
        cancelOrder,
        countPendingOrders,
        countBooksInPendingOrders
    };
};