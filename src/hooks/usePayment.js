import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const usePayment = () => {
    const [payment, setPayment] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const fetchPaymentDetails = async (orderId) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch order details first
            const orderResponse = await api.getOrderDetails(orderId);

            if (!orderResponse.data) {
                throw new Error('Order not found');
            }

            setOrder(orderResponse.data);

            // Then try to fetch payment if exists
            try {
                const paymentResponse = await api.getOrderPayment(orderId);
                if (paymentResponse.data) {
                    setPayment(paymentResponse.data);
                }
            } catch (paymentError) {
                console.log('No payment exists yet, will create new one');
            }
        } catch (err) {
            console.error('Error fetching payment details:', err);
            setError(err.message || 'Failed to load payment details');
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const createPayment = async (paymentData) => {
        setProcessing(true);
        try {
            const response = await api.createPayment(paymentData);
            setPayment(response.data);
            return response.data;
        } catch (err) {
            console.error('Payment creation failed:', err);
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    return {
        payment,
        order,
        loading,
        error,
        processing,
        fetchPaymentDetails,
        createPayment,
        setPayment
    };
};