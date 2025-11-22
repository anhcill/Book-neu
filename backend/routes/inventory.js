const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// All routes require admin access
router.get('/alerts', authenticateToken, adminMiddleware, inventoryController.getLowStockProducts);
router.get('/stats', authenticateToken, adminMiddleware, inventoryController.getInventoryStats);
router.put('/:productId/stock', authenticateToken, adminMiddleware, inventoryController.updateStock);

module.exports = router;
