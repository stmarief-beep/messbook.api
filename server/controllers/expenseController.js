const Expense = require('../models/Expense');
const MessMember = require('../models/MessMember');
const User = require('../models/User');

// Add new expense
const addExpense = async (req, res) => {
    try {
        const { amount, description, type, date, guests, paid_by } = req.body;
        const userId = req.user.id;

        const membership = await MessMember.findOne({ where: { user_id: userId } });
        if (!membership) {
            return res.status(400).json({ message: 'You are not a member of any mess' });
        }

        const newExpense = await Expense.create({
            amount,
            description,
            type,
            date: date || new Date(),
            user_id: paid_by === 'guest' ? null : userId,
            mess_id: membership.mess_id,
            guests: guests || 0
        });

        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        console.error('Error in addExpense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get expenses for the mess
const getMessExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await MessMember.findOne({ where: { user_id: userId } });

        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        const expenses = await Expense.findAll({
            where: { mess_id: membership.mess_id },
            order: [['date', 'DESC']]
        });

        const expenseList = expenses.map(e => e.toJSON());
        const userIds = [...new Set(expenseList.map(e => e.user_id))];
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'name']
        });

        const enrichedExpenses = expenseList.map(e => ({
            ...e,
            added_by: e.user_id ? (users.find(u => u.id === e.user_id)?.name || 'Unknown') : 'Guest'
        }));

        res.json(enrichedExpenses);

    } catch (error) {
        console.error('Error in getMessExpenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get expense summary (total for current month)
const getExpenseSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await MessMember.findOne({ where: { user_id: userId } });

        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await Expense.findAll({
            where: {
                mess_id: membership.mess_id,
                date: {
                    [require('sequelize').Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        res.json({
            total: total.toFixed(2),
            period: `${startOfMonth.getDate()} ${startOfMonth.toLocaleString('default', { month: 'short' })} - ${endOfMonth.getDate()} ${endOfMonth.toLocaleString('default', { month: 'short' })}`,
            startDate: startOfMonth,
            endDate: endOfMonth
        });

    } catch (error) {
        console.error('Error in getExpenseSummary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get category breakdown
const getCategoryBreakdown = async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await MessMember.findOne({ where: { user_id: userId } });

        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const startStr = `${year}-${month}-01`;
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        const expenses = await Expense.findAll({
            where: {
                mess_id: membership.mess_id,
                date: {
                    [require('sequelize').Op.between]: [startStr, endStr]
                }
            }
        });

        const categories = {};
        let total = 0;

        expenses.forEach(exp => {
            const type = exp.type || 'General';
            if (!categories[type]) {
                categories[type] = 0;
            }
            categories[type] += parseFloat(exp.amount);
            total += parseFloat(exp.amount);
        });

        const breakdown = Object.keys(categories).map(cat => ({
            category: cat,
            amount: categories[cat].toFixed(2),
            percentage: total > 0 ? ((categories[cat] / total) * 100).toFixed(1) : 0
        }));

        res.json(breakdown);

    } catch (error) {
        console.error('Error in getCategoryBreakdown:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get top contributors
const getTopContributors = async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await MessMember.findOne({ where: { user_id: userId } });

        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const startStr = `${year}-${month}-01`;
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        const expenses = await Expense.findAll({
            where: {
                mess_id: membership.mess_id,
                date: {
                    [require('sequelize').Op.between]: [startStr, endStr]
                }
            }
        });

        const contributors = {};
        expenses.forEach(exp => {
            if (!contributors[exp.user_id]) {
                contributors[exp.user_id] = 0;
            }
            contributors[exp.user_id] += parseFloat(exp.amount);
        });

        const userIds = Object.keys(contributors).map(id => parseInt(id));
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'name']
        });

        const topContributors = Object.keys(contributors).map(uid => {
            const user = users.find(u => u.id === parseInt(uid));
            return {
                userId: parseInt(uid),
                name: user ? user.name : 'Unknown',
                amount: contributors[uid].toFixed(2)
            };
        }).sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

        res.json(topContributors);

    } catch (error) {
        console.error('Error in getTopContributors:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update expense
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, type, date, guests, paid_by } = req.body;
        const userId = req.user.id;

        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const membership = await MessMember.findOne({
            where: { user_id: userId, mess_id: expense.mess_id }
        });

        if (!membership) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await expense.update({
            amount: amount || expense.amount,
            description: description || expense.description,
            type: type || expense.type,
            date: date || expense.date,
            guests: guests !== undefined ? guests : expense.guests,
            user_id: paid_by === 'guest' ? null : (paid_by === 'self' ? userId : (paid_by || expense.user_id))
        });

        res.json({ message: 'Expense updated successfully', expense });

    } catch (error) {
        console.error('Error in updateExpense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check if user is the creator or admin
        const membership = await MessMember.findOne({
            where: { user_id: userId, mess_id: expense.mess_id }
        });

        if (!membership) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await expense.destroy();

        res.json({ message: 'Expense deleted successfully' });

    } catch (error) {
        console.error('Error in deleteExpense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addExpense,
    getMessExpenses,
    getExpenseSummary,
    getCategoryBreakdown,
    getTopContributors,
    updateExpense,
    deleteExpense
};
