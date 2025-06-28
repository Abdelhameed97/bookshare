import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge, Button, Dropdown } from 'react-bootstrap';
import { CreditCard, Clock, CheckCircle, XCircle, ArrowLeft, Filter, AlertCircle, LogIn } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import Navbar from '../components/HomePage/Navbar';
import Footer from '../components/HomePage/Footer';
import '../style/PaymentPage.css';
import { useOrders } from '../hooks/useOrders';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const { fetchUserPayments } = usePayment();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    const { orders } = useOrders(userId);

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setLoading(true);
                const data = await fetchUserPayments();
                setPayments(data);
            } catch (err) {
                setError(err.message || 'Failed to load payments');
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, [fetchUserPayments]);

    const filteredPayments = payments.filter(payment => {
        const paymentStatusMatch = filter === 'all' || payment.status === filter;

        const orderStatusMatch = orderStatusFilter === 'all' ||
            (payment.order ? payment.order.status === orderStatusFilter :
                orderStatusFilter === 'n/a');

        return paymentStatusMatch && orderStatusMatch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Badge bg="success"><CheckCircle size={16} className="me-1" /> Paid</Badge>;
            case 'pending':
                return <Badge bg="warning" text="dark"><Clock size={16} className="me-1" /> Pending</Badge>;
            case 'failed':
                return <Badge bg="danger"><XCircle size={16} className="me-1" /> Failed</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return <Badge bg="success">Accepted</Badge>;
            case 'pending':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'rejected':
                return <Badge bg="danger">Rejected</Badge>;
            case 'completed':
                return <Badge bg="primary">Completed</Badge>;
            case 'cancelled':
                return <Badge bg="secondary">Cancelled</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
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

    const getPaymentIdDisplay = (payment) => {
        if (payment.paypal_payment_id) {
            return `PayPal: ${payment.paypal_payment_id}`;
        }
        if (payment.stripe_payment_id) {
            return `Stripe: ${payment.stripe_payment_id}`;
        }
        return `Local: #${payment.id}`;
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'paypal':
                return <img src="/paypal-icon.png" alt="PayPal" style={{ width: '16px', height: '16px' }} />;
            case 'stripe':
                return <img src="/stripe-icon.png" alt="Stripe" style={{ width: '16px', height: '16px' }} />;
            default:
                return <CreditCard size={16} />;
        }
    };    

    const formatMethodName = (method) => {
        const map = {
            paypal: 'PayPal',
            stripe: 'Stripe',
            cash: 'Cash',
            card: 'Card'
        };
        return map[method] || method.charAt(0).toUpperCase() + method.slice(1);
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
                            <p className="mb-0">Please login to view your payment history.</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login', { state: { from: '/payments' } })}
                            className="mt-3 px-4"
                        >
                            Login
                        </Button>
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
                <p className="mt-2">Loading payment history...</p>
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
                            <h5>Payment History Error</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                        <Button variant="outline-primary" onClick={() => navigate('/books')}>
                            Browse Books
                        </Button>
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
                    <Title>Your Payment History</Title>
                </div>

                <Row>
                    <Col lg={12}>
                        <Card className="mb-4 payment-card">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                                    <h5>All Transactions</h5>
                                    <div className="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                                <Filter size={16} className="me-1" />
                                                Payment Status
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    active={filter === 'all'}
                                                    onClick={() => setFilter('all')}
                                                >
                                                    All Payments
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    active={filter === 'paid'}
                                                    onClick={() => setFilter('paid')}
                                                >
                                                    Paid
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    active={filter === 'pending'}
                                                    onClick={() => setFilter('pending')}
                                                >
                                                    Pending
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    active={filter === 'failed'}
                                                    onClick={() => setFilter('failed')}
                                                >
                                                    Failed
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                                <Filter size={16} className="me-1" />
                                                Order Status
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item active={orderStatusFilter === 'all'} onClick={() => setOrderStatusFilter('all')}>
                                                    All Orders
                                                </Dropdown.Item>
                                                <Dropdown.Item active={orderStatusFilter === 'accepted'} onClick={() => setOrderStatusFilter('accepted')}>
                                                    Accepted
                                                </Dropdown.Item>
                                                <Dropdown.Item active={orderStatusFilter === 'pending'} onClick={() => setOrderStatusFilter('pending')}>
                                                    Pending
                                                </Dropdown.Item>
                                                <Dropdown.Item active={orderStatusFilter === 'rejected'} onClick={() => setOrderStatusFilter('rejected')}>
                                                    Rejected
                                                </Dropdown.Item>
                                                <Dropdown.Item active={orderStatusFilter === 'completed'} onClick={() => setOrderStatusFilter('completed')}>
                                                    Completed
                                                </Dropdown.Item>
                                                <Dropdown.Item active={orderStatusFilter === 'cancelled'} onClick={() => setOrderStatusFilter('cancelled')}>
                                                    Cancelled
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>

                                {filteredPayments.length === 0 ? (
                                    <Alert variant="info" className="text-center">
                                        No payments found with the current filters
                                    </Alert>
                                ) : (
                                    <Table striped bordered hover responsive className="align-middle">
                                        <thead>
                                            <tr>
                                                <th>Payment ID</th>
                                                <th>Date</th>
                                                <th>Order Details</th>
                                                <th>Method</th>
                                                <th>Amount</th>
                                                <th>Payment Status</th>
                                                <th>Order Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                            <tbody>
                                                {filteredPayments.map(payment => (
                                                    <tr key={payment.id}>
                                                        <td>#{payment.id}</td>
                                                        <td>{formatDate(payment.created_at)}</td>
                                                        <td>
                                                            <div>
                                                                <strong>Order #{payment.order_id}</strong>
                                                                {payment.order && (
                                                                    <div className="text-muted small">
                                                                        Items: {payment.order.quantity}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-capitalize">
                                                            <CreditCard size={16} className="me-1" />
                                                            {payment.method}
                                                        </td>

                                                        <td>{formatPrice(payment.amount)} EGP</td>
                                                        <td>{getStatusBadge(payment.status)}</td>
                                                        <td>
                                                            {payment.order ?
                                                                getOrderStatusBadge(payment.order.status) :
                                                                <Badge bg="secondary">N/A</Badge>
                                                            }
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => navigate(`/orders/${payment.order_id}`)}
                                                                className="me-2"
                                                            >
                                                                View Order
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                    </Table>
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

export default PaymentsPage;