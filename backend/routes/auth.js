const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

// Admin & User login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        console.log('Stored hash:', user.password);
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log('Stored hash:', user.password);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with role
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );
        console.log('Token generated:', token);
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
