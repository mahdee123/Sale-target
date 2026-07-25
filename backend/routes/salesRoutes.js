const express = require('express');
const router = express.Router();
const {
    addSale,
    getMySales,
    getAllSales,
    deleteSale,
    getDashboardStats,
    getDailyReport,
    getMonthlyReport,
    getSalesmanPerformance,
    getBranchReport
} = require('../controllers/salesController');
const { authenticateToken, requireAdmin, requireSalesman } = require('../middleware/authMiddleware');

// POST /api/sales - Add new sale (Salesman only)
router.post('/', authenticateToken, requireSalesman, addSale);

// GET /api/sales/my - Get own sales (Salesman only)
router.get('/my', authenticateToken, requireSalesman, getMySales);

// DELETE /api/sales/:id - Delete own sale (Salesman only, same day)
router.delete('/:id', authenticateToken, requireSalesman, deleteSale);

// Admin routes
router.use(authenticateToken, requireAdmin);

// GET /api/sales/all - Get all sales (Admin)
router.get('/all', getAllSales);

// GET /api/sales/dashboard - Dashboard stats
router.get('/dashboard', getDashboardStats);

// GET /api/sales/daily-report
router.get('/daily-report', getDailyReport);

// GET /api/sales/monthly-report
router.get('/monthly-report', getMonthlyReport);

// GET /api/sales/salesman-performance
router.get('/salesman-performance', getSalesmanPerformance);

// GET /api/sales/branch-report
router.get('/branch-report', getBranchReport);

module.exports = router;
