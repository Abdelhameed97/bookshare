import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Alert
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
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import Footer from "../components/HomePage/Footer.jsx";
import '../style/CartPage.css';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
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
            await api.updateCartItem(itemId, { quantity: parsedQuantity });

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
            navigate(`/order-confirmation/${response.data.id}`);
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Checkout Failed',
                text: err.response?.data?.message || 'Unable to process your order',
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
      <Container className="py-5 cart-container">
        {showAlert && (
          <Alert
            variant="success"
            onClose={() => setShowAlert(false)}
            dismissible
          >
            Item removed from your cart!
          </Alert>
        )}

        <div className="d-flex align-items-center mb-4">
          <CustomButton
            variant="outline-primary"
            className="me-3 back-button"
            onClick={() => navigate('/books')}
          >
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
                    {cartItems.map(item => (
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
                            onChange={(e) =>
                              handleQuantityChange(item.id, e.target.value)
                            }
                            className="quantity-input"
                          />
                        </td>
                        <td className="price">
                          {item.price.toFixed(2)} EGP
                        </td>
                        <td className="price">
                          {(item.price * item.quantity).toFixed(2)} EGP
                        </td>
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
                    onClick={() => navigate('/books')}
                  >
                    <ChevronLeft size={18} className="me-1" />
                    Continue Shopping
                  </CustomButton>
                  <CustomButton variant="light" className="update-cart-btn">
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