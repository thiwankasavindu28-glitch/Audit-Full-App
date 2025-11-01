import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading screen while we check for a token
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, saving the page they were on
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in, show the component they asked for
  return children;
};

export default ProtectedRoute;