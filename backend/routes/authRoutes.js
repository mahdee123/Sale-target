const express = require('express');
const router = express.Router();
const { login, getMe, register } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (Public - salesman self-registration)
router.post('/register', register);

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

module.exports = router;
