import React, { useState } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Badge } from 'react-bootstrap';
import { Clock, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import '../style/OrdersPage.css';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const OrdersPage = () => {
    const [activeTab, setActiveTab] = useState('all');

    const orders = [
        {
            id: '#ORD-2023-001',
            date: '15 Oct 2023',
            status: 'Delivered',
            items: 3,
            total: 245.97,
            delivery: 'Standard',
            tracking: 'TRK-934857',
            itemsDetails: [
                { name: 'Atomic Habits', price: 89.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg' },
                { name: 'The Psychology of Money', price: 75.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg' },
                { name: 'Book Cover', price: 79.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg' }
            ]
        },
        {
            id: '#ORD-2023-002',
            date: '10 Oct 2023',
            status: 'Shipped',
            items: 2,
            total: 155.98,
            delivery: 'Express',
            tracking: 'TRK-784512',
            itemsDetails: [
                { name: 'Deep Work', price: 75.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg' },
                { name: 'Digital Minimalism', price: 79.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg' }
            ]
        },
        {
            id: '#ORD-2023-003',
            date: '5 Oct 2023',
            status: 'Processing',
            items: 1,
            total: 89.99,
            delivery: 'Standard',
            tracking: null,
            itemsDetails: [
                { name: 'The Alchemist', price: 89.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg' }
            ]
        },
        {
            id: '#ORD-2023-004',
            date: '1 Oct 2023',
            status: 'Cancelled',
            items: 2,
            total: 165.98,
            delivery: 'Standard',
            tracking: null,
            itemsDetails: [
                { name: 'Thinking Fast and Slow', price: 85.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg' },
                { name: 'Bookmark Set', price: 79.99, quantity: 1, image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg' }
            ]
        }
    ];

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
                <Title>My Orders</Title>

                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Card className="mb-4 rounded-card">
                        <Card.Body className="p-0">
                            <Nav variant="tabs" className="orders-tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="all">All Orders</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="processing">
                                        <Clock size={16} className="me-1" />
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
                                                                        <h6 className="mb-0 order-id">{order.id}</h6>
                                                                        <small className="text-muted">{order.date}</small>
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
                                                                    <span className="d-block">{order.items}</span>
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
                                                                <CustomButton
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="me-2"
                                                                >
                                                                    View Details
                                                                </CustomButton>
                                                                {order.status === 'Shipped' && (
                                                                    <CustomButton
                                                                        variant="primary"
                                                                        size="sm"
                                                                    >
                                                                        Track Order
                                                                    </CustomButton>
                                                                )}
                                                            </Col>
                                                        </Row>

                                                        {order.status === 'Shipped' && (
                                                            <div className="tracking-info mt-3">
                                                                <small className="text-muted">Tracking #: {order.tracking}</small>
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                                                alt="No orders"
                                                style={{ width: '120px', opacity: 0.7 }}
                                            />
                                            <h5 className="mt-3">No orders found</h5>
                                            <p className="text-muted">You don't have any {activeTab === 'all' ? '' : activeTab} orders yet</p>
                                            <CustomButton variant="primary" className="mt-3">
                                                Start Shopping
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