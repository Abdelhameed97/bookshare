import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }, [user, token]);

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
