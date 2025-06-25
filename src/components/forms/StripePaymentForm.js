import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert } from 'react-bootstrap';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

const StripePaymentForm = ({ order, createStripePayment, confirmStripePayment, onSuccess, onError }) => {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);
    const [payment, setPayment] = useState(null);

    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Step 1: Create payment intent
            if (!paymentIntentCreated) {
                const result = await createStripePayment(order.id);
                setPayment(result.payment);
                setPaymentIntentCreated(true);
            }

            // Step 2: Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                payment.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: order.user?.name || 'Customer',
                    },
                }
            }
            );

            if (stripeError) {
                throw stripeError;
            }

            // Step 3: Confirm payment with our backend
            if (paymentIntent.status === 'succeeded') {
                const result = await confirmStripePayment(payment.id);
                onSuccess();
            } else {
                throw new Error('Payment not completed');
            }
        } catch (err) {
            console.error('Stripe payment error:', err);
            setError(err.message);
            onError(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <CardElement
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
                    }}
                />
            </div>

            {error && (
                <Alert variant="danger" className="d-flex align-items-center mb-3">
                    <XCircle size={20} className="me-2" />
                    {error}
                </Alert>
            )}

            <Button
                type="submit"
                disabled={!stripe || processing}
                className="w-100"
            >
                {processing ? 'Processing...' : 'Pay with Stripe'}
            </Button>

            {paymentIntentCreated && (
                <Alert variant="info" className="mt-3 d-flex align-items-center">
                    <CheckCircle size={20} className="me-2" />
                    Payment intent created. Please complete your payment.
                </Alert>
            )}
        </form>
    );
};

export default StripePaymentForm;