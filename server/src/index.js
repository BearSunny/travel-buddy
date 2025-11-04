<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT } from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import mapsRoutes from './routes/maps.js';
import healthRoutes from './routes/health.js';

dotenv.config();
=======
const express = require("express");
const cors = require("cors");
const pool = require("./db");
>>>>>>> 7738dfb964cf9d3f3742c9223c06a6ba9b2bb915

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/google-maps', mapsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
=======
app.get("/api/places", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM places"); // example query
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
>>>>>>> 7738dfb964cf9d3f3742c9223c06a6ba9b2bb915
