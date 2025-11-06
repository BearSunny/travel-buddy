import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import LeafletMap from '../components/map/LeafletMap';
import useUserSync from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth0();
  const { syncStatus } = useUserSync();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Add loading state
  if (isLoading) {
    return (
      <div className="landing-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  const getSyncStatusMessage = () => {
    switch(syncStatus) {
      case 'syncing': return '🔄 Syncing user data...';
      case 'success': return '✅ User synced successfully!';
      case 'error': return '❌ Sync failed - check console';
      default: return '⏳ Ready to sync...';
    }
  };

  if (isAuthenticated) {
    // Authenticated user view - show map interface
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>Travel Map App</h1>
            <div className="header-user">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name || user.email} 
                  className="user-avatar" 
                />
              )}
              <span className="user-name">
                Welcome, {user?.name || user?.email}!
              </span>
              <button 
                onClick={() => logout({ 
                  logoutParams: { returnTo: window.location.origin } 
                })} 
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="app-main">
          <LeafletMap 
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
          />
        </main>
      </div>
    );
  }

  // Non-authenticated user view - original landing page
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-brand">TravelApp</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link signup-link">Sign Up</Link>
        </div>
      </nav>
      
      <div className="landing-content">
        <h1>Discover Your Next Adventure</h1>
        <p>Plan amazing trips with our travel companion app</p>
        
        <div className="cta-buttons">
          <Link to="/signup" className="cta-primary">Get Started</Link>
          <Link to="/login" className="cta-secondary">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;