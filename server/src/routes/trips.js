const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { owner_id, title, description, start_date, end_date } = req.body;
    if (!owner_id || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (start_date && end_date) {
      const s = new Date(start_date);
      const e = new Date(end_date);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for start_date or end_date' });
      }
      if (s > e) {
        return res.status(400).json({ error: 'start_date must be before or equal to end_date' });
      }
    }

    const ownerCheck = await pool.query('SELECT id FROM users WHERE id = $1', [owner_id]);
    if (ownerCheck.rowCount === 0) {
      return res.status(400).json({ error: 'owner_id does not exist' });
    }

    const q = 'INSERT INTO trips (owner_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, owner_id, title, description, start_date, end_date;';
    const values = [owner_id, title, description, start_date, end_date];

    const { rows } = await pool.query(q, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('trips POST error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;