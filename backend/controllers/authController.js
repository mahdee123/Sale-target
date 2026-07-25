const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Login user (Admin or Salesman)
const login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({ error: 'Mobile/Username and password are required.' });
        }

        const db = getDb();
        if (!db) {
            return res.status(500).json({ error: 'Database not configured.' });
        }

        const result = await db.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'Account is disabled. Contact administrator.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, branch_id: user.branch_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                mobile: user.mobile,
                role: user.role,
                branch_id: user.branch_id
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user profile
const getMe = async (req, res) => {
    try {
        const db = getDb();
        if (!db) {
            return res.status(500).json({ error: 'Database not configured.' });
        }

        const result = await db.query(`
            SELECT u.id, u.full_name, u.mobile, u.role, u.branch_id, b.branch_name
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.id = $1
        `, [req.user.id]);

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Register new salesman (Public)
const register = async (req, res) => {
    try {
        const { full_name, mobile, password, branch_id } = req.body;

        if (!full_name || !mobile || !password || !branch_id) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const db = getDb();
        if (!db) {
            return res.status(500).json({ error: 'Database not configured.' });
        }

        const existingUser = await db.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Mobile number already registered.' });
        }

        const branch = await db.query('SELECT id FROM branches WHERE id = $1', [branch_id]);
        if (branch.rows.length === 0) {
            return res.status(400).json({ error: 'Branch not found.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(`
            INSERT INTO users (full_name, mobile, password, role, branch_id, status)
            VALUES ($1, $2, $3, 'salesman', $4, 'active')
        `, [full_name.trim(), mobile, hashedPassword, branch_id]);

        res.status(201).json({ message: 'Account created successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login, getMe, register };
