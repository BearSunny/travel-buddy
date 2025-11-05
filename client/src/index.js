import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from './Router';
import { Auth0ProviderWithHistory } from './context/Auth0Context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0ProviderWithHistory>
      <AppRouter />
    </Auth0ProviderWithHistory>
  </React.StrictMode>
);