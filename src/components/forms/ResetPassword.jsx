import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");

  // ✅ استدعاء csrf في أول تحميل للصفحة
  useEffect(() => {
    axios.get('/sanctum/csrf-cookie');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Error occurred.");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />

        <input
          type="password"
          placeholder="Confirm Password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        /><br />

        <button type="submit">Reset</button>
      </form>
    </div>
  );
};

export default ResetPassword;
