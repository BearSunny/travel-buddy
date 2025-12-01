'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCollaboration, CollaborationUser } from '../hooks/useCollaboration';

interface CollaborationContextType {
  roomId: string | null;
  userId: string | null;
  users: Map<string, CollaborationUser>;
  isConnected: boolean;
  initializeRoom: (roomId: string, userId: string) => void;
  generateShareLink: () => string;
  broadcastCursor: (x: number, y: number) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Read from URL on mount and initialize if needed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let urlRoom = params.get('room');

    // Generate room if not in URL
    if (!urlRoom) {
      urlRoom = `room_${Date.now()}`;
      const newUrl = `${window.location.pathname}?room=${urlRoom}`;
      window.history.replaceState({}, '', newUrl);
    }

    // Each user generates their own unique userId
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setRoomId(urlRoom);
    setUserId(newUserId);
  }, []);

  const collaboration = useCollaboration(
    roomId || '',
    userId || ''
  );

  const initializeRoom = (newRoomId: string, newUserId: string) => {
    setRoomId(newRoomId);
    setUserId(newUserId);
    const newUrl = `${window.location.pathname}?room=${newRoomId}`;
    window.history.replaceState({}, '', newUrl);
  };

  const generateShareLink = () => {
    if (!roomId) return '';
    return `${window.location.origin}?room=${roomId}`;
  };

  return (
    <CollaborationContext.Provider
      value={{
        roomId,
        userId,
        users: collaboration.users,
        isConnected: collaboration.isConnected,
        initializeRoom,
        generateShareLink,
        broadcastCursor: collaboration.broadcastCursor,
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
