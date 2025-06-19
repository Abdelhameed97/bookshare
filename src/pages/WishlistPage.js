import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    ButtonGroup,
    Dropdown,
    Badge,
    Spinner,
    Alert
} from 'react-bootstrap';
import {
    Heart,
    Share,
    ShoppingCart,
    Filter,
    X,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import { useWishlist } from '../hooks/useWishlist';
import '../style/WishlistPage.css';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const WishlistPage = () => {
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('all');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();

    const {
        wishlistItems,
        wishlistCount,
        loading,
        error,
        removeItem,
        moveToCart,
        moveAllToCart
    } = useWishlist();

    const filteredItems = wishlistItems.filter(item => {
        if (!item.book) return false;
        if (filterBy === 'in-stock') return item.book.status === 'available';
        if (filterBy === 'out-of-stock') return item.book.status !== 'available';
        return true;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortBy === 'price-low') return parseFloat(a.book.price) - parseFloat(b.book.price);
        if (sortBy === 'price-high') return parseFloat(b.book.price) - parseFloat(a.book.price);
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const handleRemoveItem = async (itemId) => {
        const { success, error } = await removeItem(itemId);
        setAlertMessage(success ? 'Item removed from wishlist' : error);
        setShowAlert(true);
    };

    const handleMoveToCart = async (itemId) => {
        const { success, error } = await moveToCart(itemId);
        setAlertMessage(success ? 'Item moved to cart' : error);
        setShowAlert(true);
    };

    const handleMoveAllToCart = async () => {
        try {
            const result = await moveAllToCart();
            if (result?.success) {
                setAlertMessage(`${result.count || wishlistCount} items moved to cart`);
                setShowAlert(true);
            } else {
                setAlertMessage(result?.error || 'Failed to move items to cart');
                setShowAlert(true);
            }
        } catch (err) {
            setAlertMessage('An error occurred while moving items to cart');
            setShowAlert(true);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading your wishlist...</p>
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

            <Container className="wishlist-container py-5">
                {showAlert && (
                    <Alert
                        variant={alertMessage.includes('error') ? 'danger' : 'success'}
                        onClose={() => setShowAlert(false)}
                        dismissible
                        className="mt-3"
                    >
                        {alertMessage}
                    </Alert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <CustomButton
                            variant="outline-primary"
                            className="me-3"
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft size={20} className="me-1" />
                            Back
                        </CustomButton>
                        <Title>
                            My Wishlist <Badge bg="primary" className="ms-2">{wishlistCount}</Badge>
                        </Title>
                    </div>

                    <div className="d-flex">
                        <Dropdown className="me-2">
                            <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
                                <Filter size={16} className="me-1" />
                                {filterBy === 'all' ? 'All Items' : filterBy === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setFilterBy('all')}>All Items</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterBy('in-stock')}>In Stock</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterBy('out-of-stock')}>Out of Stock</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
                                Sort: {sortBy === 'recent' ? 'Recently Added' : sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setSortBy('recent')}>Recently Added</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('price-low')}>Price: Low to High</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('price-high')}>Price: High to Low</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {sortedItems.length > 0 ? (
                    <>
                        <CustomButton
                            variant="primary"
                            className="mb-4"
                            onClick={handleMoveAllToCart}
                            disabled={!wishlistItems.some(item => item.book?.status === 'available')}
                        >
                            <ShoppingCart size={18} className="me-1" />
                            Move All Available to Cart
                        </CustomButton>

                        <Row className="g-4">
                            {sortedItems.map(item => (
                                <Col key={item.id} lg={3} md={4} sm={6}>
                                    <Card className="wishlist-card h-100">
                                        <div className="wishlist-card-img-container">
                                            <Card.Img
                                                variant="top"
                                                src={item.book.images?.[0] || 'https://via.placeholder.com/300x450'}
                                                alt={item.book.title}
                                                className="wishlist-card-img"
                                            />
                                            <button
                                                className="wishlist-heart-btn"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <Heart size={20} className="text-danger" fill="currentColor" />
                                            </button>
                                            {item.book.status !== 'available' && (
                                                <div className="out-of-stock-badge">
                                                    <X size={14} className="me-1" /> Out of Stock
                                                </div>
                                            )}
                                        </div>
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="wishlist-item-title">
                                                {item.book.title}
                                            </Card.Title>
                                            <Card.Text className="text-muted mb-2">
                                                {item.book.author || 'Unknown Author'}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center mt-auto">
                                                <h5 className="mb-0 text-primary">
                                                    {parseFloat(item.book.price).toFixed(2)} EGP
                                                </h5>
                                                <ButtonGroup>
                                                    <CustomButton
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        title="Share"
                                                        className="me-1"
                                                    >
                                                        <Share size={16} />
                                                    </CustomButton>
                                                    {item.book.status === 'available' && (
                                                        <CustomButton
                                                            variant="primary"
                                                            size="sm"
                                                            title="Add to Cart"
                                                            onClick={() => handleMoveToCart(item.id)}
                                                        >
                                                            <ShoppingCart size={16} />
                                                        </CustomButton>
                                                    )}
                                                </ButtonGroup>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                ) : (
                    <div className="text-center py-5 empty-wishlist">
                        <Heart size={48} className="text-muted mb-3" />
                        <h4>Your Wishlist is Empty</h4>
                        <p className="text-muted mb-4">
                            {filterBy === 'all'
                                ? "You haven't added any items to your wishlist yet"
                                : filterBy === 'in-stock'
                                    ? "You don't have any in-stock items in your wishlist"
                                    : "You don't have any out-of-stock items in your wishlist"}
                        </p>
                        <CustomButton
                            variant="primary"
                            onClick={() => navigate('/books')}
                        >
                            Browse Books
                        </CustomButton>
                    </div>
                )}
            </Container>

            <Footer />
        </>
    );
};

export default WishlistPage;