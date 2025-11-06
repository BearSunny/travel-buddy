import express from 'express';
import { syncUser, getCurrentUser } from '../controllers/authController.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Auth-specific routes
router.post('/sync', checkJwt, syncUser);
router.get('/me', checkJwt, getCurrentUser);

export default router;