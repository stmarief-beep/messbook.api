const express = require('express');
const {
    addExpense,
    getMessExpenses,
    getExpenseSummary,
    getCategoryBreakdown,
    getTopContributors,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, addExpense);
router.get('/all', authMiddleware, getMessExpenses);
router.get('/summary', authMiddleware, getExpenseSummary);
router.get('/categories', authMiddleware, getCategoryBreakdown);
router.get('/contributors', authMiddleware, getTopContributors);
router.put('/:id', authMiddleware, updateExpense);
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;
