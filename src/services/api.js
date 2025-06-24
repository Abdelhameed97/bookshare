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
    // General HTTP methods
    get: (url) => api.get(url),
    post: (url, data, config = {}) => api.post(url, data, config),
    put: (url, data) => api.put(url, data),
    delete: (url) => api.delete(url),

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
    updateCartItem: (cartItemId, quantity) => {
        return api.put(`/cart/${cartItemId}`, {
            quantity: parseInt(quantity, 10) 
        });
    },
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
    getOrders: () => api.get('/orders'),
    createOrder: (orderData) => api.post('/orders', orderData),
    getOrderDetails: (orderId) => api.get(`/orders/${orderId}`)
        .catch(err => {
            if (err.response?.status === 500 && err.response?.data?.error?.includes('No query results')) {
                throw new Error('Order not found or already deleted');
            }
            throw err;
        }),
    cancelOrder: (orderId) => api.delete(`/orders/${orderId}`)
        .catch(err => {
            if (err.response?.status === 500 && err.response?.data?.error?.includes('No query results')) {
                throw new Error('Order not found or already cancelled');
            }
            throw err;
        }),

    // Payment Endpoints
    createPayment: (paymentData) => api.post('/payments', paymentData),
    getPayment: (paymentId) => api.get(`/payments/${paymentId}`),
    getOrderPayment: (orderId) => api.get(`/orders/${orderId}/payment`).catch(err => {
        if (err.response?.status === 404) {
            return { data: null };
        }
        throw err;
    }),
    updatePayment: (paymentId, data) => api.put(`/payments/${paymentId}`, data),
    getUserPayments: () => api.get('/payments'),

    // Coupon Endpoints
    applyCoupon: (couponCode) => api.post('/coupons/apply', { code: couponCode }),

    // Book Endpoints
    getBooks: () => api.get('/books'),
    getBookDetails: (bookId) => api.get(`/books/${bookId}`),
    addBook: (bookData) => api.post('/books', bookData),
    updateBook: (bookId, bookData) => api.put(`/books/${bookId}`, bookData),
    deleteBook: (bookId) => api.delete(`/books/${bookId}`),

    // Category Endpoints
    getCategories: () => api.get('/categories'),

    // Notification Endpoints
    getNotifications: () => api.get('/notifications'),

    // User Endpoints
    updateUser: (userId, userData) => {
        console.log('API Service - updateUser called with:', { userId, userData });
        return api.put(`/users/${userId}`, userData);
    },

    // Auth Endpoints
    login: (credentials) => api.post('/login', credentials),
    register: (userData) => api.post('/register', userData),
    logout: () => api.post('/logout'),
    getUser: () => api.get('/user'),
};

export default apiService;