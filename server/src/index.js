const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/users', require('./routes/users'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/trip_collaborators', require('./routes/trip_collaborators'));
app.use('/api/trip_events', require('./routes/trip_events'));

app.get("/api/places", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM places"); // example query
    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/debug/tables', async (req,res) => {
  const result1 = await pool.query("SELECT * FROM users;");
  const result2 = await pool.query("SELECT * FROM trips;");
  const result3 = await pool.query("SELECT * FROM trip_collaborators;");
  const result4 = await pool.query("SELECT * FROM trip_events;");
  res.json({
    users: result1.rows,
    trips: result2.rows,
    trip_collaborators: result3.rows,
    trip_events: result4.rows
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
