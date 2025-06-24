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
    AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Title from '../components/shared/Title';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";
import Swal from 'sweetalert2';
import CustomButton from '../components/shared/CustomButton.js';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

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

                const enhancedOrder = {
                    ...orderData,
                    order_items: orderData.order_items?.map(item => ({
                        ...item,
                        unit_price: item.price || item.book?.price || 0,
                        total_price: (item.price || item.book?.price || 0) * item.quantity
                    }))
                };

                setOrder(enhancedOrder);
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

            // تحديث حالة الطلب محليًا
            setOrder(prevOrder => ({
                ...prevOrder,
                status: 'cancelled'
            }));

            await Swal.fire(
                'Cancelled!',
                'Your order has been cancelled successfully.',
                'success'
            );

            // إعادة التوجيه إلى صفحة الطلبات مع تفعيل تبويب "CANCELLED"
            navigate('/orders', { state: { activeTab: 'cancelled' } });
        } catch (err) {
            console.error('Error cancelling order:', err);
            let errorMessage = err.response?.data?.message || 'Failed to cancel order';
            Swal.fire('Error!', errorMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusIcon = (status) => {
        if (!status) return <Clock size={20} className="text-secondary me-2" />;
        switch (status.toLowerCase()) {
            case 'delivered': return <CheckCircle size={20} className="text-success me-2" />;
            case 'shipped': return <Truck size={20} className="text-primary me-2" />;
            case 'processing':
            case 'pending': return <RefreshCw size={20} className="text-warning me-2" />;
            case 'cancelled': return <XCircle size={20} className="text-danger me-2" />;
            default: return <Clock size={20} className="text-secondary me-2" />;
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return 'secondary';
        switch (status.toLowerCase()) {
            case 'delivered': return 'success';
            case 'shipped': return 'primary';
            case 'processing':
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
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
        if (item.type === 'rent') {
            return item.book?.rental_price || item.price || 0;
        }
        return item.price || item.book?.price || 0;
    };

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

    const user = JSON.parse(localStorage.getItem('user'));
    const isClient = user?.id === order.client_id;
    const canCancel = ['pending', 'processing'].includes(order.status?.toLowerCase()) && isClient;

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

                <Card className="mb-4">
                    <Card.Body>
                        <Row className="mb-4">
                            <Col md={6}>
                                <h5 className="d-flex align-items-center">
                                    {getStatusIcon(order.status)}
                                    <span>Order #{order.id}</span>
                                    <Badge bg={getStatusBadge(order.status)} className="ms-3">
                                        {order.status}
                                    </Badge>
                                </h5>
                                <div className="text-muted">
                                    <small>Placed on {formatDate(order.created_at)}</small>
                                </div>
                            </Col>
                            <Col md={6} className="text-md-end">
                                <div className="d-flex flex-column">
                                    <div className="mb-2">
                                        <strong>Payment Method:</strong> {order.payment_method || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Total:</strong> {formatPrice(order.total_price)} EGP
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6} className="mb-4">
                                <Card>
                                    <Card.Header className="d-flex align-items-center">
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
                                    <Card.Header className="d-flex align-items-center">
                                        <FileText size={18} className="me-2" />
                                        <span>Order Items ({order.order_items?.length || 0})</span>
                                    </Card.Header>
                                    <Card.Body>
                                        <ListGroup variant="flush">
                                            {order.order_items?.map(item => (
                                                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={item.book?.images?.[0] || 'https://via.placeholder.com/80'}
                                                            alt={item.book?.title}
                                                            width="60"
                                                            className="me-3"
                                                        />
                                                        <div>
                                                            <div className="fw-bold">{item.book?.title || 'N/A'}</div>
                                                            <small className="text-muted">Qty: {item.quantity || 0}</small>
                                                            <small className="d-block text-muted">Type: {item.type || 'buy'}</small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div>
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

                        {canCancel && (
                            <Row className="mt-4">
                                <Col className="text-end">
                                    <Button
                                        variant="danger"
                                        onClick={handleCancelOrder}
                                        disabled={processing}
                                    >
                                        {processing ? 'Cancelling...' : 'Cancel Order'}
                                    </Button>
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