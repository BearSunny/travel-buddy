import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { trip_id, user_id, role, status, invited_by } = req.body;

    if (!trip_id || !role || !status) {
      return res.status(400).json({ error: 'Missing required field' });
    }

    const tripRes = await pool.query('SELECT id FROM trips WHERE id = $1', [trip_id]);
    if (tripRes.rowCount === 0) {
      return res.status(400).json({ error: 'trip_id does not exist in trips' });
    }

    if (user_id) {
      const userRes = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
      if (userRes.rowCount === 0) {
        return res.status(400).json({ error: 'user_id does not exist in users' });
      }
    }

    if (role !== 'viewer' && role !== 'editor' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (status !== 'invited' && status !== 'accepted' && status !== 'declined') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (invited_by) {
      const invitedRes = await pool.query('SELECT id FROM users WHERE id = $1', [invited_by]);
      if (invitedRes.rowCount === 0) {
        return res.status(400).json({ error: 'invited_by does not exist in users' });
      }
    }

    const q = 'INSERT INTO trip_collaborators (trip_id, user_id, role, status, invited_by) VALUES ($1, $2, $3, $4, $5) RETURNING id, trip_id, user_id, role, status, invited_by;';
    const values = [trip_id, user_id, role, status, invited_by];
    
    const { rows } = await pool.query(q, values);
    return res.status(201).json(rows[0]);
  } catch(err) {
    console.error('trip_collaborators POST error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;