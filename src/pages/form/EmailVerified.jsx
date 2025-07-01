import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import "../../style/SocialCallback.css";
import logo from "../../assets/bookshare-logo.png";
import useAuth from "../../hooks/useAuth";
import axios from "axios";

const EmailVerified = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);

      axios
        .get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(res.data);
          navigate("/"); // Go to dashboard or home
        })
        .catch((err) => {
          console.error("Error fetching user after email verification", err);
          navigate("/login");
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
        <p className='text-muted'>Verifying your account...</p>
      </div>
    </div>
  );
};

export default EmailVerified;
