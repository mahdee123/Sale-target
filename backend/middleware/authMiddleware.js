const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sales-target-secret-key-2026';

// Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Check if user is salesman
const requireSalesman = (req, res, next) => {
    if (req.user.role !== 'salesman') {
        return res.status(403).json({ error: 'Access denied. Salesman only.' });
    }
    next();
};

module.exports = { authenticateToken, requireAdmin, requireSalesman, JWT_SECRET };
