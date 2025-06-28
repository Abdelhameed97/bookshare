import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    Spinner,
    ListGroup,
    Badge
} from 'react-bootstrap';
import {
    CheckCircle,
    CreditCard,
    Wallet,
    ArrowLeft,
    AlertCircle,
    ShoppingBag,
    Clock,
    XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { usePayment } from '../hooks/usePayment';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import Navbar from '../components/HomePage/Navbar';
import Footer from '../components/HomePage/Footer';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from '../components/forms/StripePaymentForm';
import '../style/PaymentPage.css';
import StripeWrapper from '../components/StripeWrapper';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_51Rdg6iQAnF4Tl5ves23LxuT0PEGKbiCrG5CMA6wutfrDwTy7Db3eOcZCGxitA3v0F7FqlRSPBeCbvwZW62IMZ4Yx00OiCUMXrc');

const PaymentDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('stripe');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        payment,
        order,
        loading,
        error,
        processing,
        fetchData,
        createPayment,
        createStripePayment,
        confirmStripePayment,
        createPayPalPayment,
        setProcessing
    } = usePayment();

    const getBookImage = (images) => {
        if (!images || images.length === 0) {
            return 'https://via.placeholder.com/60x90';
        }

        const firstImage = images[0];
        if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
            return firstImage;
        }

        return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/storage/${firstImage}`;
    };

    useEffect(() => {
        if (!orderId) {
            console.error('[PaymentPage] No orderId provided');
            return;
        }

        if (isInitialLoad) {
            fetchData(orderId)
                .then(() => {
                    if (payment?.method) {
                        setSelectedMethod(payment.method);
                    }
                })
                .catch(err => console.error('[PaymentPage] Initial fetch error:', err));

            setIsInitialLoad(false);
            return;
        }
    }, [orderId, fetchData, isInitialLoad, payment?.method]);
    

    const paymentMethods = [
        { id: 'stripe', label: 'Credit/Debit Card', icon: <CreditCard size={20} className="me-2" /> },
        { id: 'cash', label: 'Cash on Delivery', icon: <Wallet size={20} className="me-2" /> },
        { id: 'paypal', label: 'PayPal', icon: <CreditCard size={20} className="me-2" /> },
    ];

    const handlePaymentSuccess = () => {
        fetchData(orderId);
        Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Your payment has been processed',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handlePaymentError = (error) => {
        Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: error.message || 'Payment processing failed',
        });
    };

    const handlePaymentSubmit = async () => {
        if (!order) {
            console.error('[PaymentPage] Cannot submit - missing order data');
            await Swal.fire({
                icon: 'error',
                title: 'Order Missing',
                text: 'Cannot process payment without order details',
            });
            return;
        }

        try {
            const paymentData = {
                order_id: order.id,
                method: selectedMethod,
                amount: order.total_price || order.total,
                status: 'pending'
            };

            const result = await createPayment(paymentData);

            await Swal.fire({
                icon: 'success',
                title: 'Payment Successful!',
                text: 'Your payment has been processed',
                timer: 2000,
                showConfirmButton: false
            });

            navigate(`/orders/${order.id}`);
        } catch (err) {
            console.error('[PaymentPage] Payment failed:', err);
            await Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: err.response?.data?.message || err.message || 'Payment processing failed',
            });
        }
    };

    const handlePayPalPayment = async () => {
        try {
            setProcessing(true);
            const result = await createPayPalPayment(order.id);

            if (result.success && result.approval_url) {
                window.location.href = result.approval_url;
            } else {
                throw new Error(result.message || 'Failed to create PayPal payment');
            }
        } catch (err) {
            console.error('PayPal payment error:', err);
            let errorMessage = 'Payment failed';

            if (err.response) {
                errorMessage = err.response.data?.message ||
                    err.response.data?.error?.message ||
                    errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: errorMessage,
            });
        } finally {
            setProcessing(false);
        }
    };

    const getPaymentStatusBadge = () => {
        if (!payment) return null;

        switch (payment.status) {
            case 'paid':
                return (
                    <Badge bg="success" className="d-flex align-items-center">
                        <CheckCircle size={16} className="me-1" /> Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge bg="warning" text="dark" className="d-flex align-items-center">
                        <Clock size={16} className="me-1" /> Pending
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge bg="danger" className="d-flex align-items-center">
                        <XCircle size={16} className="me-1" /> Failed
                    </Badge>
                );
            default:
                return <Badge bg="secondary">{payment.status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        const num = parseFloat(price);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const getItemPrice = (item) => {
        return item.type === 'rent' ? (item.book?.rental_price || 0) : (item.price || item.book?.price || 0);
    };

    if (loading && !isInitialLoad) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading payment details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <>
                <Navbar />
                <Container className="py-5">
                    <Alert variant="danger" className="d-flex align-items-center">
                        <AlertCircle size={24} className="me-2" />
                        <div>
                            <h5>Payment Error</h5>
                            <p className="mb-0">{error || 'Could not load order details'}</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <CustomButton
                            variant="primary"
                            onClick={() => navigate('/orders')}
                        >
                            View Orders
                        </CustomButton>
                        <CustomButton
                            variant="outline-primary"
                            onClick={() => fetchData(orderId)}
                        >
                            Retry
                        </CustomButton>
                    </div>
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Container className="payment-container py-5">
                <div className="d-flex align-items-center mb-4">
                    <CustomButton
                        variant="outline-primary"
                        className="me-3"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} className="me-1" />
                        Back
                    </CustomButton>
                    <Title>Complete Your Payment</Title>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4 payment-card">
                            <Card.Body>
                                <h5 className="mb-4 d-flex align-items-center">
                                    <ShoppingBag size={24} className="me-2" />
                                    Order #{order.id} Summary
                                </h5>

                                <div className="order-summary mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Order Date:</span>
                                        <strong>{formatDate(order.created_at)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <strong>{formatPrice(order.total_price || order.subtotal || 0)} EGP</strong>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="d-flex justify-content-between mb-2 text-success">
                                            <span>Discount:</span>
                                            <strong>-{formatPrice(order.discount || 0)} EGP</strong>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping:</span>
                                        <strong>{formatPrice(order.shipping || 0)} EGP</strong>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-2 total-summary">
                                        <span>Total Amount:</span>
                                        <strong className="total-price">
                                            {formatPrice(order.total_price || order.total || 0)} EGP
                                        </strong>
                                    </div>
                                </div>

                                {order.payment_status === 'paid' || payment?.status === 'paid' ? (
                                    <Alert variant="success" className="text-center d-flex align-items-center">
                                        <CheckCircle size={24} className="me-2" />
                                        Payment completed successfully
                                    </Alert>
                                ) : (
                                    <>
                                        <h5 className="mb-4">Select Payment Method</h5>
                                            <div className="payment-methods mb-4">
                                                {paymentMethods.map(method => (
                                                    <div
                                                        key={method.id}
                                                        className={`payment-method ${selectedMethod === method.id ? 'active' : ''}`}
                                                        onClick={() => setSelectedMethod(method.id)}
                                                    >
                                                        {method.icon}
                                                        {method.label}
                                                    </div>
                                                ))}
                                            </div>

                                        {selectedMethod === 'stripe' ? (
                                            <Elements stripe={stripePromise}>
                                                <StripeWrapper
                                                    order={order}
                                                    createStripePayment={createStripePayment}
                                                    confirmStripePayment={confirmStripePayment}
                                                    onSuccess={handlePaymentSuccess}
                                                    onError={handlePaymentError}
                                                />
                                            </Elements>
                                        ) : selectedMethod === 'paypal' ? (
                                            <CustomButton
                                                variant="success"
                                                onClick={handlePayPalPayment}
                                                disabled={processing}
                                                className="w-100"
                                            >
                                                {processing ? 'Processing...' : 'Pay with PayPal'}
                                            </CustomButton>
                                        ) : (
                                            <CustomButton
                                                variant="success"
                                                onClick={handlePaymentSubmit}
                                                disabled={processing}
                                                className="w-100"
                                            >
                                                {processing ? 'Processing...' : 'Pay Now'}
                                            </CustomButton>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="order-summary-card">
                            <Card.Body>
                                <h5 className="summary-title mb-3">Order Items</h5>
                                <ListGroup variant="flush" className="mb-3">
                                    {order.items?.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <ListGroup.Item
                                                key={item.id}
                                                className="px-0"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className="d-flex">
                                                    <img
                                                        src={getBookImage(item.book?.images)}
                                                        alt={item.book?.title || 'Book'}
                                                        className="item-image me-3"
                                                        width="60"
                                                        height="90"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/60x90';
                                                        }}
                                                    />
                                                    <div>
                                                        <h6 className="mb-1">{item.book?.title || 'Unknown Book'}</h6>
                                                        <small className="text-muted">Qty: {item.quantity || 1}</small>
                                                        {item.type === 'rent' && (
                                                            <small className="d-block text-muted">(Rental)</small>
                                                        )}
                                                        <div className="item-price mt-1">
                                                            {formatPrice(getItemPrice(item))} EGP
                                                            {item.type === 'rent' && (
                                                                <small className="d-block text-muted">per rental</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <Alert variant="info">No items in this order</Alert>
                                    )}
                                </ListGroup>
                                {payment && (
                                    <div className="mt-3">
                                        <h6 className="mb-2">Payment Status:</h6>
                                        {getPaymentStatusBadge()}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
};

export default PaymentDetailsPage;