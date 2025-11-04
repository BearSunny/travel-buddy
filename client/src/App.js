import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import Map from './components/map/Map';

function App() {
  const { user, logout } = useAuth0();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Travel Map App</h1>
        {user && (
          <div className="header-user">
            <img src={user.picture} alt={user.name} className="user-avatar" />
            <span>{user.name}</span>
            <button 
              onClick={() => logout({ returnTo: window.location.origin })}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="app-main">
        <Map 
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
        />
      </main>
    </div>
  );
}

export default App;