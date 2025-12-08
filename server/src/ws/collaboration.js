import { WebSocketServer } from 'ws';
import * as WebSocket from 'ws';
import logger from '../utils/logger.js';

// Map to store rooms: roomId -> Set<{ws, userId}>
const rooms = new Map();

export function setupCollaborationWS(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/collab'
  });

  wss.on('connection', (ws, req) => {
    // Extract room ID and user ID from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room');
    const userId = url.searchParams.get('userId');

    if (!roomId) {
      ws.close(1008, 'Missing room parameter');
      return;
    }

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);
    const client = { ws, userId };
    room.add(client);

    logger.info(`User ${userId || 'anonymous'} joined room ${roomId} (total: ${room.size})`);

    // Send room state to the newly joined user
    sendRoomState(ws, roomId, userId);

    // Broadcast user joined message to all users (including new user)
    broadcastToRoom(roomId, {
      type: 'user_joined',
      userId,
      timestamp: new Date().toISOString(),
      roomSize: room.size
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'user_profile') {
          client.displayName = message.displayName;
          client.avatar = message.avatar;
          broadcastToRoom(roomId, {
            type: 'user_profile',
            userId,
            displayName: message.displayName,
            avatar: message.avatar,
            timestamp: new Date().toISOString()
          });
        } else {
          broadcastToRoom(roomId, {
            ...message,
            userId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        logger.error('WebSocket message parse error:', err);
      }
    });

    ws.on('close', () => {
      room.delete(client);
      
      logger.info(`User ${userId || 'anonymous'} left room ${roomId} (total: ${room.size})`);

      // Broadcast user left message
      broadcastToRoom(roomId, {
        type: 'user_left',
        userId,
        timestamp: new Date().toISOString(),
        roomSize: room.size
      });

      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
        logger.info(`Room ${roomId} closed (empty)`);
      }
    });

    ws.on('error', (err) => {
      logger.error(`WebSocket error in room ${roomId}:`, err);
    });
  });

  return wss;
}

// Send current room state to newly joined client --> Keep track of the correct user count & avatar display
function sendRoomState(ws, roomId, newUserId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const existingUsers = Array.from(room)
    .filter(client => client.userId !== newUserId)
    .map(client => ({
      userId: client.userId,
      displayName: client.displayName,
      avatar: client.avatar
    }));

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'room_state',
      users: existingUsers,
      timestamp: new Date().toISOString()
    }));
  }
}

// Broadcast messages to all clients in a room
export function broadcastToRoom(roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return;

  const data = JSON.stringify(message);
  room.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

// Get room info
export function getRoomInfo(roomId) {
  const room = rooms.get(roomId);
  return {
    roomId,
    clientCount: room ? room.size : 0,
    exists: rooms.has(roomId)
  };
}
