const User = require('../models/User');
const MessMember = require('../models/MessMember');
const Mess = require('../models/Mess');
const Expense = require('../models/Expense');
const { Op } = require('sequelize');

// Get User Profile with Basic Stats
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get User Details
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Get Mess Details
        const membership = await MessMember.findOne({ where: { user_id: userId } });
        let messInfo = null;
        let currentMonthStats = {
            spent: 0,
            share: 0,
            balance: 0
        };

        if (membership) {
            // Fetch actual mess details
            const mess = await Mess.findByPk(membership.mess_id);

            messInfo = {
                messId: membership.mess_id,
                messName: mess ? mess.name : `Mess #${membership.mess_id}`,
                role: membership.role, // admin or member
                joinedAt: membership.createdAt
            };

            // 3. Calculate Rough Current Month Stats (Simplified)
            // Note: detailed calculation logic is in reportController. 
            // Here we just want a quick snapshot if possible, or we can reuse logic.
            // For now, let's keep it simple: Total Expenses Paid by User this month.

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const expensesPaid = await Expense.sum('amount', {
                where: {
                    user_id: userId,
                    mess_id: membership.mess_id,
                    date: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            });

            currentMonthStats.spent = expensesPaid || 0;

            // To get "Share" and "Balance", we'd need to run the full settlement logic.
            // For a "Profile" page, "Total Paid This Month" is a good enough metric for now.
        }

        res.json({
            user,
            mess: messInfo,
            stats: {
                currentMonthPaid: currentMonthStats.spent
            }
        });

    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile
};
