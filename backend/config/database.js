const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool = null;

function getDb() {
    if (!pool) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return pool;
}

async function initializeDatabase() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.log('No DATABASE_URL found. Using local mode (no database).');
        console.log('For Railway deployment, set DATABASE_URL environment variable.');
        return;
    }

    pool = new Pool({
        connectionString: connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');
        client.release();
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        throw error;
    }

    // Create tables
    await pool.query(`
        CREATE TABLE IF NOT EXISTS branches (
            id SERIAL PRIMARY KEY,
            branch_name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'salesman')) NOT NULL,
            branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
            status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
            id SERIAL PRIMARY KEY,
            salesman_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
            sale_date DATE NOT NULL,
            sale_time TIME NOT NULL,
            amount REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
        CREATE INDEX IF NOT EXISTS idx_sales_salesman ON sales(salesman_id);
        CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
    `);

    // Create default admin if not exists
    const adminCheck = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            'INSERT INTO users (full_name, mobile, password, role, status) VALUES ($1, $2, $3, $4, $5)',
            ['Administrator', 'admin', hashedPassword, 'admin', 'active']
        );
        console.log('Default admin created: admin / admin123');
    }

    console.log('Database initialized successfully');
}

module.exports = { initializeDatabase, getDb };
