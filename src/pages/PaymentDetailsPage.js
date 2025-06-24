import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { CheckCircle, CreditCard, Landmark, Wallet, ArrowLeft, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { usePayment } from '../hooks/usePayment';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import Navbar from '../components/HomePage/Navbar';
import Footer from '../components/HomePage/Footer';
import '../style/PaymentPage.css';

const PaymentDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        payment,
        order,
        loading,
        error,
        processing,
        fetchData,
        createPayment
    } = usePayment();

    useEffect(() => {
        if (!orderId) {
            console.error('[PaymentPage] No orderId provided');
            return;
        }

        if (isInitialLoad) {
            setIsInitialLoad(false);
            return;
        }

        console.log('[PaymentPage] Calling fetchData for order:', orderId);
        fetchData(orderId)
            .then(() => console.log('[PaymentPage] fetchData completed successfully'))
            .catch(err => console.error('[PaymentPage] fetchData error:', err));
    }, [orderId, fetchData, isInitialLoad]);

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
                timer: 2000
            });

            navigate(`/order-confirmation/${order.id}`);
        } catch (err) {
            console.error('[PaymentPage] Payment failed:', err);
            await Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: err.response?.data?.message || err.message || 'Payment processing failed',
            });
        }
    };

    const getItemPrice = (item) => {
        return item.type === 'rent' ? (item.book?.rental_price || 0) : (item.price || item.book?.price || 0);
    };

    const formatPrice = (price) => {
        const num = parseFloat(price);
        return isNaN(num) ? '0.00' : num.toFixed(2);
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
                                <h5 className="mb-4">Order #{order.id} Summary</h5>

                                <div className="order-summary mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Order Date:</span>
                                        <strong>{new Date(order.created_at).toLocaleString()}</strong>
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

                                {payment?.status ? (
                                    <Alert variant={
                                        payment.status === 'paid' ? 'success' :
                                            payment.status === 'failed' ? 'danger' : 'warning'
                                    } className="text-center">
                                        <CheckCircle size={24} className="me-2" />
                                        Payment {payment.status?.toUpperCase?.() || 'PROCESSING'} for this order
                                    </Alert>
                                ) : (
                                    <>
                                        <h5 className="mb-4">Select Payment Method</h5>
                                        <div className="payment-methods mb-4">
                                            <div
                                                className={`payment-method ${selectedMethod === 'card' ? 'active' : ''}`}
                                                onClick={() => setSelectedMethod('card')}
                                            >
                                                <CreditCard size={24} className="me-2" />
                                                Credit/Debit Card
                                            </div>
                                            <div
                                                className={`payment-method ${selectedMethod === 'cash' ? 'active' : ''}`}
                                                onClick={() => setSelectedMethod('cash')}
                                            >
                                                <Wallet size={24} className="me-2" />
                                                Cash on Delivery
                                            </div>
                                        </div>

                                        <CustomButton
                                            variant="primary"
                                            onClick={handlePaymentSubmit}
                                            disabled={processing}
                                            className="w-100"
                                        >
                                            {processing ? 'Processing...' : 'Pay Now'}
                                        </CustomButton>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="order-summary-card sticky-top">
                            <Card.Body>
                                <h5 className="summary-title mb-3">Order Items</h5>
                                <div className="order-items mb-3">
                                    {order.items?.length > 0 ? (
                                        order.items.map(item => (
                                            <div key={item.id} className="order-item mb-3">
                                                <div className="d-flex">
                                                    <img
                                                        src={item.book?.images?.[0] || 'https://via.placeholder.com/60x90'}
                                                        alt={item.book?.title || 'Book'}
                                                        className="item-image me-3"
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
                                            </div>
                                        ))
                                    ) : (
                                        <Alert variant="info">No items in this order</Alert>
                                    )}
                                </div>
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