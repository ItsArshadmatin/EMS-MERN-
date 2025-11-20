// axios setup 
// src/api/axios.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ems_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
