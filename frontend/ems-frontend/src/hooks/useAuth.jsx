import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on first render
  useEffect(() => {
    const token = localStorage.getItem("ems_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/protected")
      .then((res) => {
        setUser(res.data.user || null);
      })
      .catch(() => {
        localStorage.removeItem("ems_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    localStorage.setItem("ems_token", token);
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("ems_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
