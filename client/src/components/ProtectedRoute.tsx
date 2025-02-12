import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if token exists and is valid
  const token = localStorage.getItem('token');
  
  // If no token, redirect to signin
  if (!token) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // If token exists, render the children (protected route)
  return <>{children}</>;
};
