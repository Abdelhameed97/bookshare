import React, { useState } from 'react';
import {
    Container, Row, Col, Card, Table, Form, Alert, Spinner, Badge,
    Button, Dropdown
} from 'react-bootstrap';
import {
    FaTrashAlt,
    FaChevronLeft,
    FaTruck,
    FaShieldAlt,
    FaShoppingCart,
    FaPlus,
    FaMinus,
    FaExclamationCircle,
    FaCreditCard,
    FaWallet,
    FaMoneyBillWave,
    FaPaypal
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import api from '../services/api';
import { useCartContext } from '../contexts/CartContext';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";
import '../style/CartPage.css';

const CartPage = () => {
    const getBookImage = images => {
        if (!images || images.length === 0) {
            return "https://via.placeholder.com/300x450"
        }

        const firstImage = images[0]
        if (typeof firstImage === "string" && firstImage.startsWith("http")) {
            return firstImage
        }

        return `${
            process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"
        }/storage/${firstImage}`
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const {
        cartItems,
        loading,
        error,
        fetchCartItems,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartCount
    } = useCartContext();

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');
    const [discount, setDiscount] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const paymentMethods = [
        { id: '', label: 'Select Payment Method', icon: null },
        { id: 'stripe', label: 'Credit/Debit Card', icon: <FaCreditCard size={20} className="me-2" /> },
        { id: 'cash', label: 'Cash on Delivery', icon: <FaWallet size={20} className="me-2" /> },
        { id: 'paypal', label: 'PayPal', icon: <FaCreditCard size={20} className="me-2" /> },
    ];

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.price * (item.quantity || 1));
    }, 0);

    const shippingFee = subtotal > 200 ? 0 : 25;
    const tax = subtotal * 0.10;
    const total = subtotal + shippingFee + tax - discount;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return
        if (!user) {
            navigate("/login", { state: { from: "/cart" } })
            return
        }

        setIsApplyingCoupon(true)
        try {
            const result = await api.applyCoupon(couponCode, subtotal);

            if (result.success) {
                setDiscount(result.discount);
                setAppliedCoupon(result.coupon);
                await Swal.fire({
                    icon: 'success',
                    title: 'Coupon Applied!',
                    text: `Discount of ${result.discount} EGP has been applied`,
                    timer: 2000
                });
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            setDiscount(0)
            setAppliedCoupon(null)
            await Swal.fire({
                icon: 'error',
                title: 'Invalid Coupon',
                text: err.message || 'This coupon code is not valid',
            });
        } finally {
            setIsApplyingCoupon(false)
        }
    }

    const removeCoupon = async () => {
        setDiscount(0)
        setCouponCode("")
        setAppliedCoupon(null)
        await Swal.fire({
            icon: "info",
            title: "Coupon Removed",
            text: "The coupon has been removed from your order",
            timer: 1500,
        })
    }

    const handleQuantityChange = async (itemId, newQuantity) => {
        const parsedQuantity = parseInt(newQuantity, 10)

        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            await Swal.fire({
                icon: "error",
                title: "Invalid Quantity",
                text: "Please enter a whole number 1 or greater",
            })
            return
        }

        if (!user) {
            navigate("/login", { state: { from: "/cart" } })
            return
        }

        try {
            await updateCartItemQuantity(itemId, parsedQuantity);
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    err.response?.data?.message || "Failed to update quantity",
            })
        }
    }

    const handleChangeType = async (itemId, newType) => {
        try {
            await api.updateCartItem(itemId, { type: newType });
            const updatedItems = cartItems.map(item =>
                item.id === itemId ? { ...item, type: newType } : item
            );
            await fetchCartItems(); // Refresh cart items after type change

            await Swal.fire({
                icon: "success",
                title: "Type Changed",
                text: `Item changed to ${newType}`,
                timer: 1500,
            })
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Failed to Change Type",
                text:
                    err.response?.data?.message || "Failed to update item type",
            })
        }
    }

    const handleRemoveItem = async itemId => {
        const result = await Swal.fire({
            title: "Remove Item?",
            text: "This will remove the item from your cart",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        })

        if (!result.isConfirmed) return
        if (!user) {
            navigate("/login", { state: { from: "/cart" } })
            return
        }

        try {
            await removeFromCart(itemId);
            await Swal.fire({
                icon: "success",
                title: "Item Removed",
                timer: 1500,
            })
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Removal Failed",
                text: err.response?.data?.message || "Failed to remove item",
            })
        }
    }

    const handleClearCart = async () => {
        const result = await Swal.fire({
            title: "Clear Entire Cart?",
            text: "This will remove all items from your cart",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, clear it!",
        })

        if (!result.isConfirmed) return
        if (!user) {
            navigate("/login", { state: { from: "/cart" } })
            return
        }

        try {
            await clearCart();
            await Swal.fire({
                icon: "success",
                title: "Cart Cleared!",
                text: "All items have been removed from your cart",
                timer: 2000,
            })
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Clear Failed",
                text: err.response?.data?.message || "Failed to clear cart",
            })
        }
    }

    const handleOrderNow = async () => {
        if (cartItems.length === 0) return
        if (!user) {
            navigate("/login", { state: { from: "/cart" } })
            return
        }

        if (!selectedPaymentMethod) {
            await Swal.fire({
                icon: "error",
                title: "Payment Method Required",
                text: "Please select a payment method before proceeding",
            })
            return
        }

        const result = await Swal.fire({
            title: "Proceed to Checkout?",
            text: "You will be redirected to complete your order",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Continue to Order",
        })

        if (!result.isConfirmed) return

        setProcessing(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    book_id: item.book_id,
                    quantity: item.quantity,
                    type: item.type
                })),
                payment_method: selectedPaymentMethod,
                coupon_code: appliedCoupon?.code || null
            };

            const response = await api.createOrder(orderData)
            const orderList = response.data?.data
            const orderId =
                Array.isArray(orderList) && orderList.length > 0
                    ? orderList[0].id
                    : null

            if (!orderId) {
                throw new Error("Order ID not found in response")
            }

            navigate(`/orders/${orderId}`);
        } catch (err) {
            console.error("Checkout error:", err)
            await Swal.fire({
                icon: 'error',
                title: 'Checkout Failed',
                text: err.response?.data?.message || err.message || 'Unable to process your order',
            });
        } finally {
            setProcessing(false);
        }
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading your cart...</p>
            </div>
        )
    }

    if (error) {
        return (
            <>
                <Navbar />
                <Container className="py-5">
                    <Alert variant="danger" className="d-flex align-items-center">
                        <FaExclamationCircle size={24} className="me-2" />
                        <div>
                            <h5>Failed to load your cart</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </Alert>
                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <CustomButton
                            variant="primary"
                            onClick={fetchCartItems}
                        >
                            Retry
                        </CustomButton>
                        <CustomButton
                            variant="outline-primary"
                            onClick={() => navigate("/books")}
                        >
                            Browse Books
                        </CustomButton>
                    </div>
                </Container>
                <Footer />
            </>
        )
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
                        className="me-3 back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <FaChevronLeft size={20} className="me-1" />
                        Back
                    </CustomButton>
                    <Title className="page-title">Shopping Cart <Badge bg="primary" className="ms-2">{cartCount}</Badge></Title>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4 cart-card">
                            <Card.Body>
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-4 empty-cart">
                                        <FaShoppingCart size={48} className="text-muted mb-3" />
                                        <h4>Your cart is empty</h4>
                                        <p className="text-muted mb-3">
                                            Looks like you haven't added any
                                            items to your cart yet
                                        </p>
                                        <CustomButton
                                            variant="primary"
                                            onClick={() => navigate("/books")}
                                            className="browse-btn"
                                        >
                                            Browse Books
                                        </CustomButton>
                                    </div>
                                ) : (
                                    <>
                                        <Table
                                            responsive
                                            className="cart-table"
                                        >
                                            <thead>
                                                <tr>
                                                    <th>Book</th>
                                                    <th>Type</th>
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
                                                                    src={getBookImage(
                                                                        item
                                                                            .book
                                                                            .images
                                                                    )}
                                                                    alt={
                                                                        item
                                                                            .book
                                                                            ?.title
                                                                    }
                                                                    className="book-cover me-3"
                                                                    onError={e => {
                                                                        e.target.onerror =
                                                                            null
                                                                        e.target.src =
                                                                            "https://via.placeholder.com/300x450"
                                                                    }}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-1">
                                                                        {
                                                                            item
                                                                                .book
                                                                                ?.title
                                                                        }
                                                                    </h6>
                                                                    <small className="text-muted">
                                                                        By{" "}
                                                                        {item
                                                                            .book
                                                                            ?.author ||
                                                                            item
                                                                                .book
                                                                                ?.genre}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle">
                                                            <Dropdown>
                                                                <Dropdown.Toggle
                                                                    variant={
                                                                        (item.type ??
                                                                            "buy") ===
                                                                        "rent"
                                                                            ? "warning"
                                                                            : "success"
                                                                    }
                                                                    size="sm"
                                                                    id="dropdown-type"
                                                                    disabled={
                                                                        !item
                                                                            .book
                                                                            ?.rental_price &&
                                                                        (item.type ??
                                                                            "buy") ===
                                                                            "rent"
                                                                    }
                                                                    className="type-toggle"
                                                                >
                                                                    {(item.type ??
                                                                        "buy") ===
                                                                    "rent"
                                                                        ? "Rent"
                                                                        : "Buy"}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item
                                                                        onClick={() =>
                                                                            handleChangeType(
                                                                                item.id,
                                                                                "buy"
                                                                            )
                                                                        }
                                                                        active={
                                                                            (item.type ??
                                                                                "buy") !==
                                                                            "rent"
                                                                        }
                                                                        className={
                                                                            (item.type ??
                                                                                "buy") !==
                                                                            "rent"
                                                                                ? "fw-bold"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        Buy
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        onClick={() =>
                                                                            handleChangeType(
                                                                                item.id,
                                                                                "rent"
                                                                            )
                                                                        }
                                                                        active={
                                                                            (item.type ??
                                                                                "buy") ===
                                                                            "rent"
                                                                        }
                                                                        disabled={
                                                                            !item
                                                                                .book
                                                                                ?.rental_price
                                                                        }
                                                                        className={
                                                                            (item.type ??
                                                                                "buy") ===
                                                                            "rent"
                                                                                ? "fw-bold"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        Rent
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <CustomButton
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="quantity-btn"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            item.id,
                                                                            item.quantity -
                                                                                1
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.quantity <=
                                                                        1
                                                                    }
                                                                >
                                                                    <FaMinus size={14} />
                                                                </CustomButton>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={e => {
                                                                        const value =
                                                                            e
                                                                                .target
                                                                                .value
                                                                        if (
                                                                            /^\d*$/.test(
                                                                                value
                                                                            )
                                                                        ) {
                                                                            handleQuantityChange(
                                                                                item.id,
                                                                                value
                                                                            )
                                                                        }
                                                                    }}
                                                                    className="quantity-input mx-2 text-center"
                                                                />
                                                                <CustomButton
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    className="quantity-btn"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            item.id,
                                                                            item.quantity +
                                                                                1
                                                                        )
                                                                    }
                                                                >
                                                                    <FaPlus size={14} />
                                                                </CustomButton>
                                                            </div>
                                                        </td>
                                                        <td className="align-middle price">
                                                            {item.type ===
                                                            "rent"
                                                                ? parseFloat(
                                                                      item.book
                                                                          ?.rental_price ||
                                                                          item
                                                                              .book
                                                                              ?.price ||
                                                                          0
                                                                  ).toFixed(2)
                                                                : parseFloat(
                                                                      item.book
                                                                          ?.price ||
                                                                          0
                                                                  ).toFixed(
                                                                      2
                                                                  )}{" "}
                                                            EGP
                                                        </td>
                                                        <td className="align-middle price">
                                                            {(item.type ===
                                                            "rent"
                                                                ? parseFloat(
                                                                      item.book
                                                                          ?.rental_price ||
                                                                          item
                                                                              .book
                                                                              ?.price ||
                                                                          0
                                                                  ) *
                                                                  item.quantity
                                                                : parseFloat(
                                                                      item.book
                                                                          ?.price ||
                                                                          0
                                                                  ) *
                                                                  item.quantity
                                                            ).toFixed(2)}{" "}
                                                            EGP
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            <CustomButton
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleRemoveItem(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="remove-btn"
                                                            >
                                                                <FaTrashAlt size={16} />
                                                            </CustomButton>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>

                                        <div className="d-flex justify-content-between mt-4 cart-actions">
                                            <CustomButton
                                                variant="outline-primary"
                                                onClick={() =>
                                                    navigate("/books")
                                                }
                                                className="continue-btn"
                                            >
                                                <FaChevronLeft size={18} className="me-1" />
                                                Continue Shopping
                                            </CustomButton>
                                            <CustomButton
                                                variant="danger"
                                                onClick={handleClearCart}
                                                className="clear-btn"
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
                                        <FaTruck size={24} className="me-2 text-primary" />
                                        <div>
                                            <h6 className="mb-0">
                                                Free Shipping
                                            </h6>
                                            <small>
                                                On orders over 200 EGP
                                            </small>
                                        </div>
                                    </Col>
                                    <Col md={4} className="benefit-item">
                                        <FaShieldAlt size={24} className="me-2 text-primary" />
                                        <div>
                                            <h6 className="mb-0">
                                                Secure Checkout
                                            </h6>
                                            <small>100% Protected</small>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="summary-card">
                            <Card.Body>
                                <h5 className="summary-title mb-3">
                                    Order Summary
                                </h5>

                                <div className="cart-items-summary mb-3">
                                    {cartItems.map(item => (
                                        <div
                                            key={item.id}
                                            className="d-flex justify-content-between mb-2 small summary-item"
                                        >
                                            <span className="text-muted">
                                                {item.book?.title} ({item.type})
                                                × {item.quantity}
                                            </span>
                                            <span className="price">
                                                {(item.type === "rent"
                                                    ? parseFloat(
                                                          item.book
                                                              ?.rental_price ||
                                                              item.book
                                                                  ?.price ||
                                                              0
                                                      ) * item.quantity
                                                    : parseFloat(
                                                          item.book?.price || 0
                                                      ) * item.quantity
                                                ).toFixed(2)}{" "}
                                                EGP
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between mb-2 summary-item">
                                    <span>Subtotal:</span>
                                    <span className="price">
                                        {subtotal.toFixed(2)} EGP
                                    </span>
                                </div>

                                {appliedCoupon ? (
                                    <div className="d-flex justify-content-between mb-2 text-success summary-item">
                                        <span>
                                            Discount ({appliedCoupon.code})
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 ms-2 text-danger remove-coupon-btn"
                                                onClick={removeCoupon}
                                            >
                                                Remove
                                            </Button>
                                        </span>
                                        <span className="price">
                                            -{discount.toFixed(2)} EGP
                                        </span>
                                    </div>
                                ) : (
                                    <div className="coupon-section mb-3">
                                        <Form.Group className="d-flex">
                                            <Form.Control
                                                type="text"
                                                placeholder="Coupon code"
                                                value={couponCode}
                                                onChange={e =>
                                                    setCouponCode(
                                                        e.target.value
                                                    )
                                                }
                                                size="sm"
                                                className="coupon-input"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={applyCoupon}
                                                disabled={
                                                    isApplyingCoupon ||
                                                    !couponCode.trim()
                                                }
                                                size="sm"
                                                className="apply-btn"
                                            >
                                                {isApplyingCoupon
                                                    ? "Applying..."
                                                    : "Apply"}
                                            </Button>
                                        </Form.Group>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mb-2 summary-item">
                                    <span>Tax (10%):</span>
                                    <span className="price">{tax.toFixed(2)} EGP</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2 summary-item">
                                    <span>Shipping:</span>
                                    <span
                                        className={
                                            shippingFee === 0
                                                ? "text-success price"
                                                : "price"
                                        }
                                    >
                                        {shippingFee === 0
                                            ? "FREE"
                                            : `${shippingFee.toFixed(2)} EGP`}
                                    </span>
                                </div>

                                <hr className="my-3" />

                                <div className="d-flex justify-content-between mb-4 total-summary">
                                    <strong>Total:</strong>
                                    <strong className="total-price">
                                        {total.toFixed(2)} EGP
                                    </strong>
                                </div>

                                <div className="payment-methods mb-4">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">
                                            Payment Method
                                        </Form.Label>
                                        <Form.Select
                                            value={selectedPaymentMethod || ''}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="payment-select"
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="cash">Cash on Delivery</option>
                                            <option value="stripe">Credit/Debit Card</option>
                                            <option value="paypal">PayPal</option>
                                        </Form.Select>

                                        <div className="payment-icons mt-2">
                                            <FaCreditCard className="me-2" />
                                            <FaMoneyBillWave className="me-2" />
                                            <FaPaypal className="me-2" />
                                        </div>
                                    </Form.Group>
                                </div>

                                <CustomButton
                                    variant="primary"
                                    className="w-100 checkout-btn mb-3"
                                    onClick={handleOrderNow}
                                    disabled={cartItems.length === 0 || !selectedPaymentMethod || processing}
                                >
                                    {processing ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Processing...
                                        </>
                                    ) : cartItems.length === 0 ? 'Cart is Empty' :
                                        !selectedPaymentMethod ? 'Select Payment Method' : 'Place Order'}
                                </CustomButton>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    )
}

export default CartPage
