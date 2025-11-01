import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auditor, setAuditor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This runs when the app loads to check if we're already logged in
    const loadAuditor = async () => {
      if (token) {
        try {
          // Use the '/api/auth/me' route we built in the backend
          const { data } = await api.get('/auth/me');
          setAuditor(data);
        } catch (error) {
          console.error('Failed to fetch auditor, token is invalid', error);
          // If the token is bad, log them out
          logout();
        }
      }
      setLoading(false);
    };
    loadAuditor();
  }, [token]);

  const login = async (email, password) => {
    try {
      // 1. Call the backend login endpoint
      const { data } = await api.post('/auth/login', { email, password });
      
      // 2. Set the token and auditor info in state
      setToken(data.token);
      setAuditor(data);
      
      // 3. Save the token in local storage so it persists
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error('Login failed', error);
      throw error; // Let the login page handle the error display
    }
  };

  const logout = () => {
    setToken(null);
    setAuditor(null);
    localStorage.removeItem('authToken');
  };

  const authValue = {
    auditor,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {/* Don't render the app until we've checked for a user */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// This is a custom hook to easily access auth info from any component
export const useAuth = () => {
  return useContext(AuthContext);
};