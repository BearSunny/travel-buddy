import express from 'express';
import pool from '../db.js';
import { geocodeMultipleLocations } from '../utils/geocoding.js';

const router = express.Router();

// Initialize OpenRouter client
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// POST /api/ai/generate-trip - Generate trip itinerary using AI
router.post('/generate-trip', async (req, res) => {
  try {
    const { destination, duration, interests, budget, startDate, userId } = req.body;

    // Validate input
    if (!destination || !duration || !userId || !startDate) {
      return res.status(400).json({ error: 'Missing required fields: destination, duration, userId, startDate' });
    }

    console.log('[AI] Generating trip for:', { destination, duration, interests, budget });

    const prompt = `Create a ${duration}-day trip itinerary for ${destination}.

Trip details:
- Destination: ${destination}
- Duration: ${duration} days
- Interests: ${interests || 'general tourism'}
- Budget: ${budget || 'moderate'}

Return ONLY this JSON structure with NO additional text, NO markdown, NO code blocks:

{
  "title": "Trip to ${destination}",
  "description": "A ${duration}-day trip",
  "events": [
    {
      "title": "Visit Senso-ji Temple",
      "description": "Explore Tokyo's oldest Buddhist temple",
      "location": "Senso-ji Temple, Asakusa, Tokyo, Japan",
      "dayNumber": 1,
      "suggestedStartTime": "09:00",
      "suggestedEndTime": "11:00"
    }
  ]
}

CRITICAL Rules for "location" field:
- Format: [Landmark/Venue Name], [Neighborhood/District], [City], [Country]
- DO NOT include street numbers or detailed addresses
- Use well-known landmark names that can be searched
- Examples of GOOD locations:
  * "Tokyo Skytree, Sumida, Tokyo, Japan" ✓
  * "Louvre Museum, 1st arrondissement, Paris, France" ✓
  * "Omoide Yokocho, Shinjuku, Tokyo, Japan" ✓
  * "Tsukiji Outer Market, Tsukiji, Tokyo, Japan" ✓
- Examples of BAD locations:
  * "Asakusa Nakasei, 2-7-11 Asakusa, Taito City, Tokyo, Japan" ❌ (too detailed)
  * "Restaurant in downtown" ❌ (too vague)
  * "Shopping district" ❌ (no specific name)

Other rules:
- Create 3-5 events per day
- Times in HH:MM 24-hour format
- dayNumber starts at 1
- Include diverse activities (temples, museums, restaurants, parks, shopping)
- Use actual place names, not generic descriptions`;

    // Call OpenRouter API with free model
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Travel Buddy App'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON API. Return ONLY valid JSON. No markdown. No explanation. Just JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AI] OpenRouter API error:', errorData);
      throw new Error(errorData.error?.message || 'AI API request failed');
    }

    const completion = await response.json();
    let aiResponse = completion.choices[0].message.content;
    console.log('[AI] Raw response (first 500 chars):', aiResponse.substring(0, 500));

    // Multi-stage cleanup to handle various response formats
    aiResponse = aiResponse.trim();
    
    // Remove markdown code blocks
    if (aiResponse.includes('```json')) {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) aiResponse = jsonMatch[1];
    } else if (aiResponse.includes('```')) {
      const codeMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) aiResponse = codeMatch[1];
    }
    
    // Extract JSON if wrapped in text
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiResponse = jsonMatch[0];
    }
    
    aiResponse = aiResponse.trim();
    console.log('[AI] Cleaned response (first 500 chars):', aiResponse.substring(0, 500));

    // Parse AI response
    let itinerary;
    try {
      itinerary = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('[AI] Parse error:', parseError.message);
      console.error('[AI] Full response that failed:', aiResponse);
      return res.status(500).json({ 
        error: 'AI returned invalid response format',
        details: 'The AI model did not return valid JSON. Please try again.'
      });
    }

    // Validate structure
    if (!itinerary.events || !Array.isArray(itinerary.events)) {
      console.error('[AI] Invalid structure:', itinerary);
      return res.status(500).json({ 
        error: 'AI response missing events array',
        details: 'The AI response was valid JSON but missing required "events" array.'
      });
    }
    
    // Validate each event has required fields
    const invalidEvents = itinerary.events.filter(e => 
      !e.title || !e.location || !e.dayNumber
    );
    if (invalidEvents.length > 0) {
      console.error('[AI] Invalid events found:', invalidEvents);
      return res.status(500).json({ 
        error: 'AI response contains invalid events',
        details: 'Some events are missing required fields (title, location, or dayNumber).'
      });
    }

    console.log('[AI] Generated itinerary with', itinerary.events.length, 'events');

    // Return itinerary for preview (don't create trip yet)
    res.json({
      itinerary,
      message: 'Itinerary generated successfully'
    });

  } catch (error) {
    console.error('[AI] Generate trip error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ error: 'OpenAI API quota exceeded' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate trip',
      details: error.message 
    });
  }
});

