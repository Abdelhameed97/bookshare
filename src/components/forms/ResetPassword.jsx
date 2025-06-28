import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');

  // Extract token from URL (e.g., /reset-password?token=abc123)
  const token = new URLSearchParams(window.location.search).get('token');
  // const gmail = new URLSearchParams(window.location.search).get('email')

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Sending reset password request with:');
    console.log({
      // gmail,
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    });

    try {
      const response = await axios.post('http://localhost:8000/api/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMessage('Password reset successful!');
      console.log(response.data);
    } catch (error) {
      console.error('❌ Reset failed:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        console.log('Validation Errors:', error.response.data.errors);
      }
      setMessage('Reset failed. Please check the console for details.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={passwordConfirmation}
            required
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
