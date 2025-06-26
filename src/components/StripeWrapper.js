import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './forms/StripePaymentForm';

const stripePromise = loadStripe('pk_test_51Rdg6iQAnF4Tl5ves23LxuT0PEGKbiCrG5CMA6wutfrDwTy7Db3eOcZCGxitA3v0F7FqlRSPBeCbvwZW62IMZ4Yx00OiCUMXrc');

const StripeWrapper = ({ order, onSuccess, onError }) => (
    <Elements stripe={stripePromise} options={{ locale: 'en' }}>
        <StripePaymentForm variant="success" order={order} onSuccess={onSuccess} onError={onError} />
    </Elements>
);

export default StripeWrapper;
