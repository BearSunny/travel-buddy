import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all public templates GET http://localhost:5001/api/templates
router.get('/', async (req, res) => {
  try {
    const { sort = 'newest', category } = req.query;

    let orderBy = 'tt.created_at DESC'; // default: newest
    if (sort === 'popular') {
      orderBy = 'tt.usage_count DESC';
    } else if (sort === 'rating') {
      orderBy = '(CASE WHEN tt.rating_count > 0 THEN tt.rating_sum::float / tt.rating_count ELSE 0 END) DESC';
    }

    let categoryFilter = '';
    const params = [];
    if (category) {
      categoryFilter = 'WHERE tt.category = $1 AND tt.is_public = true';
      params.push(category);
    } else {
      categoryFilter = 'WHERE tt.is_public = true';
    }

    const query = `
      SELECT 
        tt.id,
        tt.title,
        tt.description,
        tt.duration_days,
        tt.category,
        tt.thumbnail_url,
        tt.usage_count,
        tt.rating_sum,
        tt.rating_count,
        tt.created_at,
        CASE WHEN tt.rating_count > 0 
          THEN ROUND((tt.rating_sum::numeric / tt.rating_count), 1)
          ELSE 0 
        END as average_rating,
        u.display_name as creator_name,
        u.avatar as creator_avatar
      FROM trip_templates tt
      JOIN users u ON tt.creator_id = u.id
      ${categoryFilter}
      ORDER BY ${orderBy}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get template details with events GET http://localhost:5001/api/templates/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const templateQuery = `
      SELECT 
        tt.*,
        CASE WHEN tt.rating_count > 0 
          THEN ROUND((tt.rating_sum::numeric / tt.rating_count), 1)
          ELSE 0 
        END as average_rating,
        u.display_name as creator_name,
        u.avatar as creator_avatar
      FROM trip_templates tt
      JOIN users u ON tt.creator_id = u.id
      WHERE tt.id = $1
    `;

    const eventsQuery = `
      SELECT *
      FROM template_events
      WHERE template_id = $1
      ORDER BY day_number, order_index
    `;

    const [templateResult, eventsResult] = await Promise.all([
      pool.query(templateQuery, [id]),
      pool.query(eventsQuery, [id])
    ]);

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      template: templateResult.rows[0],
      events: eventsResult.rows
    });
  } catch (err) {
    console.error('Get template details error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export trip as template POST http://localhost:5001/api/templates/export
router.post('/export', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { trip_id, user_id, category, description } = req.body;

    console.log('[Export Template] Request:', { trip_id, user_id, category });

    if (!trip_id || !user_id) {
      console.error('[Export Template] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // Get trip details - only owner can export
    console.log('[Export Template] Fetching trip details...');
    const tripResult = await client.query(
      `SELECT t.*, 
        EXTRACT(DAY FROM (t.end_date - t.start_date)) + 1 as duration
       FROM trips t 
       WHERE t.id = $1 AND t.owner_id = $2`,
      [trip_id, user_id]
    );

    if (tripResult.rows.length === 0) {
      console.error('[Export Template] Trip not found or user is not the owner');
      console.error('[Export Template] trip_id:', trip_id, 'user_id:', user_id);
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Only trip owners can export templates' });
    }

    const trip = tripResult.rows[0];
    console.log('[Export Template] Trip found:', trip.title);

    // Create template
    console.log('[Export Template] Creating template...');
    const templateResult = await client.query(
      `INSERT INTO trip_templates 
        (original_trip_id, creator_id, title, description, duration_days, category, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [
        trip_id,
        user_id,
        trip.title,
        description || trip.description,
        Math.ceil(trip.duration),
        category || 'Other'
      ]
    );

    const template = templateResult.rows[0];
    console.log('[Export Template] Template created:', template.id);

    // Get trip events
    const eventsResult = await client.query(
      `SELECT * FROM trip_events 
       WHERE trip_id = $1 
       ORDER BY start_time`,
      [trip_id]
    );

    // Convert events to template events (relative days)
    const tripStartDate = new Date(trip.start_date);
    
    for (const event of eventsResult.rows) {
      const eventDate = new Date(event.start_time);
      const dayNumber = Math.floor((eventDate - tripStartDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const startTime = event.start_time ? new Date(event.start_time).toTimeString().split(' ')[0] : null;
      const endTime = event.end_time ? new Date(event.end_time).toTimeString().split(' ')[0] : null;

      await client.query(
        `INSERT INTO template_events 
          (template_id, title, description, day_number, start_time, end_time, address, city, country, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          template.id,
          event.title,
          event.description,
          dayNumber,
          startTime,
          endTime,
          event.address,
          event.city,
          event.country,
          event.latitude,
          event.longitude
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[Export Template] Export completed successfully');
    res.status(201).json(template);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Export Template] Error:', err);
    console.error('[Export Template] Stack:', err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Use template to create new trip POST http://localhost:5001/api/templates/:id/use
router.post('/:id/use', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id: template_id } = req.params;
    const { user_id, title, start_date } = req.body;

    if (!user_id || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // Get template details
    const templateResult = await client.query(
      'SELECT * FROM trip_templates WHERE id = $1',
      [template_id]
    );

    if (templateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.duration_days - 1);

    // Create new trip
    const tripResult = await client.query(
      `INSERT INTO trips (owner_id, title, description, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        user_id,
        title || template.title,
        template.description,
        startDate.toISOString(),
        endDate.toISOString()
      ]
    );

    const newTrip = tripResult.rows[0];

    // Get template events
    const eventsResult = await client.query(
      'SELECT * FROM template_events WHERE template_id = $1 ORDER BY day_number, order_index',
      [template_id]
    );

    // Create trip events from template
    for (const templateEvent of eventsResult.rows) {
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + templateEvent.day_number - 1);

      let startTime = null;
      let endTime = null;

      if (templateEvent.start_time) {
        const [hours, minutes, seconds] = templateEvent.start_time.split(':');
        startTime = new Date(eventDate);
        startTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
      }

      if (templateEvent.end_time) {
        const [hours, minutes, seconds] = templateEvent.end_time.split(':');
        endTime = new Date(eventDate);
        endTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
      }

      await client.query(
        `INSERT INTO trip_events 
          (trip_id, creator_id, title, description, start_time, end_time, address, city, country, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newTrip.id,
          user_id,
          templateEvent.title,
          templateEvent.description,
          startTime ? startTime.toISOString() : null,
          endTime ? endTime.toISOString() : null,
          templateEvent.address,
          templateEvent.city,
          templateEvent.country,
          templateEvent.latitude,
          templateEvent.longitude
        ]
      );
    }

    // Increment usage count
    await client.query(
      'UPDATE trip_templates SET usage_count = usage_count + 1 WHERE id = $1',
      [template_id]
    );

    await client.query('COMMIT');
    res.status(201).json(newTrip);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Use template error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Rate a template POST http://localhost:5001/api/templates/:id/rate
router.post('/:id/rate', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id: template_id } = req.params;
    const { user_id, rating, comment } = req.body;

    if (!user_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    await client.query('BEGIN');

    // Check if user already rated
    const existingRating = await client.query(
      'SELECT * FROM template_ratings WHERE template_id = $1 AND user_id = $2',
      [template_id, user_id]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      const oldRating = existingRating.rows[0].rating;
      const ratingDiff = rating - oldRating;

      await client.query(
        'UPDATE template_ratings SET rating = $1, comment = $2 WHERE template_id = $3 AND user_id = $4',
        [rating, comment, template_id, user_id]
      );

      await client.query(
        'UPDATE trip_templates SET rating_sum = rating_sum + $1 WHERE id = $2',
        [ratingDiff, template_id]
      );
    } else {
      // Insert new rating
      await client.query(
        'INSERT INTO template_ratings (template_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [template_id, user_id, rating, comment]
      );

      await client.query(
        'UPDATE trip_templates SET rating_sum = rating_sum + $1, rating_count = rating_count + 1 WHERE id = $2',
        [rating, template_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Rate template error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
