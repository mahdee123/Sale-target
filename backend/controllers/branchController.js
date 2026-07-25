const { getDb } = require('../config/database');

// Get all branches
const getAllBranches = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const result = await db.query(`
            SELECT b.*,
                (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND role = 'salesman') as salesman_count
            FROM branches b
            ORDER BY b.branch_name
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single branch
const getBranch = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const result = await db.query(`
            SELECT b.*,
                (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND role = 'salesman') as salesman_count
            FROM branches b
            WHERE b.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Branch not found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create branch
const createBranch = async (req, res) => {
    try {
        const { branch_name } = req.body;

        if (!branch_name || !branch_name.trim()) {
            return res.status(400).json({ error: 'Branch name is required.' });
        }

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const existingBranch = await db.query('SELECT id FROM branches WHERE branch_name = $1', [branch_name.trim()]);
        if (existingBranch.rows.length > 0) {
            return res.status(400).json({ error: 'Branch name already exists.' });
        }

        const result = await db.query(
            'INSERT INTO branches (branch_name) VALUES ($1) RETURNING *',
            [branch_name.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update branch
const updateBranch = async (req, res) => {
    try {
        const { branch_name } = req.body;
        const { id } = req.params;

        if (!branch_name || !branch_name.trim()) {
            return res.status(400).json({ error: 'Branch name is required.' });
        }

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const existingBranch = await db.query('SELECT id FROM branches WHERE id = $1', [id]);
        if (existingBranch.rows.length === 0) {
            return res.status(404).json({ error: 'Branch not found.' });
        }

        const duplicateBranch = await db.query('SELECT id FROM branches WHERE branch_name = $1 AND id != $2', [branch_name.trim(), id]);
        if (duplicateBranch.rows.length > 0) {
            return res.status(400).json({ error: 'Branch name already exists.' });
        }

        const result = await db.query(
            'UPDATE branches SET branch_name = $1 WHERE id = $2 RETURNING *',
            [branch_name.trim(), id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete branch
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const branch = await db.query('SELECT id FROM branches WHERE id = $1', [id]);
        if (branch.rows.length === 0) {
            return res.status(404).json({ error: 'Branch not found.' });
        }

        const salesmenInBranch = await db.query('SELECT COUNT(*) as count FROM users WHERE branch_id = $1 AND role = $2', [id, 'salesman']);
        if (parseInt(salesmenInBranch.rows[0].count) > 0) {
            return res.status(400).json({ error: 'Cannot delete branch with active salesmen. Remove or reassign salesmen first.' });
        }

        await db.query('DELETE FROM branches WHERE id = $1', [id]);
        res.json({ message: 'Branch deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllBranches, getBranch, createBranch, updateBranch, deleteBranch };
