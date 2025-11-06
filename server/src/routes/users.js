import express from 'express';
import pool from '../db.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Get all users GET http://localhost:5001/api/users
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

// Get user by ID GET http://localhost:5001/api/users/:id
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

// Update user profile PUT http://localhost:5001/api/users/profile
router.put('/profile', checkJwt, async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth; 
    const { display_name } = req.body; 

    const result = await pool.query(
      'UPDATE users SET display_name = $1, updated_at = CURRENT_TIMESTAMP WHERE auth0_id = $2 RETURNING id, email, display_name, avatar',
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

// Delete user by ID (admin only) DELETE http://localhost:5001/api/users/:id
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the user from the database
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, display_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;