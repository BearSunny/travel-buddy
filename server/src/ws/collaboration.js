import { WebSocketServer } from 'ws';
import * as WebSocket from 'ws';
import logger from '../utils/logger.js';
import pool from '../db.js';

// Map to store rooms: roomId -> Set<{ws, userId}>
const rooms = new Map();
let messageSequence = 0;

// Add user as collaborator to trip in database
async function addCollaborator(tripId, userId) {
  try {
    logger.info(`[DB] Adding collaborator: tripId=${tripId}, userId=${userId}`);
    
    // Look up the database UUID from Auth0 ID
    // userId might be Auth0 ID (e.g., "google-oauth2|123456") or a temp guest ID
    const userLookup = await pool.query(
      'SELECT id FROM users WHERE auth0_id = $1',
      [userId]
    );
    
    if (userLookup.rows.length === 0) {
      logger.info(`[DB] User not found in database (auth0_id: ${userId}), skipping collaborator insert`);
      return;
    }
    
    const databaseUserId = userLookup.rows[0].id;
    logger.info(`[DB] Resolved Auth0 ID to database UUID: ${databaseUserId}`);
    
    const query = `
      INSERT INTO trip_collaborators (trip_id, user_id, role, status)
      VALUES ($1, $2, 'editor', 'accepted')
      ON CONFLICT (trip_id, user_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [tripId, databaseUserId]);
    
    if (result.rowCount > 0) {
      logger.info(`[DB] Collaborator added successfully:`, result.rows[0]);
    } else {
      logger.info(`[DB] Collaborator already exists, no changes made`);
    }
  } catch (err) {
    logger.error(`[DB] Error adding collaborator:`, err);
    // Don't throw but allow collaboration to continue even if DB write fails
  }
}

export function setupCollaborationWS(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/collab'
  });

  logger.info('[WS] Collaboration WebSocket server initialized on path /collab');

  wss.on('connection', (ws, req) => {
    const connectionTimestamp = new Date().toISOString();
    logger.info(`[WS] New connection attempt at ${connectionTimestamp}`);
    logger.info(`[WS] Request URL: ${req.url}`);
    
    // Extract room ID and user ID from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room');
    const userId = url.searchParams.get('userId');

    logger.info(`[WS] Extracted params - roomId: ${roomId}, userId: ${userId}`);

    if (!roomId) {
      logger.error('[WS] Missing room parameter, closing connection');
      ws.close(1008, 'Missing room parameter');
      return;
    }

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      logger.info(`[WS] Creating new room: ${roomId}`);
      rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);
    const client = { ws, userId, displayName: null, avatar: null }; // Initialize with null
    room.add(client);

    logger.info(`[WS] ✅ User ${userId || 'anonymous'} joined room ${roomId} (total: ${room.size})`);
    logger.info(`[WS] WebSocket readyState: ${ws.readyState}`);

    // Send room state to the newly joined user
    logger.info(`[WS] Sending room_state to user ${userId}...`);
    sendRoomState(ws, roomId, userId);

    // DON'T broadcast user_joined yet - wait for user_profile first

    ws.on('message', (data) => {
      messageSequence++;
      const msgId = messageSequence;
      const receiveTimestamp = new Date().toISOString();
      
      logger.info(`[WS][Msg #${msgId}] 📥 Message received at ${receiveTimestamp}`);
      logger.info(`[WS][Msg #${msgId}] Raw data (${data.length} bytes):`, data.toString());
      
      try {
        const message = JSON.parse(data);
        logger.info(`[WS][Msg #${msgId}] ✅ Parsed message type: ${message.type}`);
        logger.info(`[WS][Msg #${msgId}] Message content:`, message);
        
        if (message.type === 'user_profile') {
          logger.info(`[WS][Msg #${msgId}][user_profile] Setting displayName for user ${userId}: ${message.displayName}`);
          client.displayName = message.displayName;
          client.avatar = message.avatar;
          logger.info(`[WS][Msg #${msgId}][user_profile] Client object updated:`, { userId: client.userId, displayName: client.displayName, avatar: client.avatar });
          
          // Add user as collaborator to the trip in database
          if (userId && roomId) {
            logger.info(`[WS][Msg #${msgId}][user_profile] Attempting to add collaborator to database...`);
            addCollaborator(roomId, userId).catch(err => {
              logger.error(`[WS][Msg #${msgId}][user_profile] Failed to add collaborator:`, err);
            });
          }
          
          // NOW broadcast user_joined with complete profile
          const joinMessage = {
            type: 'user_joined',
            userId,
            displayName: message.displayName,
            avatar: message.avatar,
            timestamp: new Date().toISOString(),
            roomSize: room.size
          };
          logger.info(`[WS][Msg #${msgId}][user_profile] Broadcasting user_joined with profile to room ${roomId}:`, joinMessage);
          broadcastToRoom(roomId, joinMessage);
        } else {
          logger.info(`[WS][Msg #${msgId}] Broadcasting generic message to room ${roomId}`);
          broadcastToRoom(roomId, {
            ...message,
            userId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        logger.error(`[WS][Msg #${msgId}] ❌ Error parsing message:`, err);
        logger.error(`[WS][Msg #${msgId}] Raw data:`, data.toString());
      }
    });

    ws.on('close', () => {
      const closeTimestamp = new Date().toISOString();
      logger.info(`[WS] 🔌 WebSocket closed at ${closeTimestamp}`);
      logger.info(`[WS] Removing user ${userId} from room ${roomId}`);
      
      room.delete(client);
      
      logger.info(`[WS] ✅ User ${userId || 'anonymous'} left room ${roomId} (remaining: ${room.size})`);

      // Broadcast user left message
      const leftMessage = {
        type: 'user_left',
        userId,
        timestamp: new Date().toISOString(),
        roomSize: room.size
      };
      logger.info(`[WS] Broadcasting user_left to room ${roomId}:`, leftMessage);
      broadcastToRoom(roomId, leftMessage);

      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
        logger.info(`[WS] 🧹 Room ${roomId} is empty, deleted from memory`);
      }
    });

    ws.on('error', (err) => {
      logger.error(`[WS] ❌ WebSocket error in room ${roomId}:`, err);
      logger.error(`[WS] Error details - userId: ${userId}, readyState: ${ws.readyState}`);
    });
  });

  return wss;
}

