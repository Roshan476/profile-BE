//Main entry file

const express = require('express');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = 5002;

// Middleware
app.use(express.json());

// API Routes
app.use('/api/profiles', profileRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
