import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginPage from '../../pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return isAuthenticated ? children : <LoginPage />;
};

export default ProtectedRoute;