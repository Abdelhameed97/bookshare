import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Spinner } from "react-bootstrap"; // or use your own spinner
import "../style/SocialCallback.css"; // Ensure you have this CSS file for styling
import logo from "../assets/bookshare-logo.png";
import useAuth from "../hooks/useAuth";
import axios from "axios";

const SocialCallback = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove #
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (token) {
      // Save token locally
      setToken(token);

      // Fetch user data using token
      axios
        .get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(res.data);
          navigate("/"); // redirect to home after login
        })
        .catch((err) => {
          console.error("Error fetching user after social login", err);
          navigate("/login"); // fallback
        });
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className='text-center mt-5'>
      Logging you in with social account...
    </div>
  );
};

export default SocialCallback;
