import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/create', async (req, res) => {
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

router.get('/read/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const q = 'SELECT * FROM trip_events WHERE id = $1'
    const values = [id];
    const { rows } = await pool.query(q, values);

    if (rows.length === 0)
      return res.status(404).json({ error : 'Trip event not found' });

    return res.status(200).json(rows[0]);
  } catch(err) {
    console.error('trip_event GET /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payload = req.body;
    const allowed = new Set(['trip_id','creator_id','title','description','start_time','end_time','address','city','country','status']);
    const keys = Object.keys(payload).filter(k => allowed.has(k));
    
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    if (payload.trip_id) {
      const check = await pool.query('SELECT id FROM trips WHERE id = $1', [payload.trip_id]);
      if (check.rowCount === 0) {
        return res.status(400).json({ error: 'trip_id does not exist' });
      }
    }

    if (payload.creator_id) {
      const check = await pool.query('SELECT id FROM users WHERE id = $1', [payload.creator_id]);
      if (check.rowCount === 0) {
        return res.status(400).json({ error: 'user_id does not exist' });
      }
    }

    if (payload.start_time && payload.end_time) {
      const s = new Date(payload.start_time);
      const e = new Date(payload.end_time);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for start_time or end_time' });
      }
      if (s > e) {
        return res.status(400).json({ error: 'start_time must be before or equal to end_time' });
      }
    } else if (payload.start_time || payload.end_time) {
      return res.status(400).json({ error: 'Missing start_time or end_time' });
    }

    if (payload.status && payload.status != 'planned' && payload.status != 'done' && payload.status != 'cancelled') {
      return res.status(400).json({ error: 'status must be planned, done, or cancelled' });
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
    const q = `UPDATE trip_events SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, trip_id, creator_id, title, description, start_time, end_time, address, city, country, status;`;
    const { rows } = await pool.query(q, values);
    if (rows.length === 0) {
      return res.status(404).json({ error : 'Trip event not found' });
    }
    return res.status(200).json(rows[0]);
  } catch(err) {
    console.error('trip_event PATCH /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT id FROM trip_events WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: 'Trip event not found' });
    }

    await pool.query('DELETE FROM trip_events WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Trip event deleted successfully', id });
  } catch(err) {
    console.error('trip_events DELETE /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;