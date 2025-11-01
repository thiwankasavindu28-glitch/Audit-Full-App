import axios from 'axios';

// This is the base URL of your backend server
// It uses the VITE_API_URL from Vercel in production,
// or defaults to your local server for development.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// This "interceptor" runs before every API request
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;