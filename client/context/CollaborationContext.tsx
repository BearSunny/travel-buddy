'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCollaboration, CollaborationUser, CollaborationCallbacks } from '../hooks/useCollaboration';
import { useUser } from '@auth0/nextjs-auth0/client';

interface CollaborationContextType {
  tripId: string | null;
  roomId: string | null; // Keep for backward compatibility (same as tripId)
  userId: string | null;
  users: Map<string, CollaborationUser>;
  isConnected: boolean;
  joinTripRoom: (tripId: string) => void;
  leaveRoom: () => void;
  generateShareLink: () => string;
  broadcastCursor: (x: number, y: number) => void;
  broadcastEvent: (type: 'event_added' | 'event_updated' | 'event_deleted', eventData: any) => void;
  setEventCallbacks: (callbacks: CollaborationCallbacks) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [tripId, setTripId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [eventCallbacks, setEventCallbacks] = useState<CollaborationCallbacks>({});
  const { user } = useUser();

  // Use Auth0 user sub as userId, or generate temp ID if not logged in
  useEffect(() => {
    if (user?.sub) {
      console.log('[CollaborationContext] Using Auth0 user ID:', user.sub);
      setUserId(user.sub);
    } else {
      // Fallback to temp ID if not logged in (shouldn't happen if auth is enforced)
      const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[CollaborationContext] No Auth0 user, using temp ID:', tempUserId);
      setUserId(tempUserId);
    }
  }, [user]);

  const collaboration = useCollaboration(
    tripId || '',
    userId || '',
    eventCallbacks
  );

  const joinTripRoom = useCallback((newTripId: string) => {
    console.log(`[CollaborationContext] Joining trip room: ${newTripId}`);
    setTripId(newTripId);
    
    // Update URL to include trip parameter
    const url = new URL(window.location.href);
    url.searchParams.set('trip', newTripId);
    window.history.replaceState({}, '', url.toString());
  }, []);

  const leaveRoom = useCallback(() => {
    console.log(`[CollaborationContext] Leaving room`);
    setTripId(null);
    
    // Remove trip parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('trip');
    window.history.replaceState({}, '', url.toString());
  }, []);

  const generateShareLink = useCallback(() => {
    if (!tripId) {
      console.warn('[CollaborationContext] No tripId to share');
      return '';
    }
    const shareUrl = `${window.location.origin}?trip=${tripId}`;
    console.log(`[CollaborationContext] Generated share link: ${shareUrl}`);
    return shareUrl;
  }, [tripId]);

  return (
    <CollaborationContext.Provider
      value={{
        tripId,
        roomId: tripId, // roomId is just an alias for tripId now
        userId,
        users: collaboration.users,
        isConnected: collaboration.isConnected,
        joinTripRoom,
        leaveRoom,
        generateShareLink,
        broadcastCursor: collaboration.broadcastCursor,
        broadcastEvent: collaboration.broadcastEvent,
        setEventCallbacks,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaborationContext() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaborationContext must be used within CollaborationProvider');
  }
  return context;
}
