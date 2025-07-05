import React, { useEffect, useState } from 'react';
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
    ShoppingCart,
    LogIn,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

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
            case 'accepted': return <CheckCircle size={18} className="text-success me-1" />;
            case 'rejected': return <XCircle size={18} className="text-danger me-1" />;
            case 'pending': return <Clock size={18} className="text-warning me-1" />;
            case 'delivered': return <CheckCircle size={18} className="text-success me-1" />;
            case 'shipped': return <Truck size={18} className="text-primary me-1" />;
            case 'processing': return <RefreshCw size={18} className="text-secondary me-1" />;
            case 'cancelled': return <XCircle size={18} className="text-danger me-1" />;
            default: return <Clock size={18} className="text-secondary me-1" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted': return 'success';
            case 'rejected': return 'danger';
            case 'pending': return 'warning';
            case 'delivered': return 'success';
            case 'shipped': return 'primary';
            case 'processing': return 'secondary';
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

    // Function to mark notification as read
    const markNotificationAsRead = (orderId) => {
        try {
            const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
            if (!readNotifications.includes(orderId)) {
                const updated = [...readNotifications, orderId];
                localStorage.setItem('readNotifications', JSON.stringify(updated));
                console.log('Marked order notification as read:', orderId);

                // Dispatch custom event to notify navbar
                window.dispatchEvent(new CustomEvent('notificationRead', {
                    detail: { orderId: orderId }
                }));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    if (!userId) {
        return (
            <>
                <Navbar />
                <Container className="py-5">
                    <Alert variant="warning" className="d-flex align-items-center">
                        <LogIn size={24} className="me-2" />
                        <div>
                            <h5>Authentication Required</h5>
                            <p className="mb-0">Please login to view your orders.</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4">
                        <CustomButton
                            variant="primary"
                            onClick={() => navigate('/login', { state: { from: '/orders' } })}
                            className="px-4"
                        >
                            Login
                        </CustomButton>
                    </div>
                </Container>
                <Footer />
            </>
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
                    <Title>My Orders <Badge bg="primary" className="ms-2">{orders.length}</Badge></Title>
                </div>

                {/* Payments Section */}
                <Card className="mb-4">
                    <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <CreditCard size={20} className="me-2" />
                                Payments
                            </h5>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate('/payments')}
                            >
                                View All Payments
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* Orders Tabs */}
                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Card className="mb-4">
                        <Card.Body className="p-0">
                            <Nav variant="tabs" className="orders-tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="all">All Orders</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="pending">
                                        <Clock size={16} className="me-1" />
                                        Pending
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="accepted">
                                        <CheckCircle size={16} className="me-1" />
                                        Accepted
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="rejected">
                                        <XCircle size={16} className="me-1" />
                                        Rejected
                                    </Nav.Link>
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
                                                                    onClick={() => {
                                                                        navigate(`/orders/${order.id}`);
                                                                        markNotificationAsRead(order.id);
                                                                    }}
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
                                            <Card className="no-orders-card">
                                                <Card.Body>
                                                    <ShoppingCart size={64} className="text-muted mb-4" style={{ opacity: 0.5 }} />
                                                    <h4 className="mb-3">No Orders Yet</h4>
                                                    <p className="text-muted mb-4">
                                                        {activeTab === 'all'
                                                            ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                                                            : `You don't have any ${activeTab} orders at the moment.`}
                                                    </p>
                                                    <CustomButton
                                                        variant="primary"
                                                        onClick={() => navigate('/books')}
                                                        className="px-4"
                                                    >
                                                        Browse Books
                                                    </CustomButton>
                                                </Card.Body>
                                            </Card>
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