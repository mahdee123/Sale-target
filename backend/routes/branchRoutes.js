const express = require('express');
const router = express.Router();
const { getAllBranches, getBranch, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// GET /api/branches
router.get('/', getAllBranches);

// GET /api/branches/:id
router.get('/:id', getBranch);

// POST /api/branches
router.post('/', createBranch);

// PUT /api/branches/:id
router.put('/:id', updateBranch);

// DELETE /api/branches/:id
router.delete('/:id', deleteBranch);

module.exports = router;
