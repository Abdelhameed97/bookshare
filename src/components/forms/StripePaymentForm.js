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
            // Verify authentication
            const { user, token } = verifyAuthentication();

            // Step 1: Create payment intent
            const response = await api.post('/stripe/create-payment-intent', {
                order_id: order.id,
                amount: Math.round(order.total_price * 100) // Convert to cents
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to create payment intent');
            }

            // Step 2: Confirm the payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                response.data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: user.name || 'Customer',
                            email: user.email || ''
                        }
                    },
                    receipt_email: user.email
                }
            );

            if (stripeError) {
                throw stripeError;
            }

            if (paymentIntent.status === 'succeeded') {
                // Step 3: Confirm payment with our backend
                const confirmResponse = await api.post('/stripe/confirm-payment', {
                    payment_intent_id: paymentIntent.id,
                    order_id: order.id,
                    amount: paymentIntent.amount / 100 // Convert back to dollars
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!confirmResponse.data?.success) {
                    throw new Error(confirmResponse.data?.message || 'Payment confirmation failed');
                }

                // Show success notification
                await Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful',
                    text: 'Your payment has been processed successfully',
                    timer: 2000
                });

                onSuccess(paymentIntent);
            }
        } catch (err) {
            console.error('Stripe payment error:', err);

            let errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);

            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: errorMessage,
            });

            onError?.(err);
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
            {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-100 py-3 mt-3"
                variant="success"
            >
                {loading ? (
                    <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing Payment...
                    </>
                ) : (
                    `Pay ${order.total_price.toFixed(2)} EGP`
                )}
            </Button>
        </form>
    );
};

export default StripePaymentForm;