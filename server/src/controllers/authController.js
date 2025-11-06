import pool from '../db.js';

// Sync user from Auth0 to database
export const syncUser = async (req, res) => {
  try {
    // Get user info from Auth0 JWT token
    const { 
        sub: auth0_id, 
        email, 
        name: display_name ,
        picture
    } = req.auth;
    
    const auth0UserId = req.auth.sub;

    if (auth0UserId !== auth0_id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('Syncing user:', { auth0_id, email, display_name, picture });

    if (!auth0_id || !email) {
      return res.status(400).json({ error: 'Missing required Auth0 user data' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1', 
      [auth0_id]
    );
    
    let user;
    if (existingUser.rows.length === 0) {
      // Create new user
      const result = await pool.query(
        'INSERT INTO users (auth0_id, email, display_name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
        [auth0_id, email, display_name, picture || null]
      );
      user = result.rows[0];
      console.log('New user created:', user.id);
    } else {
      // Update existing user
      const result = await pool.query(
        'UPDATE users SET email = $2, display_name = $3, picture = $4, updated_at = CURRENT_TIMESTAMP WHERE auth0_id = $1 RETURNING *',
        [auth0_id, email, display_name, picture || null]
      );
      user = result.rows[0];
      console.log('User updated:', user.id);
    }
    
    const { id, email: userEmail, display_name: userName, picture: userPicture, created_at } = user;
    res.status(200).json({ 
      id, 
      email: userEmail, 
      display_name: userName, 
      picture: userPicture, 
      created_at 
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
      'SELECT id, auth0_id, email, display_name, picture, created_at, updated_at FROM users WHERE auth0_id = $1', 
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