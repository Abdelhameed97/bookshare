import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request config:", config);
    return config;
});

api.interceptors.response.use(
    response => {
        console.log("API Response:", response);
        return response;
    },
    error => {
        console.error("API Error:", error);
        console.error("Error details:", error.response?.data);
        return Promise.reject(error);
    }
);

const apiService = {
    // Cart Endpoints
    getCart: () => api.get('/cart'),

    addToCart: (bookId, data) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) throw new Error('User not logged in');

        const payload = {
            book_id: bookId,
            type: data.type, 
            quantity: 1,     
            user_id: user.id
        };

        console.log("Sending to cart:", payload);
        return api.post('/cart', payload);
    },

    updateCartItem: (cartItemId, quantity) => api.post(`/cart/${cartItemId}`, { quantity }),
    removeCartItem: (cartItemId) => api.delete(`/cart/${cartItemId}`),

    // Wishlist Endpoints
    getWishlist: () => api.get('/wishlist'),

    addToWishlist: (bookId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) throw new Error('User not logged in');

        return api.post('/wishlist', {
            book_id: bookId,
            user_id: user.id
        });
    },

    removeWishlistItem: (wishlistItemId) => api.delete(`/wishlist/${wishlistItemId}`),
    moveToCart: (wishlistItemId) => api.post(`/wishlist/${wishlistItemId}/move-to-cart`),
    moveAllToCart: () => api.post('/wishlist/move-all-to-cart'),

    // Order Endpoints
    getOrders: () => api.get('/order'),
    getOrderDetails: (orderId) => api.get(`/order/${orderId}`),
    createOrder: (orderData) => api.post('/order', orderData),
    cancelOrder: (orderId) => api.delete(`/order/${orderId}`),

    // Book Endpoints
    getBooks: () => api.get('/books'),
    getBookDetails: (bookId) => api.get(`/books/${bookId}`),

    // Auth Endpoints
    login: (credentials) => api.post('/login', credentials),
    register: (userData) => api.post('/register', userData),
    logout: () => api.post('/logout'),
    getUser: () => api.get('/user'),
};

export default apiService;
