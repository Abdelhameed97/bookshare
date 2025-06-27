import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const usePayment = () => {
    const [payment, setPayment] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const fetchData = useCallback(async (orderId) => {
        setLoading(true);
        setError(null);
        try {
            const orderResponse = await api.getOrderDetails(orderId);
            const orderData = orderResponse.data?.data || orderResponse.data;

            if (!orderData) {
                throw new Error('Order not found');
            }

            try {
                const paymentResponse = await api.getOrderPayment(orderId);
                const paymentData = paymentResponse.data?.data || paymentResponse.data;

                if (paymentData) {
                    setPayment(paymentData);
                }
            } catch (paymentError) {
                console.log('No payment exists yet, will create new one');
            }

            setOrder({
                ...orderData,
                items: orderData.order_items || []
            });

        } catch (err) {
            console.error('Error fetching payment details:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load payment details');
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const createPayment = async (paymentData) => {
        setProcessing(true);
        try {
            const response = await api.createPayment({
                ...paymentData,
                status: 'pending'
            });

            const responseData = response.data?.data || response.data;

            if (!responseData) {
                throw new Error('No payment data returned');
            }

            setPayment(responseData);
            return responseData;
        } catch (err) {
            console.error('Payment creation failed:', err);
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    const createStripePayment = async (orderId) => {
        setProcessing(true);
        try {
            const response = await api.createStripePaymentIntent({ order_id: orderId });
            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to create payment intent');
            }
            return response.data;
        } catch (err) {
            console.error('Stripe payment creation failed:', err);
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    const confirmStripePayment = async (paymentIntentId) => {
        setProcessing(true);
        try {
            const response = await api.post('/stripe/confirm-payment', {
                payment_intent_id: paymentIntentId
            });
            return response.data;
        } catch (err) {
            console.error('Stripe payment confirmation failed:', err);
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    const createPayPalPayment = async (orderId) => {
        setProcessing(true);
        try {
            console.log('Sending PayPal payment for orderId:', orderId);
            const response = await api.createPayPalPayment(orderId);
            return response.data;
        } catch (err) {
            console.error('PayPal payment creation failed:', err);
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    const fetchUserPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.getUserPayments();
            return response.data?.data || response.data;
        } catch (err) {
            console.error('Error fetching user payments:', err);
            throw err.response?.data?.message || err.message || 'Failed to load payments';
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        payment,
        order,
        loading,
        error,
        processing,
        setProcessing,
        fetchData,
        createPayment,
        setPayment,
        fetchUserPayments,
        createStripePayment,
        confirmStripePayment,
        createPayPalPayment
    };
};