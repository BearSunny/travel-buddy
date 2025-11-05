import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { trip_id, creator_id, title, description, start_time, end_time, address, city, country, status } = req.body;

    if (!trip_id || !creator_id || !title || !status) {
      return res.status(400).json({ error: 'Missing required field' });
    }

    const tripRes = await pool.query('SELECT id FROM trips WHERE id = $1', [trip_id]);
    if (tripRes.rowCount === 0) {
      return res.status(400).json({ error: 'trip_id does not exist in trips' });
    }

    const creatorRes = await pool.query('SELECT id FROM users WHERE id = $1', [creator_id]);
    if (creatorRes.rowCount === 0) {
      return res.status(400).json({ error: 'creator_id does not exist in users' });
    }

    if (start_time && end_time) {
      const s = new Date(start_time);
      const e = new Date(end_time);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for start_time or end_time' });
      }
      if (s > e) {
        return res.status(400).json({ error: 'start_time must be before or equal to end_time' });
      }
    }

    if (status !== 'planned' && status !== 'done' && status !== 'cancelled') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const q = 'INSERT INTO trip_events (trip_id, creator_id, title, description, start_time, end_time, address, city, country, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, trip_id, creator_id, title, description, start_time, end_time, address, city, country, status;';
    const values = [trip_id, creator_id, title, description, start_time, end_time, address, city, country, status];
    
    const { rows } = await pool.query(q, values);
    return res.status(201).json(rows[0]);
  } catch(err) {
    console.error('trip_events POST error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;