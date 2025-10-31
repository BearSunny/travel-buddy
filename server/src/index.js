const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/places', (req, res) => {
  res.json({ message: 'Places API endpoint' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});