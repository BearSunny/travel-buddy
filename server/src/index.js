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

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
