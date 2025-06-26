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
    ChevronLeft,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Package,
    FileText,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
    CreditCard
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Title from '../components/shared/Title';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";
import Swal from 'sweetalert2';
import CustomButton from '../components/shared/CustomButton.js';
import { usePayment } from '../hooks/usePayment';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentCompleted, setPaymentCompleted] = useState(() => {
        const savedPayment = localStorage.getItem(`paymentCompleted_${id}`);
        return savedPayment ? JSON.parse(savedPayment) : false;
    });
    const [paymentAttempted, setPaymentAttempted] = useState(() => {
        const savedAttempt = localStorage.getItem(`paymentAttempted_${id}`);
        return savedAttempt ? JSON.parse(savedAttempt) : false;
    });

    const {
        createStripePayment,
        processing,
        setProcessing,
    } = usePayment();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await api.getOrderDetails(id);
                console.log('Order details response:', response.data);

                let orderData = response.data;
                if (Array.isArray(response.data)) {
                    orderData = response.data[0];
                } else if (response.data.data) {
                    orderData = response.data.data;
                }

                if (!orderData) {
                    throw new Error('Order data not found');
                }

                if (orderData.payment_status === 'paid' || orderData.payment_id) {
                    setPaymentCompleted(true);
                    localStorage.setItem(`paymentCompleted_${id}`, JSON.stringify(true));
                }

                setOrder({
                    ...orderData,
                    order_items: orderData.order_items?.map(item => ({
                        ...item,
                        unit_price: item.type === 'rent' ? (item.book?.rental_price || 0) : (item.price || item.book?.price || 0),
                        total_price: (item.type === 'rent' ? (item.book?.rental_price || 0) : (item.price || item.book?.price || 0)) * item.quantity
                    }))
                });

                setError(null);
            } catch (err) {
                console.error('Error fetching order:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login', { state: { from: `/orders/${id}` } });
                }
                setError(err.response?.data?.message || err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, navigate]);

    useEffect(() => {
        localStorage.setItem(`paymentCompleted_${id}`, JSON.stringify(paymentCompleted));
        localStorage.setItem(`paymentAttempted_${id}`, JSON.stringify(paymentAttempted));
    }, [paymentCompleted, paymentAttempted, id]);

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

    const handlePayment = async () => {
        navigate(`/payment/${id}`);
    };

    const getStatusIcon = (status) => {
        if (!status) return <Clock size={20} className="text-secondary me-2" />;
        switch (status.toLowerCase()) {
            case 'accepted':
            case 'completed':
            case 'delivered':
                return <ThumbsUp size={20} className="text-success me-2" />;
            case 'rejected':
            case 'cancelled':
                return <ThumbsDown size={20} className="text-danger me-2" />;
            case 'shipped':
                return <Truck size={20} className="text-primary me-2" />;
            case 'processing':
            case 'pending':
                return <RefreshCw size={20} className="text-warning me-2" />;
            default:
                return <AlertCircle size={20} className="text-secondary me-2" />;
        }
    };

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

    const formatPrice = (price) => {
        const num = parseFloat(price);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const getItemPrice = (item) => {
        return item.type === 'rent' ? (item.book?.rental_price || 0) : (item.price || item.book?.price || 0);
    };

    const user = JSON.parse(localStorage.getItem('user'));
    const isClient = user?.id === order?.client_id;
    const canCancel = order && ['pending', 'processing', 'accepted'].includes(order.status?.toLowerCase()) && isClient;
    const canPay = order && ['accepted'].includes(order.status?.toLowerCase()) &&
        (!order.payment_status || order.payment_status !== 'paid') &&
        isClient;

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading order details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <Container className="py-5">
                    <Alert variant="danger" className="d-flex align-items-center">
                        <AlertCircle size={24} className="me-2" />
                        <div>
                            <h5>Order Loading Error</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        {error.includes('not found') || error.includes('deleted') ? (
                            <CustomButton
                                variant="primary"
                                onClick={() => navigate('/orders')}
                            >
                                Back to Orders
                            </CustomButton>
                        ) : (
                            <>
                                <CustomButton
                                    variant="primary"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </CustomButton>
                                <CustomButton
                                    variant="outline-primary"
                                    onClick={() => navigate('/orders')}
                                >
                                    My Orders
                                </CustomButton>
                            </>
                        )}
                    </div>
                </Container>
                <Footer />
            </>
        );
    }

    if (!order) {
        return (
            <>
                <Navbar />
                <Container className="py-5">
                    <Alert variant="warning" className="d-flex align-items-center">
                        <AlertCircle size={24} className="me-2" />
                        <div>
                            <h5>Order Not Found</h5>
                            <p className="mb-0">The requested order could not be found.</p>
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
                            onClick={() => navigate('/books')}
                        >
                            Browse Books
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

            <Container className="order-details-container py-5">
                <div className="d-flex align-items-center mb-4">
                    <Button
                        variant="outline-primary"
                        className="me-3"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft size={20} className="me-1" />
                        Back
                    </Button>
                    <Title>Order Details</Title>
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
                                        <strong>Payment Status:</strong>
                                        {order.payment_status === 'paid' ? (
                                            <Badge bg="success" className="ms-2">
                                                <CheckCircle size={14} className="me-1" />
                                                Paid
                                            </Badge>
                                        ) : (
                                            <Badge bg="warning" text="dark" className="ms-2">
                                                <Clock size={14} className="me-1" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Payment Method:</strong> {order.payment_method || 'Not Specified'}
                                    </div>

                                    <div className="fs-5 fw-bold">
                                        <strong>Total:</strong> {formatPrice(order.total_price)} EGP
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-4">
                                <Card className="h-100">
                                    <Card.Header className="d-flex align-items-center bg-light">
                                        <Package size={18} className="me-2" />
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

                            <Col md={6}>
                                <Card>
                                    <Card.Body>
                                        <h5 className="summary-title mb-3">Order Items ({order.order_items?.length || 0})</h5>
                                        <ListGroup variant="flush" className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {order.order_items?.length > 0 ? (
                                                order.order_items.map(item => (
                                                    <ListGroup.Item key={item.id} className="px-0">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={item.book?.images?.[0] || 'https://via.placeholder.com/60x90'}
                                                                alt={item.book?.title || 'Book'}
                                                                className="item-image me-3 rounded"
                                                                width="60"
                                                                height="90"
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between">
                                                                    <div>
                                                                        <h6 className="mb-1 fw-bold">{item.book?.title || 'Unknown Book'}</h6>
                                                                        <small className="text-muted">Qty: {item.quantity || 1}</small>
                                                                        {item.type === 'rent' && (
                                                                            <small className="d-block text-muted">(Rental)</small>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <div className="fw-bold">
                                                                            {formatPrice(getItemPrice(item))} EGP
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            Total: {formatPrice(getItemPrice(item) * item.quantity)} EGP
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                {item.type === 'rent' && (
                                                                    <small className="d-block text-muted mt-1">per rental</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <Alert variant="info">No items in this order</Alert>
                                            )}
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
                                        paymentCompleted ? (
                                            <Button variant="success" className="px-4 py-2" disabled>
                                                <CheckCircle size={18} className="me-2" />
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
                                                        <CreditCard size={18} className="me-2" />
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
        </>
    );
};

export default OrderDetailsPage;