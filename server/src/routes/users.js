const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password || !display_name) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const q = 'INSERT INTO users (email, password, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name;';
    const { rows } = await pool.query(q, [email, password, display_name]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;