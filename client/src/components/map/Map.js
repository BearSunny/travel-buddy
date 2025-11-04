import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useMapsService } from '../../services/mapsService';

const mapContainerStyle = {
  height: '100vh',
  width: '100vw'
};

const center = {
  lat: 48.8566,
  lng: 2.3522
};

export default function Map() {
  const { isAuthenticated, isLoading } = useAuth0();
  const mapsService = useMapsService();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [places, setPlaces] = useState([]);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);

  const fetchNearbyPlaces = useCallback(async () => {
    if (!map || !isAuthenticated || !mapsService?.isReady || !isMapLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const data = await mapsService.getNearbyPlaces(
        center.lat, 
        center.lng, 
        'restaurant', 
        5000
      );
      
      if (data?.results) {
        setPlaces(data.results);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setError('Failed to fetch nearby places. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [map, isAuthenticated, mapsService, isMapLoaded]);

  useEffect(() => {
    if (isMapLoaded) {
      fetchNearbyPlaces();
    }
  }, [fetchNearbyPlaces, isMapLoaded]);

  const handleMarkerClick = (place) => {
    setSelectedMarker(place);
  };

  const handleMapLoad = useCallback((mapInstance) => {
    if (mapInstance && setMap) {
      mapRef.current = mapInstance;
      setMap(mapInstance);
      setIsMapLoaded(true);
    }
  }, []);

  const handleLoadScriptLoad = () => {
    console.log('Google Maps script loaded');
  };

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the map.</div>;
  }

  return (
    <div>
      {error && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: 'red',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
      
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        onLoad={handleLoadScriptLoad}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={handleMapLoad}
        >
          {loading && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Loading places...
            </div>
          )}

          {places.map((place) => (
            <Marker
              key={place.place_id}
              position={{
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }}
              onClick={() => handleMarkerClick(place)}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={{
                lat: selectedMarker.geometry.location.lat,
                lng: selectedMarker.geometry.location.lng
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div style={{ color: 'black' }}>
                <h3>{selectedMarker.name}</h3>
                <p>{selectedMarker.formatted_address}</p>
                {selectedMarker.rating && (
                  <p>Rating: {selectedMarker.rating}/5</p>
                )}
                {selectedMarker.price_level && (
                  <p>Price Level: {'$'.repeat(selectedMarker.price_level)}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}