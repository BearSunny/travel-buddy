import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { auth0_id, email, password, display_name, avatar, update_at } = req.body;
    if (!email || !password || !display_name) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const q = 'INSERT INTO users (auth0_id, email, password, display_name, avatar, update_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, auth0_id, password, email, display_name, avatar, update_at;';
    const { rows } = await pool.query(q, [auth0_id, email, password, display_name, avatar, update_at]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;