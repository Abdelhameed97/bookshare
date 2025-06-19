import React from 'react';
import useAuth from '../hooks/useAuth';
import { logout as apiLogout } from '../api/auth';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await apiLogout(); // Laravel API logout
    } catch (error) {
      console.error("API logout failed", error);
    }

    logout(); // Local logout
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Logout
    </button>
  );
};

export default LogoutButton;
