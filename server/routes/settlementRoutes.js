const express = require('express');
const {
    calculateSettlements,
    getSettlements,
    saveSettlement,
    markAsPaid
} = require('../controllers/settlementController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/calculate', authMiddleware, calculateSettlements);
router.get('/all', authMiddleware, getSettlements);
router.post('/save', authMiddleware, saveSettlement);
router.put('/mark-paid/:id', authMiddleware, markAsPaid);

module.exports = router;
