import React, { useState } from 'react';
import { Container, Row, Col, Card, ButtonGroup, Dropdown, Badge } from 'react-bootstrap';
import { Heart, Share, Plus, Trash2, ShoppingCart, Filter, Check, Truck, X } from 'lucide-react';
import Title from '../components/shared/Title';
import CustomButton from '../components/shared/CustomButton';
import '../style/WishlistPage.css';
import Navbar from '../components/HomePage/Navbar';
import Footer from "../components/HomePage/Footer.jsx";

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            title: 'Atomic Habits',
            author: 'James Clear',
            price: 89.99,
            image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg',
            inStock: true,
            rating: 4.8,
            liked: true
        },
        {
            id: 2,
            title: 'The Psychology of Money',
            author: 'Morgan Housel',
            price: 75.99,
            image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg',
            inStock: false,
            rating: 4.7,
            liked: true
        },
        {
            id: 3,
            title: 'Deep Work',
            author: 'Cal Newport',
            price: 85.50,
            image: 'https://m.media-amazon.com/images/I/71tbalAHYCL._AC_UF1000,1000_QL80_.jpg',
            inStock: true,
            rating: 4.5,
            liked: true
        },
        {
            id: 4,
            title: 'Digital Minimalism',
            author: 'Cal Newport',
            price: 79.99,
            image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg',
            inStock: true,
            rating: 4.3,
            liked: true
        }
    ]);

    const [sortBy, setSortBy] = useState('Recently Added');
    const [filterBy, setFilterBy] = useState('All Items');

    const toggleLike = (id) => {
        setWishlistItems(wishlistItems.map(item =>
            item.id === id ? { ...item, liked: !item.liked } : item
        ));
    };

    const removeItem = (id) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== id));
    };

    const moveAllToCart = () => {
        alert('All available items moved to cart!');
        // Logic to move items to cart
    };

    return (
        <>
            <Navbar />

            <Container className="wishlist-container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Title>
                        My Wishlist <Badge bg="primary" className="ms-2">{wishlistItems.filter(item => item.liked).length}</Badge>
                    </Title>

                    <div className="d-flex">
                        <Dropdown className="me-2">
                            <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
                                <Filter size={16} className="me-1" /> {filterBy}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setFilterBy('All Items')}>All Items</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterBy('In Stock')}>In Stock</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterBy('Out of Stock')}>Out of Stock</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
                                Sort: {sortBy}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setSortBy('Recently Added')}>Recently Added</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('Price: Low to High')}>Price: Low to High</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('Price: High to Low')}>Price: High to Low</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSortBy('Highest Rated')}>Highest Rated</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {wishlistItems.filter(item => item.liked).length > 0 ? (
                    <>
                        <CustomButton
                            variant="primary"
                            className="mb-4"
                            onClick={moveAllToCart}
                        >
                            <ShoppingCart size={18} className="me-1" />
                            Move All to Cart
                        </CustomButton>

                        <Row className="g-4">
                            {wishlistItems
                                .filter(item => item.liked)
                                .map(item => (
                                    <Col key={item.id} lg={3} md={4} sm={6}>
                                        <Card className="wishlist-card h-100">
                                            <div className="wishlist-card-img-container">
                                                <Card.Img
                                                    variant="top"
                                                    src={item.image}
                                                    className="wishlist-card-img"
                                                />
                                                <button
                                                    className="wishlist-heart-btn"
                                                    onClick={() => toggleLike(item.id)}
                                                >
                                                    {item.liked ? (
                                                        <Heart size={20} className="text-danger" fill="currentColor" />
                                                    ) : (
                                                        <Heart size={20} className="text-muted" />
                                                    )}
                                                </button>
                                                {!item.inStock && (
                                                    <div className="out-of-stock-badge">
                                                        <X size={14} className="me-1" /> Out of Stock
                                                    </div>
                                                )}
                                                <div className="rating-badge">
                                                    ⭐ {item.rating}
                                                </div>
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <Card.Title className="wishlist-item-title">
                                                    {item.title}
                                                </Card.Title>
                                                <Card.Text className="text-muted mb-2">
                                                    By {item.author}
                                                </Card.Text>
                                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                                    <h5 className="mb-0 text-primary">
                                                        {item.price.toFixed(2)} EGP
                                                    </h5>
                                                    <ButtonGroup>
                                                        <CustomButton
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            title="Share"
                                                        >
                                                            <Share size={16} />
                                                        </CustomButton>
                                                        <CustomButton
                                                            variant="outline-danger"
                                                            size="sm"
                                                            title="Remove"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </CustomButton>
                                                        {item.inStock && (
                                                            <CustomButton
                                                                variant="primary"
                                                                size="sm"
                                                                title="Add to Cart"
                                                            >
                                                                <Plus size={16} />
                                                            </CustomButton>
                                                        )}
                                                    </ButtonGroup>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            }
                        </Row>
                    </>
                ) : (
                    <div className="text-center py-5 empty-wishlist">
                        <Heart size={48} className="text-muted mb-3" />
                        <h4>Your Wishlist is Empty</h4>
                        <p className="text-muted mb-4">
                            Save your favorite items here to keep track of them
                        </p>
                        <CustomButton variant="primary">
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