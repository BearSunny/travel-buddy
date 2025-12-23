import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { owner_id, title, description, start_date, end_date } = req.body;
    if (!owner_id || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (start_date && end_date) {
      const s = new Date(start_date);
      const e = new Date(end_date);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res
          .status(400)
          .json({ error: "Invalid date format for start_date or end_date" });
      }
      if (s > e) {
        return res
          .status(400)
          .json({ error: "start_date must be before or equal to end_date" });
      }
    } else if (start_date || end_date) {
      return res.status(400).json({ error: "Missing start_date or end_date" });
    }

    const ownerCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      owner_id,
    ]);
    if (ownerCheck.rowCount === 0) {
      return res.status(400).json({ error: "owner_id does not exist" });
    }

    const q =
      "INSERT INTO trips (owner_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, owner_id, title, description, start_date, end_date;";
    const values = [owner_id, title, description, start_date, end_date];

    const { rows } = await pool.query(q, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("trips POST error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/read/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const q = "SELECT * FROM trips WHERE id = $1";
    const values = [id];
    const result1 = await pool.query(q, values);

    // if (result1.rows.length === 0)
    //   return res.status(404).json({ error : 'Trip not found' });
    // return an empty array instead when there's no trip
    if (result1.rows.length === 0) {
      return res.status(200).json([]);
    }

    const result2 = await pool.query(
      "SELECT * FROM trip_events WHERE trip_id = $1 ORDER BY start_time",
      values
    );

    return res.status(200).json([{
      trip: result1.rows[0],
      trip_events: result2.rows,
    }]);
  } catch (err) {
    console.error("trips GET /:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const payload = req.body;
    const allowed = new Set([
      "owner_id",
      "title",
      "description",
      "start_date",
      "end_date",
    ]);
    const keys = Object.keys(payload).filter((k) => allowed.has(k));

    if (keys.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update" });
    }

    if (payload.owner_id) {
      const ownerCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [payload.owner_id]
      );
      if (ownerCheck.rowCount === 0) {
        return res.status(400).json({ error: "owner_id does not exist" });
      }
    }

    if (payload.start_date && payload.end_date) {
      const s = new Date(payload.start_date);
      const e = new Date(payload.end_date);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return res
          .status(400)
          .json({ error: "Invalid date format for start_date or end_date" });
      }
      if (s > e) {
        return res
          .status(400)
          .json({ error: "start_date must be before or equal to end_date" });
      }
    } else if (payload.start_date || payload.end_date) {
      return res.status(400).json({ error: "Missing start_date or end_date" });
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
    const q = `UPDATE trips SET ${sets.join(
      ", "
    )} WHERE id = $${idx} RETURNING id, owner_id, title, description, start_date, end_date;`;
    const { rows } = await pool.query(q, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("trips PATCH /:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query("SELECT id FROM trips WHERE id = $1", [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    await pool.query("DELETE FROM trips WHERE id = $1", [id]);
    return res.status(200).json({ message: "Trip deleted successfully", id });
  } catch (err) {
    console.error("trips DELETE /:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Mark trip as completed or cancelled
router.patch("/complete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completion_status, notes } = req.body;

    if (!completion_status || !['completed', 'cancelled'].includes(completion_status)) {
      return res.status(400).json({ error: "Invalid completion_status. Must be 'completed' or 'cancelled'" });
    }

    // Calculate completion percentage based on event statuses
    const eventsQuery = await pool.query(
      `SELECT COUNT(*) as total, 
       COUNT(CASE WHEN status = 'done' THEN 1 END) as done_count 
       FROM trip_events WHERE trip_id = $1`,
      [id]
    );

    const { total, done_count } = eventsQuery.rows[0];
    const completion_percentage = total > 0 ? Math.round((done_count / total) * 100) : 0;

    // Update trip
    const query = `
      UPDATE trips 
      SET completion_status = $1, 
          completion_percentage = $2,
          completed_at = NOW(),
          description = CASE 
            WHEN $3::TEXT IS NOT NULL AND $3::TEXT != '' 
            THEN CONCAT(COALESCE(description, ''), E'\\n\\n', 'Final Notes: ', $3::TEXT)
            ELSE description
          END
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [completion_status, completion_percentage, notes, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("trips PATCH /complete/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /trips/reopen/:id - Reopen a completed trip
router.patch("/reopen/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Update trip back to in_progress status
    const query = `
      UPDATE trips 
      SET completion_status = 'in_progress',
          completed_at = NULL
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("trips PATCH /reopen/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
