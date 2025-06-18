import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Form, Alert } from 'react-bootstrap';
import { Trash2, ChevronLeft, Tag, Truck, Shield } from 'lucide-react';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import '../style/CartPage.css';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            title: 'Forbidden Love',
            author: 'Ahmed Khaled',
            price: 75.99,
            quantity: 2,
            image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg',
        },
        {
            id: 2,
            title: 'Secrets of the Human Mind',
            author: 'Dr. Mohamed Ali',
            price: 120.5,
            quantity: 1,
            image: 'https://m.media-amazon.com/images/I/81s6DUyQCZL._AC_UF1000,1000_QL80_.jpg',
        },
    ]);

    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : 25.0;
    const discount = discountApplied ? subtotal * 0.1 : 0;
    const total = subtotal + shipping - discount;

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) return;

        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: parseInt(newQuantity) } : item
        ));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const applyDiscount = () => {
        if (discountCode === 'BOOKLOVER10') {
            setDiscountApplied(true);
        }
    };

    return (
        <>
            <Navbar />

            <Container className="py-5 cart-container">
                {showAlert && (
                    <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
                        Item removed from your cart!
                    </Alert>
                )}

                <div className="d-flex align-items-center mb-4">
                    <CustomButton variant="outline-primary" className="me-3 back-button">
                        <ChevronLeft size={20} className="me-1" />
                        Back to Shop
                    </CustomButton>
                    <Title>Shopping Cart ({cartItems.length})</Title>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4 rounded-card cart-card">
                            <Card.Body>
                                <Table responsive borderless hover className="cart-table">
                                    <thead>
                                        <tr>
                                            <th>Book</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item) => (
                                            <tr key={item.id} className="cart-item">
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="book-cover"
                                                        />
                                                        <div className="ms-3">
                                                            <h6 className="mb-1">{item.title}</h6>
                                                            <small className="text-muted">By {item.author}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                        className="quantity-input"
                                                    />
                                                </td>
                                                <td className="price">{item.price.toFixed(2)} EGP</td>
                                                <td className="price">{(item.price * item.quantity).toFixed(2)} EGP</td>
                                                <td className="text-center">
                                                    <CustomButton
                                                        variant="outline-danger"
                                                        className="remove-btn"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </CustomButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <div className="d-flex justify-content-between mt-4">
                                    <CustomButton
                                        variant="outline-primary"
                                        className="continue-shopping-btn"
                                    >
                                        <ChevronLeft size={18} className="me-1" />
                                        Continue Shopping
                                    </CustomButton>
                                    <CustomButton
                                        variant="light"
                                        className="update-cart-btn"
                                    >
                                        Update Cart
                                    </CustomButton>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="rounded-card benefits-card">
                            <Card.Body className="p-3">
                                <Row>
                                    <Col md={4} className="benefit-item">
                                        <Truck size={24} className="me-2 text-primary" />
                                        <div>
                                            <h6 className="mb-0">Free Shipping</h6>
                                            <small>On orders over 200 EGP</small>
                                        </div>
                                    </Col>
                                    <Col md={4} className="benefit-item">
                                        <Tag size={24} className="me-2 text-primary" />
                                        <div>
                                            <h6 className="mb-0">Discounts</h6>
                                            <small>Use code: BOOKLOVER10</small>
                                        </div>
                                    </Col>
                                    <Col md={4} className="benefit-item">
                                        <Shield size={24} className="me-2 text-primary" />
                                        <div>
                                            <h6 className="mb-0">Secure Checkout</h6>
                                            <small>100% Protected</small>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="rounded-card summary-card sticky-top">
                            <Card.Body>
                                <h5 className="summary-title mb-3">Order Summary</h5>

                                <div className="d-flex justify-content-between mb-2 summary-item">
                                    <span>Subtotal:</span>
                                    <span>{subtotal.toFixed(2)} EGP</span>
                                </div>

                                {discountApplied && (
                                    <div className="d-flex justify-content-between mb-2 summary-item text-success">
                                        <span>Discount (10%):</span>
                                        <span>-{discount.toFixed(2)} EGP</span>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mb-2 summary-item">
                                    <span>Shipping:</span>
                                    <span className={shipping === 0 ? 'text-success' : ''}>
                                        {shipping === 0 ? 'FREE' : `${shipping.toFixed(2)} EGP`}
                                    </span>
                                </div>

                                <hr className="my-3" />

                                <div className="d-flex justify-content-between mb-4 summary-item total-summary">
                                    <strong>Total:</strong>
                                    <strong className="total-price">{total.toFixed(2)} EGP</strong>
                                </div>

                                <CustomButton
                                    variant="primary"
                                    className="w-100 checkout-btn mb-3"
                                >
                                    Proceed to Checkout
                                </CustomButton>

                                <div className="discount-section mb-3">
                                    <div className="input-group">
                                        <Form.Control
                                            type="text"
                                            placeholder="Discount Code"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="discount-input"
                                        />
                                        <CustomButton
                                            variant={discountApplied ? 'success' : 'outline-primary'}
                                            onClick={applyDiscount}
                                            className="apply-btn"
                                        >
                                            {discountApplied ? 'Applied!' : 'Apply'}
                                        </CustomButton>
                                    </div>
                                    {discountApplied && (
                                        <small className="text-success d-block mt-1">
                                            Discount applied successfully!
                                        </small>
                                    )}
                                </div>

                                <div className="secure-payment">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                                        alt="Visa"
                                        className="payment-icon"
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196566.png"
                                        alt="Mastercard"
                                        className="payment-icon"
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/825/825454.png"
                                        alt="PayPal"
                                        className="payment-icon"
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

export default CartPage;