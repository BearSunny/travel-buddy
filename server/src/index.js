import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { PORT } from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';
import { handleJwtError } from './middleware/auth.js';
import logger from './utils/logger.js';
import healthRoutes from './routes/health.js';
import usersRoutes from './routes/users.js';
import tripsRoutes from './routes/trips.js';
import tripCollaboratorsRoutes from './routes/trip_collaborators.js';
import tripEventsRoutes from './routes/trip_events.js';
import authRoutes from './routes/authRoutes.js';
import templatesRoutes from './routes/templates.js';
import pool from './db.js';
import { setupCollaborationWS } from './ws/collaboration.js';

dotenv.config();

const app = express();

// Create HTTP server and attach WebSocket
const server = http.createServer(app);
setupCollaborationWS(server);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Available routes:');
  logger.info('  POST /api/auth/sync - Sync Auth0 user to database');
  logger.info('  GET  /api/auth/me - Get current user');
  logger.info('  GET  /api/users - Get all users');
  logger.info('  GET  /api/users/:id - Get user by ID');
  logger.info('  PUT  /api/users/profile - Update user profile');
  logger.info('  WebSocket /collab - Collaboration rooms');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/trip_collaborators', tripCollaboratorsRoutes);
app.use('/api/trip_events', tripEventsRoutes);
app.use('/api/templates', templatesRoutes);

// API Routes
app.use('/health', healthRoutes);

/*
app.get("/api/places", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM places");
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});
*/

app.get('/debug/tables', async (req, res) => {
  try {
    const result1 = await pool.query("SELECT * FROM users;");
    const result2 = await pool.query("SELECT * FROM trips;");
    const result3 = await pool.query("SELECT * FROM trip_collaborators;");
    const result4 = await pool.query("SELECT * FROM trip_events;");
    res.json({
      users: result1.rows,
      trips: result2.rows,
      trip_collaborators: result3.rows,
      trip_events: result4.rows
    });
  } catch (err) {
    console.error("Debug tables error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.use(handleJwtError);

// Error handler middleware 
app.use(errorHandler);

