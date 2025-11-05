import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/auth.css';

const SignupPage = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleSignup = async () => {
    await loginWithRedirect({
      screen_hint: 'signup',
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join Travel Map App</h1>
        <p>Create an account to start exploring</p>
        
        <button 
          className="auth-button" 
          onClick={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Sign Up with Auth0'}
        </button>

        <p className="auth-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;