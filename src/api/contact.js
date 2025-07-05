import api from "./auth"; // بيستخدم axios اللي فيه التوكين

export const sendContactMessage = (data) => api.post("/contact", data);
