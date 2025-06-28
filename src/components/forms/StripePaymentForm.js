import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Alert, Button, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StripePaymentForm = ({ order, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const verifyAuthentication = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user || !token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            throw new Error('Authentication required');
        }
        return { user, token };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { user, token } = verifyAuthentication();

            const response = await api.post('/stripe/create-payment-intent', {
                order_id: order.id,
                amount: Math.round(order.total_price * 100)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Payment failed');
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                response.data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: user.name || 'Customer',
                            email: user.email || ''
                        }
                    }
                }
            );

            if (stripeError) throw stripeError;

            if (paymentIntent.status === 'succeeded') {
                await Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful',
                    text: 'Your payment has been processed',
                    timer: 2000
                });
                onSuccess?.(paymentIntent);
            }
        } catch (err) {
            console.error('Payment error:', err);

            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);

            await Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: errorMessage.includes('Only accepted orders can be paid')
                    ? 'The order cannot be paid or may have been cancelled'
                    : errorMessage,
            });
        } finally {
            setLoading(false);
        }
      };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement
                className="mb-3"
                options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                    hidePostalCode: true
                }}
            />
            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-100"
                variant="success"
            >
                {loading ? (
                    <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing Payment...
                    </>
                ) : (
                    'Pay with Card'
                )}
            </Button>
        </form>
    );
};

export default StripePaymentForm;