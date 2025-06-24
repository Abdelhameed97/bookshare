import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Tab,
    Nav,
    Badge,
    Spinner,
    Alert,
    Button
} from 'react-bootstrap';
import {
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    RefreshCw,
    ChevronLeft,
    FileText,
    ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import { useOrders } from '../hooks/useOrders';
import '../style/OrdersPage.css';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const OrdersPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    const {
        orders,
        loading,
        error,
        cancelOrder
    } = useOrders(userId);

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return <CheckCircle size={18} className="text-success me-1" />;
            case 'shipped': return <Truck size={18} className="text-primary me-1" />;
            case 'processing': return <RefreshCw size={18} className="text-warning me-1" />;
            case 'cancelled': return <XCircle size={18} className="text-danger me-1" />;
            default: return <Clock size={18} className="text-secondary me-1" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'success';
            case 'shipped': return 'primary';
            case 'processing': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            const { success, error } = await cancelOrder(orderId);
            setAlertMessage(success ? 'Order cancelled successfully' : error);
            setShowAlert(true);
        }
    };

    if (!userId) {
        return (
            <div className="text-center py-5">
                <Alert variant="warning">
                    Please login to view your orders
                </Alert>
                <Button
                    variant="primary"
                    onClick={() => navigate('/login', { state: { from: '/orders' } })}
                    className="mt-3"
                >
                    Login
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <Alert variant="danger">
                    {error}
                </Alert>
                <CustomButton
                    variant="primary"
                    onClick={() => window.location.reload()}
                    className="mt-3"
                >
                    Try Again
                </CustomButton>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <Container className="orders-container py-5">
                {showAlert && (
                    <Alert
                        variant="success"
                        onClose={() => setShowAlert(false)}
                        dismissible
                        className="mt-3"
                    >
                        {alertMessage}
                    </Alert>
                )}

                <div className="d-flex align-items-center mb-4">
                    <CustomButton
                        variant="outline-primary"
                        className="me-3"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft size={20} className="me-1" />
                        Back
                    </CustomButton>
                    <Title>My Orders</Title>
                </div>

                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Card className="mb-4">
                        <Card.Body className="p-0">
                            <Nav variant="tabs" className="orders-tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="all">All Orders</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="processing">
                                        <RefreshCw size={16} className="me-1" />
                                        Processing
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="shipped">
                                        <Truck size={16} className="me-1" />
                                        Shipped
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="delivered">
                                        <CheckCircle size={16} className="me-1" />
                                        Delivered
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="cancelled">
                                        <XCircle size={16} className="me-1" />
                                        Cancelled
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                <Tab.Pane eventKey={activeTab}>
                                    {filteredOrders.length > 0 ? (
                                        <div className="orders-list">
                                            {filteredOrders.map(order => (
                                                <Card key={order.id} className="mb-3 order-card">
                                                    <Card.Body>
                                                        <Row className="align-items-center">
                                                            <Col md={3}>
                                                                <div className="d-flex align-items-center">
                                                                    {getStatusIcon(order.status)}
                                                                    <div>
                                                                        <h6 className="mb-0 order-id">Order #{order.id}</h6>
                                                                        <small className="text-muted">
                                                                            {new Date(order.created_at).toLocaleDateString()}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col md={2}>
                                                                <Badge bg={getStatusBadge(order.status)} className="status-badge">
                                                                    {order.status}
                                                                </Badge>
                                                            </Col>
                                                            <Col md={2}>
                                                                <div className="text-center">
                                                                    <span className="d-block">{order.items_count}</span>
                                                                    <small className="text-muted">Items</small>
                                                                </div>
                                                            </Col>
                                                            <Col md={2}>
                                                                <div className="text-center">
                                                                    <span className="d-block fw-bold">{order.total.toFixed(2)} EGP</span>
                                                                    <small className="text-muted">Total</small>
                                                                </div>
                                                            </Col>
                                                            <Col md={3} className="text-end">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                                >
                                                                    <FileText size={16} className="me-1" />
                                                                    Details
                                                                </Button>
                                                                {order.status === 'shipped' && (
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        className="me-2"
                                                                    >
                                                                        <Truck size={16} className="me-1" />
                                                                        Track
                                                                    </Button>
                                                                )}
                                                                {(order.status === 'processing' || order.status === 'shipped') && (
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleCancelOrder(order.id)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            </Col>
                                                        </Row>

                                                        {order.status === 'shipped' && order.tracking_number && (
                                                            <div className="tracking-info mt-3">
                                                                <small className="text-muted">
                                                                    Tracking #: {order.tracking_number}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <ShoppingCart size={48} className="text-muted mb-3" />
                                            <h4>No orders found</h4>
                                            <p className="text-muted mb-4">
                                                {activeTab === 'all'
                                                    ? "You haven't placed any orders yet"
                                                    : `You don't have any ${activeTab} orders`}
                                            </p>
                                            <CustomButton
                                                variant="primary"
                                                onClick={() => navigate('/books')}
                                            >
                                                Browse Books
                                            </CustomButton>
                                        </div>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </Card.Body>
                    </Card>
                </Tab.Container>
            </Container>

            <Footer />
        </>
    );
};

export default OrdersPage;