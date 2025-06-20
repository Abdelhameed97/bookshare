import axios from "axios"

const API_BASE_URL = "http://127.0.0.1:8000/api"

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
})

// Add auth token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

const apiService = {
    // Cart Endpoints
    getCart: () => api.get("/cart"),
    addToCart: (bookId, quantity = 1) =>
        api.post("/cart", { book_id: bookId, quantity }),
    updateCartItem: (cartItemId, quantity) =>
        api.post(`/cart/${cartItemId}`, { quantity }),
    removeCartItem: cartItemId => api.delete(`/cart/${cartItemId}`),

    // Wishlist Endpoints
    getWishlist: () =>
        api
            .get("/wishlist")
            .then(response => {
                if (!response.data || !Array.isArray(response.data.data)) {
                    throw new Error("Invalid wishlist data format")
                }
                return response
            })
            .catch(error => {
                console.error("Wishlist API Error:", error)
                throw error
            }),
    addToWishlist: bookId => api.post("/wishlist", { book_id: bookId }),
    removeWishlistItem: wishlistItemId =>
        api.delete(`/wishlist/${wishlistItemId}`),
    moveToCart: wishlistItemId =>
        api.post(`/wishlist/${wishlistItemId}/move-to-cart`),
    moveAllToCart: () => api.post("/wishlist/move-all-to-cart"),

    // Order Endpoints
    getOrders: () =>
        api
            .get("/order")
            .then(response => {
                if (!response.data || !Array.isArray(response.data.data)) {
                    throw new Error("Invalid orders data format")
                }
                return response
            })
            .catch(error => {
                console.error("Orders API Error:", error)
                throw error
            }),
    getOrderDetails: orderId =>
        api
            .get(`/order/${orderId}`)
            .then(response => {
                if (!response.data) {
                    throw new Error("Invalid order data format")
                }
                return response
            })
            .catch(error => {
                console.error("Order Details API Error:", error)
                throw error
            }),
    createOrder: orderData => api.post("/order", orderData),
    cancelOrder: orderId => api.delete(`/order/${orderId}`),

    // Book Endpoints
    getBooks: () => api.get("/books"),
    getBookDetails: bookId => api.get(`/books/${bookId}`),

    // Auth Endpoints
    login: credentials => api.post("/login", credentials),
    register: userData => api.post("/register", userData),
    logout: () => api.post("/logout"),
    getUser: () => api.get("/user"),
}

export default apiService
