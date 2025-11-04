import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/auth.css';

const LoginPage = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Travel Map App</h1>
        <p>Explore the world with our interactive map</p>
        
        <button 
          className="auth-button" 
          onClick={() => loginWithRedirect()}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login with Auth0'}
        </button>

        <p className="auth-link">
          Don't have an account? Sign up during login
        </p>
      </div>
    </div>
  );
};

export default LoginPage;