const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const branchRoutes = require('./routes/branchRoutes');
const salesmanRoutes = require('./routes/salesmanRoutes');
const salesRoutes = require('./routes/salesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/salesmen', salesmanRoutes);
app.use('/api/sales', salesRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
    app.use(express.static(frontendBuild));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendBuild, 'index.html'));
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Sales Target API is running' });
});

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log('Default admin: admin / admin123');
        });
    } catch (error) {
        console.error('Failed to initialize database:', error.message);
        // Still start server even if database fails (for local dev without PostgreSQL)
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT} (without database)`);
        });
    }
}

startServer();

module.exports = app;
