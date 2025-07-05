import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Badge,
    ListGroup,
    Spinner,
    Alert,
    Button
} from 'react-bootstrap';
import {
    FaChevronLeft,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaRedo,
    FaBox,
    FaFileAlt,
    FaExclamationCircle,
    FaThumbsUp,
    FaThumbsDown,
    FaCreditCard
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [paymentAttempted, setPaymentAttempted] = useState(false);

    // Helper function to get book image URL
    const getBookImage = (images) => {
        if (!images || images.length === 0) {
            return 'https://via.placeholder.com/300x450?text=Book+Image';
        }

        const firstImage = images[0];
        if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
            return firstImage;
        }

        return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/storage/${firstImage}`;
    };

    // Fetch order and payment details
    const fetchOrderAndPayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch order details
            const orderResponse = await api.getOrderDetails(id);
            let orderData = orderResponse.data?.data || orderResponse.data;
            if (!orderData) throw new Error('Order not found');

            // Fetch payment details
            try {
                const paymentResponse = await api.getOrderPayment(id);
                const paymentData = paymentResponse.data?.data || paymentResponse.data;
                if (paymentData) {
                    setPayment(paymentData);
                    if (paymentData.status === 'paid') {
                        setPaymentCompleted(true);
                    }
                }
            } catch (paymentError) {
                console.log('No payment record found');
            }

            // Format order items with prices
            setOrder({
                ...orderData,
                order_items: orderData.order_items?.map(item => ({
                    ...item,
                    unit_price: item.type === 'rent' ?
                        (item.book?.rental_price || 0) :
                        (item.price || item.book?.price || 0),
                    total_price: (item.type === 'rent' ?
                        (item.book?.rental_price || 0) :
                        (item.price || item.book?.price || 0)) * item.quantity
                }))
            });

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load order details');
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderAndPayment();
    }, [id]);

    // Handle order cancellation
    const handleCancelOrder = async () => {
        const result = await Swal.fire({
            title: 'Cancel Order?',
            text: 'Are you sure you want to cancel this order?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (!result.isConfirmed) return;

        try {
            setProcessing(true);
            await api.cancelOrder(id);

            setOrder(prevOrder => ({
                ...prevOrder,
                status: 'cancelled'
            }));

            await Swal.fire(
                'Cancelled!',
                'Your order has been cancelled successfully.',
                'success'
            );
            navigate('/orders', { state: { activeTab: 'cancelled' } });
        } catch (err) {
            console.error('Error cancelling order:', err);
            let errorMessage = err.response?.data?.message || 'Failed to cancel order';
            if (err.response?.status === 500 && err.response?.data?.error?.includes('No query results')) {
                errorMessage = 'This order may have already been cancelled or deleted.';
            }
            Swal.fire('Error!', errorMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Navigate to payment page
    const handlePayment = () => {
        setPaymentAttempted(true);
        navigate(`/payment/${id}`);
    };

    // Format dates consistently
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    // Format prices consistently
    const formatPrice = (price) => {
        const num = parseFloat(price);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Get price for an item based on its type
    const getItemPrice = (item) => {
        return item.type === 'rent' ?
            (item.book?.rental_price || 0) :
            (item.price || item.book?.price || 0);
    };

    // Status icons for visual indication
    const getStatusIcon = (status) => {
        if (!status) return <FaClock size={20} className="text-secondary me-2" />;
        switch (status.toLowerCase()) {
            case 'accepted':
            case 'completed':
            case 'delivered':
                return <FaThumbsUp size={20} className="text-success me-2" />;
            case 'rejected':
            case 'cancelled':
                return <FaThumbsDown size={20} className="text-danger me-2" />;
            case 'shipped':
                return <FaTruck size={20} className="text-primary me-2" />;
            case 'processing':
            case 'pending':
                return <FaRedo size={20} className="text-warning me-2" />;
            default:
                return <FaExclamationCircle size={20} className="text-secondary me-2" />;
        }
    };

    // Status badges with appropriate colors
    const getStatusBadge = (status) => {
        if (!status) return 'secondary';
        switch (status.toLowerCase()) {
            case 'accepted':
            case 'completed':
            case 'delivered':
                return 'success';
            case 'rejected':
            case 'cancelled':
                return 'danger';
            case 'shipped':
                return 'primary';
            case 'processing':
            case 'pending':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    // Card variants based on status
    const getStatusCardVariant = (status) => {
        if (!status) return 'light';
        switch (status.toLowerCase()) {
            case 'accepted':
            case 'completed':
            case 'delivered':
                return 'success';
            case 'rejected':
            case 'cancelled':
                return 'danger';
            case 'shipped':
                return 'primary';
            case 'processing':
            case 'pending':
                return 'warning';
            default:
                return 'light';
        }
    };

    // Payment status badge with icon
    const getPaymentStatusBadge = () => {
        if (!payment) {
            return (
                <Badge bg="secondary" className="custom-badge">
                    <FaClock size={16} className="me-1" /> Not Paid
                </Badge>
            );
        }

        switch (payment.status) {
            case 'paid':
                return (
                    <Badge bg="success" className="custom-badge">
                        <FaCheckCircle size={16} className="me-1" /> Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge bg="warning" text="dark" className="custom-badge">
                        <FaClock size={16} className="me-1" /> Pending
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge bg="danger" className="custom-badge">
                        <FaTimesCircle size={16} className="me-1" /> Failed
                    </Badge>
                );
            default:
                return (
                    <Badge bg="secondary" className="custom-badge">
                        <FaClock size={16} className="me-1" /> Not Paid
                    </Badge>
                );
        }
    };

    // Get current user info
    const user = JSON.parse(localStorage.getItem('user'));
    const isClient = user?.id === order?.client_id;

    // Determine if order can be cancelled
    const canCancel = order && ['pending', 'processing', 'accepted'].includes(order.status?.toLowerCase()) && isClient;

    // Determine if payment can be made
    const canPay = order && ['accepted'].includes(order.status?.toLowerCase()) &&
        !paymentCompleted &&
        (!payment || payment.status !== 'paid') &&
        isClient;

    // Loading state
    if (loading) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Loading order details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <Container className="flex-grow-1 py-5">
                    <Alert variant="danger" className="d-flex align-items-center">
                        <FaExclamationCircle size={24} className="me-2" />
                        <div>
                            <h5>Order Loading Error</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        {error.includes('not found') || error.includes('deleted') ? (
                            <Button
                                variant="primary"
                                onClick={() => navigate('/orders')}
                            >
                                Back to Orders
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="primary"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => navigate('/orders')}
                                >
                                    My Orders
                                </Button>
                            </>
                        )}
                    </div>
                </Container>
                <Footer />
            </div>
        );
    }

    // Order not found state
    if (!order) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <Container className="flex-grow-1 py-5">
                    <Alert variant="warning" className="d-flex align-items-center">
                        <FaExclamationCircle size={24} className="me-2" />
                        <div>
                            <h5>Order Not Found</h5>
                            <p className="mb-0">The requested order could not be found.</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/orders')}
                        >
                            View Orders
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => navigate('/books')}
                        >
                            Browse Books
                        </Button>
                    </div>
                </Container>
                <Footer />
            </div>
        );
    }

    // Main render
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />

            <Container className="flex-grow-1 py-5">
                <div className="d-flex align-items-center mb-4">
                    <Button
                        variant="outline-primary"
                        className="me-3"
                        onClick={() => navigate(-1)}
                    >
                        <FaChevronLeft size={20} className="me-1" />
                        Back
                    </Button>
                    <h2 className="mb-0">Order Details</h2>
                </div>

                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className={`bg-${getStatusCardVariant(order.status)} text-white`}>
                        <h5 className="mb-0 d-flex align-items-center">
                            {getStatusIcon(order.status)}
                            <span>Order #{order.id}</span>
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-4">
                            <Col md={6}>
                                <div className="d-flex align-items-center mb-3">
                                    <Badge bg={getStatusBadge(order.status)} className="fs-6">
                                        {order.status}
                                    </Badge>
                                    <small className="text-muted ms-3">
                                        Placed on {formatDate(order.created_at)}
                                    </small>
                                </div>
                                {order.updated_at && order.status !== 'pending' && (
                                    <div className="text-muted small">
                                        Last updated: {formatDate(order.updated_at)}
                                    </div>
                                )}
                            </Col>
                            <Col md={6} className="text-md-end">
                                <div className="d-flex flex-column">
                                    <div className="mb-2">
                                        <strong>Payment Status: </strong>
                                        {getPaymentStatusBadge()}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Payment Method:</strong> {order.payment_method || 'Not Specified'}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Card className="h-100 mb-4">
                                    <Card.Header className="d-flex align-items-center bg-light">
                                        <FaBox size={18} className="me-2" />
                                        <span>Shipping Information</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="mb-3">
                                            <h6>Client</h6>
                                            <div>{order.client?.name || 'N/A'}</div>
                                            <div>{order.client?.email || 'N/A'}</div>
                                            <div>{order.client?.phone_number || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <h6>Owner</h6>
                                            <div>{order.owner?.name || 'N/A'}</div>
                                            <div>{order.owner?.email || 'N/A'}</div>
                                            <div>{order.owner?.phone_number || 'N/A'}</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="h-100 mb-4">
                                    <Card.Header className="d-flex align-items-center bg-light">
                                        <FaFileAlt size={18} className="me-2" />
                                        <span>Order Summary</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item className="d-flex justify-content-between">
                                                <span>Subtotal:</span>
                                                <span>{formatPrice(order.subtotal)} EGP</span>
                                            </ListGroup.Item>

                                            {order.discount > 0 && (
                                                <ListGroup.Item className="d-flex justify-content-between text-success">
                                                    <span>Discount ({order.coupon_code}):</span>
                                                    <span>-{formatPrice(order.discount)} EGP</span>
                                                </ListGroup.Item>
                                            )}

                                            <ListGroup.Item className="d-flex justify-content-between">
                                                <span>Tax (10%):</span>
                                                <span>{formatPrice(order.tax)} EGP</span>
                                            </ListGroup.Item>

                                            <ListGroup.Item className="d-flex justify-content-between">
                                                <span>Shipping:</span>
                                                <span>{formatPrice(order.shipping_fee)} EGP</span>
                                            </ListGroup.Item>

                                            <ListGroup.Item className="d-flex justify-content-between fw-bold">
                                                <span>Total Amount:</span>
                                                <span>{formatPrice(order.total_price)} EGP</span>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className="h-100">
                                    <Card.Header className="d-flex align-items-center bg-light">
                                        <FaFileAlt size={18} className="me-2" />
                                        <span>Order Items ({order.order_items?.length || 0})</span>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <ListGroup variant="flush">
                                            {order.order_items?.map(item => (
                                                <ListGroup.Item
                                                    key={item.id}
                                                    className="d-flex justify-content-between align-items-center py-3"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={getBookImage(item.book?.images)}
                                                            alt={item.book?.title}
                                                            width="60"
                                                            height="80"
                                                            className="me-3 object-fit-cover rounded"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/300x450?text=Book+Image';
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="fw-bold">{item.book?.title || 'N/A'}</div>
                                                            <small className="text-muted">Qty: {item.quantity || 0}</small>
                                                            <small className="d-block text-muted text-capitalize">
                                                                Type: {item.type || 'buy'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="fw-bold">
                                                            {formatPrice(getItemPrice(item))} EGP
                                                        </div>
                                                        <small className="text-muted">
                                                            Total: {formatPrice(getItemPrice(item) * item.quantity)} EGP
                                                        </small>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {(canCancel || canPay) && (
                            <Row className="mt-4">
                                <Col className="text-end">
                                    {canCancel && (
                                        <Button
                                            variant="danger"
                                            onClick={handleCancelOrder}
                                            disabled={processing}
                                            className="px-4 py-2 me-3"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Cancelling...
                                                </>
                                            ) : 'Cancel Order'}
                                        </Button>
                                    )}
                                    {canPay && (
                                        paymentCompleted || payment?.status === 'paid' ? (
                                            <Button variant="success" className="px-4 py-2" disabled>
                                                <FaCheckCircle size={18} className="me-2" />
                                                Payment Completed
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="success"
                                                onClick={handlePayment}
                                                disabled={processing || paymentAttempted}
                                                className="px-4 py-2"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Processing...
                                                    </>
                                                ) : paymentAttempted ? (
                                                    'Payment in progress'
                                                ) : (
                                                    <>
                                                        <FaCreditCard size={18} className="me-2" />
                                                        Pay Now
                                                    </>
                                                )}
                                            </Button>
                                        )
                                    )}
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            <Footer />
        </div>
    );
};

export default OrderDetailsPage;