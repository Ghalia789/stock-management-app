import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // If no token, redirect to /login
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component
  return children;
};

export default PrivateRoute;