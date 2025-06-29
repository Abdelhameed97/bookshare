import React, { useState } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';

const CouponInput = ({ subtotal, onApply, onRemove, appliedCoupon }) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleApply = async () => {
        if (!couponCode.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.applyCoupon(couponCode, subtotal);
            onApply(response.data.coupon, response.data.discount);
            setCouponCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid coupon code');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onRemove();
        setError(null);
    };

    if (appliedCoupon) {
        return (
            <Alert variant="success" className="d-flex justify-content-between align-items-center">
                <div>
                    Applied: <strong>{appliedCoupon.code}</strong> (
                    {appliedCoupon.type === 'fixed' ?
                        `${appliedCoupon.value} EGP off` :
                        `${appliedCoupon.value}% off`})
                </div>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemove}
                    disabled={loading}
                >
                    Remove
                </Button>
            </Alert>
        );
    }

    return (
        <div className="mb-3">
            <Form.Group className="d-flex">
                <Form.Control
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={loading}
                />
                <Button
                    variant="primary"
                    onClick={handleApply}
                    disabled={loading || !couponCode.trim()}
                    className="ms-2"
                >
                    {loading ? <Spinner size="sm" /> : 'Apply'}
                </Button>
            </Form.Group>
            {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
        </div>
    );
};

export default CouponInput;