// POST /api/ai/create-trip - Create trip from AI itinerary with geocoding
router.post('/create-trip', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { itinerary, startDate, userId } = req.body;

    if (!itinerary || !startDate || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('[AI] Creating trip with', itinerary.events.length, 'events');

    await client.query('BEGIN');

    // Calculate end date
    const start = new Date(startDate);
    const durationDays = Math.max(...itinerary.events.map(e => e.dayNumber));
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays - 1);

    // Create trip
    const tripResult = await client.query(
      `INSERT INTO trips (owner_id, title, description, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, itinerary.title, itinerary.description, start.toISOString(), end.toISOString()]
    );

    const newTrip = tripResult.rows[0];
    console.log('[AI] Trip created:', newTrip.id);

    // Geocode all locations in parallel
    console.log('[AI] Geocoding', itinerary.events.length, 'locations...');
    const locations = itinerary.events.map(e => e.location);
    const geocodedResults = await geocodeMultipleLocations(locations);
    
    // Log geocoding results
    const successCount = geocodedResults.filter(r => r !== null).length;
    console.log(`[AI] Geocoding complete: ${successCount}/${geocodedResults.length} locations found`);
    geocodedResults.forEach((result, index) => {
      if (!result) {
        console.warn(`[AI] Failed to geocode: "${locations[index]}"`);
      }
    });

    // Create events with geocoded data
    for (let i = 0; i < itinerary.events.length; i++) {
      const event = itinerary.events[i];
      const geocoded = geocodedResults[i];

      // Calculate actual datetime
      const eventDate = new Date(start);
      eventDate.setDate(eventDate.getDate() + event.dayNumber - 1);

      let startTime = null;
      let endTime = null;

      if (event.suggestedStartTime) {
        const [hours, minutes] = event.suggestedStartTime.split(':');
        startTime = new Date(eventDate);
        startTime.setHours(parseInt(hours), parseInt(minutes), 0);
      }

      if (event.suggestedEndTime) {
        const [hours, minutes] = event.suggestedEndTime.split(':');
        endTime = new Date(eventDate);
        endTime.setHours(parseInt(hours), parseInt(minutes), 0);
      }

      await client.query(
        `INSERT INTO trip_events 
          (trip_id, creator_id, title, description, start_time, end_time, address, city, country, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newTrip.id,
          userId,
          event.title,
          event.description,
          startTime ? startTime.toISOString() : null,
          endTime ? endTime.toISOString() : null,
          geocoded?.display_name || event.location,
          geocoded?.city,
          geocoded?.country,
          geocoded?.latitude,
          geocoded?.longitude
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[AI] Trip creation completed successfully');

    res.status(201).json(newTrip);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[AI] Create trip error:', error);
    res.status(500).json({ 
      error: 'Failed to create trip from itinerary',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

export default router;
