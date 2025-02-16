const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Admin-only Dashboard
router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: 'Welcome Admin!' });
});

module.exports = router;
