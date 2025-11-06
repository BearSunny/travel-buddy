import pool from '../db.js';

// Sync Auth0 user into database
export const syncUser = async (req, res) => {
  try {
    const { sub: auth0_id, email, name: display_name, picture: avatar } = req.auth;

    if (!auth0_id || !email) {
      return res.status(400).json({ error: 'Missing required Auth0 user data' });
    }

    console.log('Syncing user:', { auth0_id, email, display_name, avatar });

    // Handle duplicates automatically --> Race condition omg --> Why does Auth0 have to send 2 requests at the same time
    const result = await pool.query(
      `INSERT INTO users (auth0_id, email, display_name, avatar)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET
         auth0_id = EXCLUDED.auth0_id,
         display_name = EXCLUDED.display_name,
         avatar = EXCLUDED.avatar,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [auth0_id, email, display_name, avatar || null]
    );

    const user = result.rows[0];
    console.log('User synced:', user.id);

    const { id, email: userEmail, display_name: userName, avatar: userPicture, created_at } = user;
    res.status(200).json({
      id,
      email: userEmail,
      display_name: userName,
      avatar: userPicture,
      created_at,
    });
  } catch (err) {
    console.error('User sync error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    const { sub: auth0_id } = req.auth;
    
    const result = await pool.query(
      `SELECT id, auth0_id, email, display_name, avatar, created_at, updated_at 
       FROM users WHERE auth0_id = $1`, 
      [auth0_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database. Please sync first.' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
