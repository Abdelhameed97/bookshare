import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, //
});

// ✅ Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = "application/json"; // مهم جدًا
  return config;
});

export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);
export const logout = () => api.post("/logout");
export const getUser = () => api.get("/user");

export default api;
