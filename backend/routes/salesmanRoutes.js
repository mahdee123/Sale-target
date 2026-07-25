const express = require('express');
const router = express.Router();
const {
    getAllSalesmen,
    getSalesman,
    createSalesman,
    updateSalesman,
    resetPassword,
    toggleStatus
} = require('../controllers/salesmanController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// GET /api/salesmen
router.get('/', getAllSalesmen);

// GET /api/salesmen/:id
router.get('/:id', getSalesman);

// POST /api/salesmen
router.post('/', createSalesman);

// PUT /api/salesmen/:id
router.put('/:id', updateSalesman);

// PUT /api/salesmen/:id/reset-password
router.put('/:id/reset-password', resetPassword);

// PUT /api/salesmen/:id/toggle-status
router.put('/:id/toggle-status', toggleStatus);

module.exports = router;
