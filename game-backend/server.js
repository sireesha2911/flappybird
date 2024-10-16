// server.js
const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

let highScore = 0;

// Endpoint to submit score
app.post('/api/score', (req, res) => {
  const { score } = req.body;

  if (score > highScore) {
    highScore = score;
  }

  res.json({ highScore });
});

// Endpoint to get the high score
app.get('/api/score', (req, res) => {
  res.json({ highScore });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
