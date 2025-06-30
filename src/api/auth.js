// api/auth.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api", // خليها دايناميكية من .env
  withCredentials: true, // مهم جدًا ليرسل الكوكيز بين الفرونت والبك
});

// ✅ Automatically attach Authorization token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = "application/json";
  return config;
});

// Auth APIs
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);
export const logout = () => api.post("/logout");
export const getUser = () => api.get("/user");

export default api;
