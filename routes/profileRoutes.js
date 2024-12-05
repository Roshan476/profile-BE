const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFilePath = path.join(__dirname, '../models/database.json');

// Ensure the JSON file exists
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, '[]', 'utf-8');
}

// Helper functions
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error.message); // Log the error
    return {}; // Return empty object for consistent data handling
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data file:', error.message); // Log the error
    throw new Error('Failed to write data'); // Re-throw error for handling in the calling code
  }
};

// Routes

// Get all profiles
router.get('/', (req, res) => {
  try {
    const profiles = readData();
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a profile by ID
router.get('/:id', (req, res) => {
  try {
    const profiles = readData();
    const profile = profiles.find((p) => p.id === parseInt(req.params.id));
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new profile
router.post('/', (req, res) => {
  try {
    const profiles = readData();
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const exists = profiles.some((p) => p.email === req.body.email);
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const newProfile = { id: Date.now(), ...req.body };
    profiles.push(newProfile);
    writeData(profiles);

    res.status(201).json({ success: true, data: newProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a profile
router.put('/:id', (req, res) => {
  try {
    const profiles = readData();
    const index = profiles.findIndex((p) => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Profile not found' });

    profiles[index] = { ...profiles[index], ...req.body };
    writeData(profiles);
    res.json({ success: true, data: profiles[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a profile
router.delete('/:id', (req, res) => {
  try {
    const profiles = readData(); // Read data from the file
    const userId = req.params.id; // Get the ID from the request parameters

    // Check if a profile with the given ID exists
    const userKey = Object.keys(profiles).find((key) => profiles[key].id === parseInt(userId));
    if (!userKey) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete the user
    delete profiles[userKey];

    // Write the updated data back to the file
    writeData(profiles);

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
