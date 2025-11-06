import express from 'express';
import pool from '../db.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', checkJwt, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, display_name, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', checkJwt, async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    const { display_name } = req.body;  // Use display_name
    
    const result = await pool.query(
      'UPDATE users SET display_name = $1, updated_at = CURRENT_TIMESTAMP WHERE auth0_id = $2 RETURNING id, email, display_name, picture',
      [display_name, auth0_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove the POST route since users are created via Auth0 sync 

export default router;