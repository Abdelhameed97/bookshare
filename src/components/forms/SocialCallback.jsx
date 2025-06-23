// SocialCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SocialCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      navigate("/"); // أو ممكن توجه لـ owner-dashboard لو حبيت
    } else {
      navigate("/login"); // لو مفيش توكن يبقى فيه مشكلة
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
};

export default SocialCallback;
