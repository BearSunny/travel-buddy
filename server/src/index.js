import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT } from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import mapsRoutes from './routes/maps.js';
import healthRoutes from './routes/health.js';
import pool from './db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', require('./routes/users'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/trip_collaborators', require('./routes/trip_collaborators'));
app.use('/api/trip_events', require('./routes/trip_events'));

// Health check endpoint with database test
app.get('/google-maps/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Server is running', 
      timestamp: new Date(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server is running but database connection failed', 
      timestamp: new Date(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/google-maps', healthRoutes);
app.use('/google-maps', mapsRoutes);

// Database example route (for future use)
app.get("/google-maps/places", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM places");
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/debug/tables', async (req,res) => {
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
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
