import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import logo from "../assets/bookshare-logo.png";
import "../styles/SocialCallback.css"; // Import your CSS for styling
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
  }, [navigate, setUser, setToken]);

  return (
    <div className='callback-container d-flex flex-column align-items-center justify-content-center vh-100'>
      <div className='callback-box text-center p-4 shadow-sm rounded'>
        <Spinner animation='border' variant='primary' className='mb-3' />
        <img src={logo} alt='BookShare Logo' width={200} />
        <h5>Welcome to BookShare</h5>
        <p className='text-muted'>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default SocialCallback;
