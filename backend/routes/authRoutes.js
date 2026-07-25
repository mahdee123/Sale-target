const express = require('express');
const router = express.Router();
const { login, getMe, register } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getDb } = require('../config/database');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (Public - salesman self-registration)
router.post('/register', register);

// GET /api/auth/branches (Public - for registration dropdown)
router.get('/branches', async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });
        const result = await db.query('SELECT id, branch_name FROM branches ORDER BY branch_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

module.exports = router;
