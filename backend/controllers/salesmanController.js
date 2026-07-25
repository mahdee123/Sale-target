const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');

// Get all salesmen
const getAllSalesmen = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const { branch_id, status } = req.query;
        let query = `
            SELECT u.id, u.full_name, u.mobile, u.role, u.branch_id, u.status, u.created_at,
                b.branch_name
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.role = 'salesman'
        `;
        const params = [];
        let paramIndex = 1;

        if (branch_id) {
            query += ` AND u.branch_id = $${paramIndex}`;
            params.push(branch_id);
            paramIndex++;
        }

        if (status) {
            query += ` AND u.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ' ORDER BY u.full_name';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single salesman
const getSalesman = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const result = await db.query(`
            SELECT u.id, u.full_name, u.mobile, u.role, u.branch_id, u.status, u.created_at,
                b.branch_name
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.id = $1 AND u.role = 'salesman'
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Salesman not found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create salesman
const createSalesman = async (req, res) => {
    try {
        const { full_name, mobile, password, branch_id } = req.body;

        if (!full_name || !mobile || !password || !branch_id) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const existingUser = await db.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Mobile number already registered.' });
        }

        const branch = await db.query('SELECT id FROM branches WHERE id = $1', [branch_id]);
        if (branch.rows.length === 0) {
            return res.status(400).json({ error: 'Branch not found.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(`
            INSERT INTO users (full_name, mobile, password, role, branch_id, status)
            VALUES ($1, $2, $3, 'salesman', $4, 'active')
            RETURNING *
        `, [full_name.trim(), mobile, hashedPassword, branch_id]);

        const newSalesman = await db.query(`
            SELECT u.id, u.full_name, u.mobile, u.role, u.branch_id, u.status, u.created_at,
                b.branch_name
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.id = $1
        `, [result.rows[0].id]);

        res.status(201).json(newSalesman.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update salesman
const updateSalesman = async (req, res) => {
    try {
        const { full_name, mobile, branch_id } = req.body;
        const { id } = req.params;

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const salesman = await db.query('SELECT id FROM users WHERE id = $1 AND role = $2', [id, 'salesman']);
        if (salesman.rows.length === 0) {
            return res.status(404).json({ error: 'Salesman not found.' });
        }

        const existingUser = await db.query('SELECT id FROM users WHERE mobile = $1 AND id != $2', [mobile, id]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Mobile number already registered.' });
        }

        if (branch_id) {
            const branch = await db.query('SELECT id FROM branches WHERE id = $1', [branch_id]);
            if (branch.rows.length === 0) {
                return res.status(400).json({ error: 'Branch not found.' });
            }
        }

        await db.query(`
            UPDATE users SET full_name = $1, mobile = $2, branch_id = $3
            WHERE id = $4
        `, [full_name.trim(), mobile, branch_id, id]);

        const updatedSalesman = await db.query(`
            SELECT u.id, u.full_name, u.mobile, u.role, u.branch_id, u.status, u.created_at,
                b.branch_name
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.id = $1
        `, [id]);

        res.json(updatedSalesman.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reset salesman password
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { id } = req.params;

        if (!password) {
            return res.status(400).json({ error: 'New password is required.' });
        }

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const salesman = await db.query('SELECT id FROM users WHERE id = $1 AND role = $2', [id, 'salesman']);
        if (salesman.rows.length === 0) {
            return res.status(404).json({ error: 'Salesman not found.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);

        res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle salesman status (enable/disable)
const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const salesman = await db.query('SELECT id, status FROM users WHERE id = $1 AND role = $2', [id, 'salesman']);
        if (salesman.rows.length === 0) {
            return res.status(404).json({ error: 'Salesman not found.' });
        }

        const newStatus = salesman.rows[0].status === 'active' ? 'inactive' : 'active';
        await db.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, id]);

        const updatedSalesman = await db.query(`
            SELECT u.id, u.full_name, u.mobile, u.role, u.branch_id, u.status, u.created_at,
                b.branch_name
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.id = $1
        `, [id]);

        res.json(updatedSalesman.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllSalesmen, getSalesman, createSalesman, updateSalesman, resetPassword, toggleStatus };
