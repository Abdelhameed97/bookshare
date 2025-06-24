import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8000/api", // Laravel API base URL
})

// ✅ Automatically attach token to every request if exists
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 🧠 Auth endpoints
export const login = data => api.post("/login", data)
export const register = data => api.post("/register", data)
export const logout = () => api.post("/logout") // No need to pass token manually
