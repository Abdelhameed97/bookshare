import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Form,
    Alert,
    Spinner,
    Badge,
    Button
} from 'react-bootstrap';
import {
    Trash2,
    ChevronLeft,
    Truck,
    Shield,
    ShoppingCart,
    Plus,
    Minus,
    CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import api from '../services/api';
import '../style/CartPage.css';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";
import { useCart } from '../hooks/useCart';

const CartPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const {
        cartItems,
        cartCount,
        loading,
        error,
        fetchCartItems,
        setCartItems
    } = useCart(user?.id);

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');
    const [discount, setDiscount] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.book?.price || 0) * (item.quantity || 1)), 0);
    const shippingFee = subtotal > 200 ? 0 : 25;
    const total = subtotal + shippingFee - discount;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (!user) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        setIsApplyingCoupon(true);
        try {
            const response = await api.applyCoupon(couponCode);
            setDiscount(response.data.discount);
            setAppliedCoupon(response.data.coupon);
            await Swal.fire({
                icon: 'success',
                title: 'Coupon Applied!',
                text: 'Your discount has been applied successfully',
                timer: 2000
            });
        } catch (err) {
            setDiscount(0);
            setAppliedCoupon(null);
            await Swal.fire({
                icon: 'error',
                title: 'Invalid Coupon',
                text: err.response?.data?.message || 'This coupon code is not valid',
            });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const removeCoupon = async () => {
        setDiscount(0);
        setCouponCode('');
        setAppliedCoupon(null);
        await Swal.fire({
            icon: 'info',
            title: 'Coupon Removed',
            text: 'The coupon has been removed from your order',
            timer: 1500
        });
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        const parsedQuantity = Number.parseInt(newQuantity, 10);

        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            await Swal.fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Please enter a whole number 1 or greater'
            });
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        try {
            await api.updateCartItem(itemId, parsedQuantity);

            const updatedItems = cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: parsedQuantity } : item
            );
            setCartItems(updatedItems);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: err.response?.data?.message || 'Failed to update quantity',
            });
        }
    };


    const handleRemoveItem = async (itemId) => {
        const result = await Swal.fire({
            title: 'Remove Item?',
            text: 'This will remove the item from your cart',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!result.isConfirmed) return;
        if (!user) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        try {
            await api.removeCartItem(itemId);
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            setCartItems(updatedItems);
            await Swal.fire({
                icon: 'success',
                title: 'Item Removed',
                timer: 1500
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Removal Failed',
                text: err.response?.data?.message || 'Failed to remove item',
            });
        }
    };

    const handleClearCart = async () => {
        const result = await Swal.fire({
            title: 'Clear Entire Cart?',
            text: 'This will remove all items from your cart',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear it!'
        });

        if (!result.isConfirmed) return;
        if (!user) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        try {
            await Promise.all(cartItems.map(item => api.removeCartItem(item.id)));
            setCartItems([]);
            await Swal.fire({
                icon: 'success',
                title: 'Cart Cleared!',
                text: 'All items have been removed from your cart',
                timer: 2000
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Clear Failed',
                text: err.response?.data?.message || 'Failed to clear cart',
            });
        }
    };

    const handleProceedToCheckout = async () => {
        if (cartItems.length === 0) return;
        if (!user) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        const result = await Swal.fire({
            title: 'Proceed to Checkout?',
            text: 'You will be redirected to complete your purchase',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Continue to Payment'
        });

        if (!result.isConfirmed) return;

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    book_id: item.book_id,
                    quantity: item.quantity,
                    price: parseFloat(item.book.price)
                })),
                subtotal: parseFloat(subtotal.toFixed(2)),
                discount: parseFloat(discount.toFixed(2)),
                shipping: parseFloat(shippingFee.toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                coupon_code: appliedCoupon?.code || null
            };

            const response = await api.createOrder(orderData);
            console.log("Order response:", response.data);

            const orderList = response.data?.data;
            const orderId = Array.isArray(orderList) && orderList.length > 0 ? orderList[0].id : null;

            if (!orderId) {
                throw new Error("Order ID not found in response");
            }

            navigate(`/payment/${orderId}`);
        } catch (err) {
            console.error("Checkout error:", err);
            await Swal.fire({
                icon: 'error',
                title: 'Checkout Failed',
                text: err.response?.data?.message || err.message || 'Unable to process your order',
            });
        }
    };


    const showAlertMessage = (message, variant) => {
        setAlertMessage(message);
        setAlertVariant(variant);
        setShowAlert(true);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <Alert variant="danger">{error}</Alert>
                <CustomButton
                    variant="primary"
                    onClick={fetchCartItems}
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

            <Container className="cart-container py-5">
                {showAlert && (
                    <Alert
                        variant={alertVariant}
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
                    <Title>Shopping Cart <Badge bg="primary" className="ms-2">{cartItems.length}</Badge></Title>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4 cart-card">
                            <Card.Body>
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-4">
                                        <ShoppingCart size={48} className="text-muted mb-3" />
                                        <h4>Your cart is empty</h4>
                                        <p className="text-muted mb-3">
                                            Looks like you haven't added any items to your cart yet
                                        </p>
                                        <CustomButton
                                            variant="primary"
                                            onClick={() => navigate('/books')}
                                        >
                                            Browse Books
                                        </CustomButton>
                                    </div>
                                ) : (
                                    <>
                                        <Table responsive className="cart-table">
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
                                                {cartItems.map(item => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={item.book?.images?.[0] || 'https://via.placeholder.com/80x120'}
                                                                    alt={item.book?.title}
                                                                    className="book-cover me-3"
                                                                />
                                                                <div>
                                                                    <h6 className="mb-1">{item.book?.title}</h6>
                                                                    <small className="text-muted">By {item.book?.author || item.book?.genre}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <CustomButton
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="quantity-btn"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <Minus size={14} />
                                                                </CustomButton>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (/^\d*$/.test(value)) {
                                                                            handleQuantityChange(item.id, value);
                                                                        }
                                                                    }}
                                                                    className="quantity-input mx-2 text-center"
                                                                />
                                                                <CustomButton
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="quantity-btn"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                >
                                                                    <Plus size={14} />
                                                                </CustomButton>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle">
                                                            {parseFloat(item.book?.price || 0).toFixed(2)} EGP
                                                        </td>
                                                        <td className="align-middle">
                                                            {(parseFloat(item.book?.price || 0) * item.quantity).toFixed(2)} EGP
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            <CustomButton
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="remove-btn"
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
                                                onClick={() => navigate('/books')}
                                            >
                                                <ChevronLeft size={18} className="me-1" />
                                                Continue Shopping
                                            </CustomButton>
                                            <CustomButton
                                                variant="danger"
                                                onClick={handleClearCart}
                                            >
                                                Clear Cart
                                            </CustomButton>
                                        </div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="benefits-card">
                            <Card.Body>
                                <Row>
                                    <Col md={4} className="benefit-item">
                                        <Truck size={24} className="me-2 text-primary" />
                                        <div>
                                            <h6 className="mb-0">Free Shipping</h6>
                                            <small>On orders over 200 EGP</small>
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
                        <Card className="summary-card sticky-top">
                            <Card.Body>
                                <h5 className="summary-title mb-3">Order Summary</h5>

                                <div className="cart-items-summary mb-3">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="d-flex justify-content-between mb-2 small">
                                            <span className="text-muted">
                                                {item.book?.title} × {item.quantity}
                                            </span>
                                            <span>{(parseFloat(item.book?.price || 0) * item.quantity).toFixed(2)} EGP</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>{subtotal.toFixed(2)} EGP</span>
                                </div>

                                {appliedCoupon ? (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>
                                            Discount ({appliedCoupon.code})
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 ms-2 text-danger"
                                                onClick={removeCoupon}
                                            >
                                                Remove
                                            </Button>
                                        </span>
                                        <span>-{discount.toFixed(2)} EGP</span>
                                    </div>
                                ) : (
                                    <div className="coupon-section mb-3">
                                        <Form.Group className="d-flex">
                                            <Form.Control
                                                type="text"
                                                placeholder="Coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                size="sm"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={applyCoupon}
                                                disabled={isApplyingCoupon || !couponCode.trim()}
                                                size="sm"
                                            >
                                                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                            </Button>
                                        </Form.Group>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping:</span>
                                    <span className={shippingFee === 0 ? 'text-success' : ''}>
                                        {shippingFee === 0 ? 'FREE' : `${shippingFee.toFixed(2)} EGP`}
                                    </span>
                                </div>

                                <hr className="my-3" />

                                <div className="d-flex justify-content-between mb-4 total-summary">
                                    <strong>Total:</strong>
                                    <strong className="total-price">{total.toFixed(2)} EGP</strong>
                                </div>

                                <CustomButton
                                    variant="primary"
                                    className="w-100 checkout-btn mb-3"
                                    onClick={handleProceedToCheckout}
                                    disabled={cartItems.length === 0}
                                >
                                    Proceed to Checkout
                                </CustomButton>

                                <div className="payment-methods text-center mb-3">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
                                        alt="Visa"
                                        className="payment-icon mx-1"
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196566.png"
                                        alt="Mastercard"
                                        className="payment-icon mx-1"
                                    />
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/196/196547.png"
                                        alt="American Express"
                                        className="payment-icon mx-1"
                                    />
                                </div>

                                <div className="guarantees">
                                    <div className="d-flex align-items-center mb-2">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>Secure payment processing</small>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>Free returns within 30 days</small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <CheckCircle size={16} className="text-success me-2" />
                                        <small>24/7 customer support</small>
                                    </div>
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