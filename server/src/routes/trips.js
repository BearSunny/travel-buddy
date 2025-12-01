import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/create', async (req, res) => {
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
    } else if (start_date || end_date) {
      return res.status(400).json({ error: 'Missing start_date or end_date' });
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

router.get('/read/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const q = 'SELECT * FROM trips WHERE id = $1';
    const values = [id];
    const result1 = await pool.query(q, values);

    if (result1.rows.length === 0)
      return res.status(404).json({ error : 'Trip not found' });

    const result2 = await pool.query('SELECT id FROM trip_events WHERE trip_id = $1', values);

    return res.status(200).json({
      trip: result1.rows[0],
      trip_events: result2.rows
    });
  } catch(err) {
    console.error('trips GET /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payload = req.body;
    const allowed = new Set(['owner_id','title','description','start_date','end_date']);
    const keys = Object.keys(payload).filter(k => allowed.has(k));
    
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    if (payload.owner_id) {
      const ownerCheck = await pool.query('SELECT id FROM users WHERE id = $1', [payload.owner_id]);
      if (ownerCheck.rowCount === 0) {
        return res.status(400).json({ error: 'owner_id does not exist' });
      }
    }

    if (payload.start_date && payload.end_date) {
      const s = new Date(payload.start_date);
      const e = new Date(payload.end_date);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for start_date or end_date' });
      }
      if (s > e) {
        return res.status(400).json({ error: 'start_date must be before or equal to end_date' });
      }
    } else if (payload.start_date || payload.end_date) {
      return res.status(400).json({ error: 'Missing start_date or end_date' });
    }

    const sets = [];
    const values = [];
    let idx = 1;
    for (const key of keys) {
      sets.push(`${key} = $${idx}`);
      values.push(payload[key]);
      idx += 1;
    }
    values.push(id);
    const q = `UPDATE trips SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, owner_id, title, description, start_date, end_date;`;
    const { rows } = await pool.query(q, values);
    if (rows.length === 0) {
      return res.status(404).json({ error : 'Trip not found' });
    }
    return res.status(200).json(rows[0]);
  } catch(err) {
    console.error('trips PATCH /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT id FROM trips WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await pool.query('DELETE FROM trips WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Trip deleted successfully', id });
  } catch(err) {
    console.error('trips DELETE /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;