// Send current room state to newly joined client
function sendRoomState(ws, roomId, newUserId) {
  logger.info(`[WS][sendRoomState] Called for room ${roomId}, user ${newUserId}`);
  
  const room = rooms.get(roomId);
  if (!room) {
    logger.error(`[WS][sendRoomState] ❌ Room ${roomId} not found`);
    return;
  }

  logger.info(`[WS][sendRoomState] Room ${roomId} has ${room.size} total clients`);

  const existingUsers = Array.from(room)
    .filter(client => {
      const isNewUser = client.userId === newUserId;
      logger.info(`[WS][sendRoomState] Client ${client.userId}: isNewUser=${isNewUser}, displayName=${client.displayName}`);
      return !isNewUser;
    })
    .map(client => ({
      userId: client.userId,
      displayName: client.displayName,
      avatar: client.avatar
    }));

  logger.info(`[WS][sendRoomState] Filtered existingUsers (${existingUsers.length}):`, existingUsers);

  const roomStateMessage = {
    type: 'room_state',
    users: existingUsers,
    roomSize: room.size,
    timestamp: new Date().toISOString()
  };

  logger.info(`[WS][sendRoomState] Prepared room_state message:`, roomStateMessage);
  logger.info(`[WS][sendRoomState] WebSocket readyState: ${ws.readyState} (1=OPEN)`);

  if (ws.readyState === 1/*WebSocket.OPEN*/) {
    const messageString = JSON.stringify(roomStateMessage);
    logger.info(`[WS][sendRoomState] 📤 Sending room_state (${messageString.length} bytes)`);
    ws.send(messageString);
    logger.info(`[WS][sendRoomState] ✅ room_state sent successfully`);
  } else {
    logger.error(`[WS][sendRoomState] ❌ Cannot send, WebSocket not OPEN (state: ${ws.readyState})`);
  }
}

// Broadcast messages to all clients in a room
export function broadcastToRoom(roomId, message) {
  logger.info(`[WS][broadcastToRoom] Called for room ${roomId}, message type: ${message.type}`);
  
  const room = rooms.get(roomId);
  if (!room) {
    logger.error(`[WS][broadcastToRoom] ❌ Room ${roomId} not found`);
    return;
  }

  logger.info(`[WS][broadcastToRoom] Room has ${room.size} clients`);
  logger.info(`[WS][broadcastToRoom] Message to broadcast:`, message);

  const data = JSON.stringify(message);
  logger.info(`[WS][broadcastToRoom] Stringified message (${data.length} bytes)`);
  
  let successCount = 0;
  let failCount = 0;
  
  room.forEach(({ ws, userId }) => {
    logger.info(`[WS][broadcastToRoom] Attempting to send to user ${userId}, readyState: ${ws.readyState}`);
    
    if (ws.readyState === 1/*WebSocket.OPEN*/) {
      try {
        ws.send(data);
        successCount++;
        logger.info(`[WS][broadcastToRoom] ✅ Sent to user ${userId}`);
      } catch (err) {
        failCount++;
        logger.error(`[WS][broadcastToRoom] ❌ Failed to send to user ${userId}:`, err);
      }
    } else {
      failCount++;
      logger.warn(`[WS][broadcastToRoom] ⏭️ Skipping user ${userId} (readyState: ${ws.readyState})`);
    }
  });
  
  logger.info(`[WS][broadcastToRoom] 📊 Broadcast complete - Success: ${successCount}, Failed/Skipped: ${failCount}`);
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
