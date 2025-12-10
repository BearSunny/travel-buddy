import { useEffect, useRef, useCallback, useState } from 'react';
import { generateGuestName } from '@/utils/avatarGenerator';

export interface CollaborationUser {
  displayName: string;
  avatar?: string | null;
}

export interface CollaborationMessage {
  type: 'user_joined' | 'user_left' | 'cursor_move' | 'update' | 'room_state' | 'user_profile' | 'event_added' | 'event_updated' | 'event_deleted';
  userId?: string;
  roomSize?: number;
  displayName?: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  users?: Array<{ userId: string; displayName?: string; avatar?: string }>;
  timestamp: string;
  data?: any;
  tripId?: string;
  event?: any;
  eventId?: string;
}

export interface CollaborationCallbacks {
  onEventAdded?: (event: any) => void;
  onEventUpdated?: (event: any) => void;
  onEventDeleted?: (eventId: string) => void;
}

export function useCollaboration(roomId: string, userId: string, callbacks?: CollaborationCallbacks) {
  const wsRef = useRef<WebSocket | null>(null);
  const [users, setUsers] = useState<Map<string, CollaborationUser>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const effectRunCountRef = useRef(0);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    effectRunCountRef.current += 1;
    const effectId = effectRunCountRef.current;
    const timestamp = new Date().toISOString();
    
    console.log(`[useCollaboration][Effect #${effectId}] Effect triggered at ${timestamp}`);
    
    // Don't connect if roomId or userId are empty
    if (!roomId || !userId) {
      console.log(`[useCollaboration][Effect #${effectId}] Waiting for roomId and userId... (roomId: "${roomId}", userId: "${userId}")`);
      return;
    }

    console.log(`[useCollaboration][Effect #${effectId}] Creating WebSocket connection to room: ${roomId} as ${userId}`);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001';
    const fullUrl = `${wsUrl}/collab?room=${roomId}&userId=${userId}`;
    console.log(`[useCollaboration][Effect #${effectId}] WebSocket URL: ${fullUrl}`);
    
    const ws = new WebSocket(fullUrl);
    wsRef.current = ws;
    
    console.log(`[useCollaboration][Effect #${effectId}] WebSocket instance created, readyState: ${ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);

    ws.onopen = () => {
      const openTimestamp = new Date().toISOString();
      console.log(`[useCollaboration][Effect #${effectId}][onopen] ✅ Connected to room ${roomId} at ${openTimestamp}`);
      console.log(`[useCollaboration][Effect #${effectId}][onopen] WebSocket readyState: ${ws.readyState}`);
      console.log(`[useCollaboration][Effect #${effectId}][onopen] wsRef.current exists: ${!!wsRef.current}`);
      
      setIsConnected(true);

      // IMPORTANT: Add self to users Map immediately
      const displayName = generateGuestName(userId);
      setUsers(new Map([[userId, { displayName, avatar: null }]]));
      console.log(`[useCollaboration][Effect #${effectId}][onopen] 👤 Added self to users Map: ${displayName} (userId: ${userId})`);
      console.log(`[useCollaboration][Effect #${effectId}][onopen] Current users Map size: 1`);

      // Send user profile to others
      const profileMessage = {
        type: 'user_profile',
        displayName,
        avatar: null
      };
      console.log(`[useCollaboration][Effect #${effectId}][onopen] 📤 Sending user_profile:`, profileMessage);
      ws.send(JSON.stringify(profileMessage));
      console.log(`[useCollaboration][Effect #${effectId}][onopen] ✅ user_profile sent to room`);
    };

    ws.onmessage = (event) => {
      const receiveTimestamp = new Date().toISOString();
      console.log(`[useCollaboration][Effect #${effectId}][onmessage] 📥 Raw message received at ${receiveTimestamp}:`, event.data);
      
      try {
        const message = JSON.parse(event.data);
        console.log(`[useCollaboration][Effect #${effectId}][onmessage] ✅ Parsed message type: ${message.type}`, message);

        if (message.type === 'room_state') {
          console.log(`[useCollaboration][Effect #${effectId}][room_state] 📊 Room state received:`);
          console.log(`[useCollaboration][Effect #${effectId}][room_state]   - roomSize: ${message.roomSize}`);
          console.log(`[useCollaboration][Effect #${effectId}][room_state]   - users array length: ${message.users?.length || 0}`);
          console.log(`[useCollaboration][Effect #${effectId}][room_state]   - users:`, message.users);
          
          // Add other users to the Map (self already added in onopen)
          setUsers(prevUsers => {
            console.log(`[useCollaboration][Effect #${effectId}][room_state] Current users Map size before update: ${prevUsers.size}`);
            const newUsers = new Map(prevUsers); // Keep self
            
            if (message.users && Array.isArray(message.users)) {
              message.users.forEach((user: any) => {
                const userDisplayName = user.displayName || generateGuestName(user.userId);
                newUsers.set(user.userId, {
                  displayName: userDisplayName,
                  avatar: user.avatar
                });
                console.log(`[useCollaboration][Effect #${effectId}][room_state]   ➕ Added user: ${userDisplayName} (${user.userId})`);
              });
            }
            
            console.log(`[useCollaboration][Effect #${effectId}][room_state] 📊 Updated users Map size: ${newUsers.size}`);
            console.log(`[useCollaboration][Effect #${effectId}][room_state] 📊 All users:`, Array.from(newUsers.entries()));
            return newUsers;
          });
        }

        if (message.type === 'user_joined') {
          console.log(`[useCollaboration][Effect #${effectId}][user_joined] 👋 User joined event:`, message);
          console.log(`[useCollaboration][Effect #${effectId}][user_joined]   - userId: ${message.userId}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_joined]   - displayName: ${message.displayName}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_joined]   - roomSize: ${message.roomSize}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_joined]   - Is self?: ${message.userId === userId}`);
          
          // Don't add self again
          if (message.userId !== userId) {
            setUsers(prev => {
              const next = new Map(prev);
              // Defensive: generate displayName if missing
              const displayName = message.displayName || generateGuestName(message.userId);
              next.set(message.userId, {
                displayName,
                avatar: message.avatar
              });
              console.log(`[useCollaboration][Effect #${effectId}][user_joined] ➕ Added user to Map: ${displayName}`);
              console.log(`[useCollaboration][Effect #${effectId}][user_joined] 📊 Total users: ${next.size}`);
              return next;
            });
          } else {
            console.log(`[useCollaboration][Effect #${effectId}][user_joined] ⏭️ Skipping self-add`);
          }
        }

        if (message.type === 'user_profile') {
          console.log(`[useCollaboration][Effect #${effectId}][user_profile] 👤 User profile update:`, message);
          console.log(`[useCollaboration][Effect #${effectId}][user_profile]   - userId: ${message.userId}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_profile]   - displayName: ${message.displayName}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_profile]   - Is self?: ${message.userId === userId}`);
          
          // Update user profile (including self if needed)
          setUsers(prev => {
            const next = new Map(prev);
            next.set(message.userId, {
              displayName: message.displayName,
              avatar: message.avatar
            });
            console.log(`[useCollaboration][Effect #${effectId}][user_profile] ✏️ Updated user profile`);
            console.log(`[useCollaboration][Effect #${effectId}][user_profile] 📊 Total users: ${next.size}`);
            return next;
          });
        }

        if (message.type === 'user_left') {
          console.log(`[useCollaboration][Effect #${effectId}][user_left] 👋 User left event:`, message);
          console.log(`[useCollaboration][Effect #${effectId}][user_left]   - userId: ${message.userId}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_left]   - roomSize: ${message.roomSize}`);
          console.log(`[useCollaboration][Effect #${effectId}][user_left]   - Is self?: ${message.userId === userId}`);
          
          // Don't remove self
          if (message.userId !== userId) {
            setUsers(prev => {
              const next = new Map(prev);
              next.delete(message.userId);
              console.log(`[useCollaboration][Effect #${effectId}][user_left] ➖ Removed user from Map`);
              console.log(`[useCollaboration][Effect #${effectId}][user_left] 📊 Total users: ${next.size}`);
              return next;
            });
          } else {
            console.log(`[useCollaboration][Effect #${effectId}][user_left] ⏭️ Skipping self-remove`);
          }
        }

        // Handle event synchronization messages
        if (message.type === 'event_added') {
          console.log(`[useCollaboration][Effect #${effectId}][event_added] ✨ Event added:`, message.event);
          if (callbacksRef.current?.onEventAdded && message.userId !== userId) {
            callbacksRef.current.onEventAdded(message.event);
          }
        }

        if (message.type === 'event_updated') {
          console.log(`[useCollaboration][Effect #${effectId}][event_updated] ✏️ Event updated:`, message.event);
          if (callbacksRef.current?.onEventUpdated && message.userId !== userId) {
            callbacksRef.current.onEventUpdated(message.event);
          }
        }

        if (message.type === 'event_deleted') {
          console.log(`[useCollaboration][Effect #${effectId}][event_deleted] 🗑️ Event deleted:`, message.eventId);
          if (callbacksRef.current?.onEventDeleted && message.userId !== userId) {
            callbacksRef.current.onEventDeleted(message.eventId);
          }
        }

        // Handle other collaboration messages (activity_added, etc.)
        if (message.type === 'activity_added' || 
            message.type === 'activity_updated' || 
            message.type === 'activity_deleted') {
          console.log(`[useCollaboration][Effect #${effectId}][activity] 🔄 Activity message:`, message.type);
          window.dispatchEvent(new CustomEvent('collaboration:activity', { detail: message }));
        }

      } catch (err) {
        console.error(`[useCollaboration][Effect #${effectId}][onmessage] ❌ Error parsing message:`, err);
        console.error(`[useCollaboration][Effect #${effectId}][onmessage] Raw data:`, event.data);
      }
    };

    ws.onerror = (error) => {
      console.error(`[useCollaboration][Effect #${effectId}][onerror] ❌ WebSocket error:`, error);
      console.error(`[useCollaboration][Effect #${effectId}][onerror] WebSocket readyState: ${ws.readyState}`);
    };

    ws.onclose = (event) => {
      const closeTimestamp = new Date().toISOString();
      console.log(`[useCollaboration][Effect #${effectId}][onclose] 🔌 Disconnected from room ${roomId} at ${closeTimestamp}`);
      console.log(`[useCollaboration][Effect #${effectId}][onclose]   - code: ${event.code}`);
      console.log(`[useCollaboration][Effect #${effectId}][onclose]   - reason: ${event.reason || 'none'}`);
      console.log(`[useCollaboration][Effect #${effectId}][onclose]   - wasClean: ${event.wasClean}`);
      console.log(`[useCollaboration][Effect #${effectId}][onclose]   - readyState: ${ws.readyState}`);
      
      setIsConnected(false);
      // Don't clear users here - let useEffect cleanup handle it
      // This prevents clearing during React StrictMode remounts
      console.log(`[useCollaboration][Effect #${effectId}][onclose] ⚠️ Not clearing users (cleanup will handle it)`);
    };

    // Cleanup on unmount or when roomId/userId changes
    return () => {
      const cleanupTimestamp = new Date().toISOString();
      console.log(`[useCollaboration][Effect #${effectId}][cleanup] 🧹 Cleanup triggered at ${cleanupTimestamp}`);
      console.log(`[useCollaboration][Effect #${effectId}][cleanup] WebSocket exists: ${!!ws}`);
      console.log(`[useCollaboration][Effect #${effectId}][cleanup] WebSocket readyState: ${ws.readyState}`);
      
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log(`[useCollaboration][Effect #${effectId}][cleanup] Closing WebSocket...`);
        ws.close();
        console.log(`[useCollaboration][Effect #${effectId}][cleanup] ✅ WebSocket close() called`);
      } else {
        console.log(`[useCollaboration][Effect #${effectId}][cleanup] ⏭️ WebSocket already closed/closing`);
      }
      
      setIsConnected(false);
      setUsers(new Map());
      console.log(`[useCollaboration][Effect #${effectId}][cleanup] ✅ Cleared users Map and set isConnected=false`);
    };
  }, [roomId, userId]);

  const broadcastCursor = useCallback((x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        x,
        y
      }));
    }
  }, []);

  const broadcastActivity = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        data
      }));
    }
  }, []);

  const broadcastEvent = useCallback((type: 'event_added' | 'event_updated' | 'event_deleted', eventData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        tripId: roomId,
        ...(type === 'event_deleted' ? { eventId: eventData } : { event: eventData }),
        timestamp: new Date().toISOString()
      };
      console.log(`[useCollaboration][broadcastEvent] 📤 Broadcasting ${type}:`, message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn(`[useCollaboration][broadcastEvent] ⚠️ Cannot broadcast, WebSocket not open (state: ${wsRef.current?.readyState})`);
    }
  }, [roomId]);

  return {
    users,
    isConnected,
    broadcastCursor,
    broadcastActivity,
    broadcastEvent
  };
}
