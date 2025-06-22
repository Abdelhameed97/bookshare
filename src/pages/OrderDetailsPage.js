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
    FileText
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Title from '../components/shared/Title';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login', { state: { from: `/orders/${id}` } });
                    return;
                }

                const response = await api.getOrderDetails(id);
                if (response.data && response.data.data) {
                    setOrder(response.data.data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login', { state: { from: `/orders/${id}` } });
                }
                setError(err.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, navigate]);

    const getStatusIcon = (status) => {
        if (!status) return <Clock size={20} className="text-secondary me-2" />;

        switch (status.toLowerCase()) {
            case 'delivered': return <CheckCircle size={20} className="text-success me-2" />;
            case 'shipped': return <Truck size={20} className="text-primary me-2" />;
            case 'processing': return <RefreshCw size={20} className="text-warning me-2" />;
            case 'pending': return <Clock size={20} className="text-secondary me-2" />;
            case 'cancelled': return <XCircle size={20} className="text-danger me-2" />;
            default: return <Clock size={20} className="text-secondary me-2" />;
        }
    };

    const getStatusBadge = (status) => {
        if (!status) return 'secondary';

        switch (status.toLowerCase()) {
            case 'delivered': return 'success';
            case 'shipped': return 'primary';
            case 'processing': return 'warning';
            case 'pending': return 'secondary';
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
        if (!price) return '0.00';
        return parseFloat(price).toFixed(2);
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
            <div className="text-center py-5">
                <Alert variant="danger">
                    {error}
                </Alert>
                <Button
                    variant="primary"
                    onClick={() => navigate(-1)}
                    className="mt-3"
                >
                    Back to Orders
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-5">
                <Alert variant="warning">
                    Order not found
                </Alert>
                <Button
                    variant="primary"
                    onClick={() => navigate(-1)}
                    className="mt-3"
                >
                    Back to Orders
                </Button>
            </div>
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
                                            <div>{order.client?.location || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <h6>Owner</h6>
                                            <div>{order.owner?.name || 'N/A'}</div>
                                            <div>{order.owner?.email || 'N/A'}</div>
                                            <div>{order.owner?.phone_number || 'N/A'}</div>
                                            <div>{order.owner?.location || 'N/A'}</div>
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
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div>{formatPrice(item.price)} EGP</div>
                                                        <small className="text-muted">Total: {formatPrice(item.quantity * parseFloat(item.price || 0))} EGP</small>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            <Footer />
        </>
    );
};

export default OrderDetailsPage;