import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import LandingPage from './pages/LandingPage';
import './App.css';

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirectUri: window.location.origin
      }}
    >
      <BrowserRouter>
        <div className="App">
          <LandingPage />
        </div>
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;