import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map events
function MapController({ searchResults, setSelectedPlace }) {
  const map = useMap();

  React.useEffect(() => {
    if (searchResults.length > 0) {
      const bounds = L.latLngBounds(
        searchResults.map(result => [result.lat, result.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [searchResults, map]);

  return null;
}

function LeafletMap({ searchResults, setSearchResults, selectedPlace, setSelectedPlace }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();
      
      const results = data.map(place => ({
        id: place.place_id,
        name: place.display_name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        type: place.type,
        importance: place.importance
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchPlaces();
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Search Bar */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for places..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <button
          onClick={searchPlaces}
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Map */}
      <MapContainer
        ref={mapRef}
        center={[40.7128, -74.0060]} // Default to NYC
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          searchResults={searchResults}
          setSelectedPlace={setSelectedPlace}
        />
        
        {/* Markers for search results */}
        {searchResults.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            eventHandlers={{
              click: () => setSelectedPlace(place)
            }}
          >
            <Popup>
              <div>
                <h3>{place.name}</h3>
                <p>Type: {place.type}</p>
                <p>Coordinates: {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Selected Place Info */}
      {selectedPlace && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <h3>{selectedPlace.name}</h3>
          <p>Type: {selectedPlace.type}</p>
          <button
            onClick={() => setSelectedPlace(null)}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default LeafletMap;