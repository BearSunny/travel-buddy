import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/create', async (req, res) => {
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

router.get('/read/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const q = 'SELECT * FROM trip_collaborators WHERE id = $1'
    const values = [id];
    const { rows } = await pool.query(q, values);

    if (rows.length === 0)
      return res.status(404).json({ error : 'Trip collaborator not found' });

    return res.status(200).json(rows[0]);
  } catch(err) {
    console.error('trip_collaborators GET /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payload = req.body;
    const allowed = new Set(['trip_id','user_id','role','status','invited_by']);
    const keys = Object.keys(payload).filter(k => allowed.has(k));
    
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    if (payload.trip_id) {
      const ownerCheck = await pool.query('SELECT id FROM trips WHERE id = $1', [payload.trip_id]);
      if (ownerCheck.rowCount === 0) {
        return res.status(400).json({ error: 'trip_id does not exist' });
      }
    }

    if (payload.user_id) {
      const ownerCheck = await pool.query('SELECT id FROM users WHERE id = $1', [payload.user_id]);
      if (ownerCheck.rowCount === 0) {
        return res.status(400).json({ error: 'user_id does not exist' });
      }
    }

    if (payload.role && payload.role != 'viewer' && payload.role != 'editor' && payload.role != 'admin') {
      return res.status(400).json({ error: 'role must be viewer, editor, or admin' });
    }

    if (payload.status && payload.status != 'invited' && payload.status != 'accepted' && payload.status != 'declined') {
      return res.status(400).json({ error: 'status must be invited, accepted, or declined'});
    }

    if (payload.invited_by) {
      const ownerCheck = await pool.query('SELECT id FROM users WHERE id = $1', [payload.invited_by]);
      if (ownerCheck.rowCount === 0) {
        return res.status(400).json({ error: 'invited_by does not exist' });
      }
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
    const q = `UPDATE trip_collaborators SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, trip_id, user_id, role, status, invited_by;`;
    const { rows } = await pool.query(q, values);
    if (rows.length === 0) {
      return res.status(404).json({ error : 'Trip collaborator not found' });
    }
    return res.status(200).json(rows[0]);
  } catch(err) {
    console.error('trip_collaborator PATCH /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT id FROM trip_collaborators WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: 'Trip collaborator not found' });
    }

    await pool.query('DELETE FROM trip_collaborators WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Trip collaborator deleted successfully', id });
  } catch(err) {
    console.error('trip_collaborators DELETE /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;