import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT } from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import healthRoutes from './routes/health.js';
import pool from './db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
