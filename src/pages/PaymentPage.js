import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { CheckCircle, CreditCard, Landmark, Wallet, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { usePayment } from '../hooks/usePayment';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import Navbar from '../components/HomePage/Navbar';
import Footer from '../components/HomePage/Footer';
import '../style/PaymentPage.css';

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('card');
    const {
        payment,
        order,
        loading,
        error,
        processing,
        fetchPaymentDetails,
        createPayment
    } = usePayment();

    useEffect(() => {
        fetchPaymentDetails(orderId);
    }, [orderId, fetchPaymentDetails]);

    const handlePaymentSubmit = async () => {
        if (!order) {
            await Swal.fire({
                icon: 'error',
                title: 'Order Missing',
                text: 'Cannot process payment without order details',
            });
            return;
        }

        if (payment) {
            await Swal.fire({
                icon: 'info',
                title: 'Payment Exists',
                text: 'This order already has a payment record',
            });
            navigate(`/order-confirmation/${order.id}`);
            return;
        }

        try {
            const paymentData = {
                order_id: order.id,
                method: selectedMethod,
                amount: order.total,
                status: 'pending'
            };

            await createPayment(paymentData);

            await Swal.fire({
                icon: 'success',
                title: 'Payment Processed!',
                text: 'Your payment has been successfully submitted',
                timer: 2000
            });

            navigate(`/order-confirmation/${order.id}`);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: err.response?.data?.message || 'Payment processing failed. Please try again.',
            });
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-5">
                <Alert variant="danger">
                    {error || 'Could not load order details. Please try again.'}
                </Alert>
                <div className="d-flex justify-content-center mt-3">
                    <CustomButton
                        variant="primary"
                        onClick={() => navigate('/orders')}
                        className="me-2"
                    >
                        View Orders
                    </CustomButton>
                    <CustomButton
                        variant="outline-secondary"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </CustomButton>
                </div>
            </div>
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
                                        <strong>{parseFloat(order.subtotal || 0).toFixed(2)} EGP</strong>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="d-flex justify-content-between mb-2 text-success">
                                            <span>Discount:</span>
                                            <strong>-{parseFloat(order.discount || 0).toFixed(2)} EGP</strong>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping:</span>
                                        <strong>{parseFloat(order.shipping || 0).toFixed(2)} EGP</strong>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-2 total-summary">
                                        <span>Total Amount:</span>
                                        <strong className="total-price">
                                            {parseFloat(order.total || 0).toFixed(2)} EGP
                                        </strong>
                                    </div>
                                </div>

                                {payment ? (
                                    <Alert variant="success" className="text-center">
                                        <CheckCircle size={24} className="me-2" />
                                        Payment {payment.status.toUpperCase()} for this order
                                    </Alert>
                                ) : (
                                    <>
                                        <h5 className="mb-4">Select Payment Method</h5>
                                        <div className="payment-methods mb-4">
                                            <div
                                                className={`payment-method ${selectedMethod === 'card' ? 'active' : ''}`}
                                                onClick={() => setSelectedMethod('card')}
                                            >
                                                <CreditCard size={24} className="me-3" />
                                                <div>
                                                    <h6 className="mb-1">Credit/Debit Card</h6>
                                                    <small className="text-muted">Pay securely with your card</small>
                                                </div>
                                                {selectedMethod === 'card' && <CheckCircle size={20} className="text-success ms-auto" />}
                                            </div>

                                            <div
                                                className={`payment-method ${selectedMethod === 'cash' ? 'active' : ''}`}
                                                onClick={() => setSelectedMethod('cash')}
                                            >
                                                <Wallet size={24} className="me-3" />
                                                <div>
                                                    <h6 className="mb-1">Cash on Delivery</h6>
                                                    <small className="text-muted">Pay when you receive the order</small>
                                                </div>
                                                {selectedMethod === 'cash' && <CheckCircle size={20} className="text-success ms-auto" />}
                                            </div>

                                            <div
                                                className={`payment-method ${selectedMethod === 'bank' ? 'active' : ''}`}
                                                onClick={() => setSelectedMethod('bank')}
                                            >
                                                <Landmark size={24} className="me-3" />
                                                <div>
                                                    <h6 className="mb-1">Bank Transfer</h6>
                                                    <small className="text-muted">Transfer directly to our bank account</small>
                                                </div>
                                                {selectedMethod === 'bank' && <CheckCircle size={20} className="text-success ms-auto" />}
                                            </div>
                                        </div>

                                        {selectedMethod === 'card' && (
                                            <div className="card-details mb-4">
                                                <h6 className="mb-3">Card Information</h6>
                                                <div className="mb-3">
                                                    <label className="form-label">Card Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="1234 5678 9012 3456"
                                                        required
                                                    />
                                                </div>
                                                <Row>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label className="form-label">Expiry Date</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="MM/YY"
                                                                required
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label className="form-label">CVV</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="123"
                                                                required
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <div className="mb-3">
                                                    <label className="form-label">Cardholder Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Name on card"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedMethod === 'bank' && (
                                            <div className="bank-details mb-4">
                                                <h6 className="mb-3">Bank Transfer Details</h6>
                                                <div className="bank-info">
                                                    <p><strong>Bank Name:</strong> BookShare Bank</p>
                                                    <p><strong>Account Name:</strong> BookShare LLC</p>
                                                    <p><strong>Account Number:</strong> 1234567890</p>
                                                    <p><strong>IBAN:</strong> EG12345678901234567890123456</p>
                                                    <p className="text-muted small mt-3">
                                                        Please include order #<strong>{order.id}</strong> in the transfer reference.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="payment-security mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <CheckCircle size={16} className="text-success me-2" />
                                                <small>Secure payment processing</small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <CheckCircle size={16} className="text-success me-2" />
                                                <small>Your payment details are encrypted</small>
                                            </div>
                                        </div>

                                        <CustomButton
                                            variant="primary"
                                            className="w-100 payment-btn"
                                            onClick={handlePaymentSubmit}
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                'Complete Payment'
                                            )}
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
                                                        <div className="item-price mt-1">
                                                            {parseFloat(item.price || 0).toFixed(2)} EGP
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <Alert variant="info">No items in this order</Alert>
                                    )}
                                </div>

                                <div className="delivery-info mb-4">
                                    <h6 className="mb-2">Delivery Information</h6>
                                    <p className="small text-muted mb-1">
                                        <strong>Name:</strong> {order.client?.name || 'Not specified'}
                                    </p>
                                    <p className="small text-muted mb-1">
                                        <strong>Email:</strong> {order.client?.email || 'Not specified'}
                                    </p>
                                    <p className="small text-muted">
                                        <strong>Phone:</strong> {order.client?.phone_number || 'Not specified'}
                                    </p>
                                </div>

                                <div className="payment-methods-logos text-center">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                                        alt="Visa"
                                        className="payment-logo mx-1"
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196566.png"
                                        alt="Mastercard"
                                        className="payment-logo mx-1"
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196547.png"
                                        alt="American Express"
                                        className="payment-logo mx-1"
                                    />
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

export default PaymentPage;