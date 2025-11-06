import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

const useUserSync = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user && syncStatus === 'idle') {
        setSyncStatus('syncing');
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
              scope: "openid profile email"
            }
          });
          
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              auth0_id: user.sub,
              email: user.email,
              display_name: user.name,
              avatar: user.picture
            })
          });

          if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
          }

          const userData = await response.json();
          console.log('User synced successfully:', userData);
          setSyncStatus('success');
        } catch (error) {
          console.error('User sync failed:', error);
          setSyncStatus('error');
        }
      }
    };

    syncUser();
  }, [isAuthenticated, user, getAccessTokenSilently, syncStatus]);

  return { syncStatus, isAuthenticated };
};

export default useUserSync;