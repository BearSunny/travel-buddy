import { useEffect, useRef, useCallback, useState } from 'react';
import { getColorForUser, getInitials } from '../utils/avatarGenerator';

export interface CollaborationUser {
  userId: string;
  displayName?: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  joinedAt: string;
}

export interface CollaborationMessage {
  type: 'user_joined' | 'user_left' | 'cursor_move' | 'update' | 'room_state' | 'user_profile';
  userId?: string;
  roomSize?: number;
  displayName?: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  users?: Array<{ userId: string; displayName?: string; avatar?: string }>;
  timestamp: string;
  data?: any;
}

export function useCollaboration(roomId: string, userId: string, userProfile?: { displayName: string; avatar?: string }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [users, setUsers] = useState<Map<string, CollaborationUser>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const messageHandlersRef = useRef<((msg: CollaborationMessage) => void)[]>([]);

  const connect = useCallback(() => {
    if (!roomId || !userId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `ws://localhost:5001/collab?room=${roomId}&userId=${userId}`;
    
    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`Connected to room ${roomId} as ${userId}`);
        setIsConnected(true);
        
        // Send user profile after connection
        if (userProfile) {
          ws.send(JSON.stringify({
            type: 'user_profile',
            userId,
            displayName: userProfile.displayName,
            avatar: userProfile.avatar,
            timestamp: new Date().toISOString(),
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);

          if (message.type === 'room_state') {
            // Populate users map with existing users in room
            setUsers((prev) => {
              const updated = new Map(prev);
              if (message.users && Array.isArray(message.users)) {
                message.users.forEach((user) => {
                  if (user.userId && !updated.has(user.userId)) {
                    updated.set(user.userId, {
                      userId: user.userId,
                      displayName: user.displayName,
                      avatar: user.avatar,
                      joinedAt: message.timestamp,
                    });
                  }
                });
              }
              return updated;
            });
          } else if (message.type === 'user_joined') {
            setUsers((prev) => {
              const updated = new Map(prev);
              if (message.userId) {
                updated.set(message.userId, {
                  userId: message.userId,
                  displayName: message.displayName,
                  avatar: message.avatar,
                  joinedAt: message.timestamp,
                });
              }
              return updated;
            });
          } else if (message.type === 'user_profile') {
            setUsers((prev) => {
              const updated = new Map(prev);
              if (message.userId && updated.has(message.userId)) {
                const user = updated.get(message.userId)!;
                user.displayName = message.displayName;
                user.avatar = message.avatar;
                updated.set(message.userId, user);
              }
              return updated;
            });
          } else if (message.type === 'user_left') {
            setUsers((prev) => {
              const updated = new Map(prev);
              if (message.userId) {
                updated.delete(message.userId);
              }
              return updated;
            });
          } else if (message.type === 'cursor_move') {
            setUsers((prev) => {
              const updated = new Map(prev);
              if (message.userId && updated.has(message.userId)) {
                const user = updated.get(message.userId)!;
                user.cursor = message.cursor;
                updated.set(message.userId, user);
              }
              return updated;
            });
          }

          messageHandlersRef.current.forEach((handler) => handler(message));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from collaboration room');
        setIsConnected(false);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
    }
  }, [roomId, userId, userProfile]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(
    (message: Omit<CollaborationMessage, 'timestamp'>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            ...message,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },
    []
  );

  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      sendMessage({
        type: 'cursor_move',
        cursor: { x, y },
      });
    },
    [sendMessage]
  );

  const onMessage = useCallback((handler: (msg: CollaborationMessage) => void) => {
    messageHandlersRef.current.push(handler);
    return () => {
      messageHandlersRef.current = messageHandlersRef.current.filter((h) => h !== handler);
    };
  }, []);

  useEffect(() => {
    if (roomId && userId) {
      connect();
    }
    return () => disconnect();
  }, [connect, disconnect, roomId, userId]);

  return {
    isConnected,
    users,
    sendMessage,
    broadcastCursor,
    onMessage,
    roomId,
    userId,
  };
}
