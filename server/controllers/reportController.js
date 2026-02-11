const Expense = require('../models/Expense');
const MessMember = require('../models/MessMember');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get detailed member reports
const getMemberReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month: queryMonth, year: queryYear } = req.query;

        // Get user's mess
        const membership = await MessMember.findOne({ where: { user_id: userId } });
        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        // Get selected month date range or default to current
        const now = new Date();
        const year = queryYear ? parseInt(queryYear) : now.getFullYear();
        const month = queryMonth ? parseInt(queryMonth) : now.getMonth() + 1; // 1-indexed

        const monthStr = String(month).padStart(2, '0');
        const startStr = `${year}-${monthStr}-01`;
        const lastDayDate = new Date(year, month, 0); // Day 0 of next month is last day of this month (month is 1-indexed here effectively)
        const lastDay = lastDayDate.getDate();
        const endStr = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

        // Use for period display
        const startOfMonth = new Date(year, month - 1, 1); // JS Date months are 0-indexed
        const endOfMonth = lastDayDate;

        // Get all expenses for current month
        const expenses = await Expense.findAll({
            where: {
                mess_id: membership.mess_id,
                date: {
                    [Op.between]: [startStr, endStr]
                }
            }
        });

        // Get all active members
        const members = await MessMember.findAll({
            where: {
                mess_id: membership.mess_id,
                status: 'active'
            }
        });

        if (members.length === 0) {
            return res.json({ reports: [] });
        }

        // Initialize accounting objects
        const userStats = {};
        members.forEach(m => {
            userStats[m.user_id] = {
                regularSpent: 0, regularActual: 0,
                guestSpent: 0, guestActual: 0,
                sharedSpent: 0, sharedActual: 0,
                userName: ''
            };
        });

        const guestStats = {
            regularSpent: 0, regularActual: 0,
            guestSpent: 0, guestActual: 0,
            sharedSpent: 0, sharedActual: 0,
            userName: 'Guest / Friends'
        };

        // Fetch user names for mapping
        const users = await User.findAll({
            where: { id: members.map(m => m.user_id) },
            attributes: ['id', 'name']
        });
        users.forEach(u => {
            if (userStats[u.id]) userStats[u.id].userName = u.name;
        });

        // Process each expense
        expenses.forEach(exp => {
            const amount = parseFloat(exp.amount);
            const guestsOnExp = parseInt(exp.guests) || 0;
            const totalParticipants = members.length + guestsOnExp;
            const singleShare = amount / totalParticipants;

            // Determine category
            let category = 'regular';
            if (exp.type === 'Shared') {
                category = 'shared';
            } else if (guestsOnExp > 0) {
                category = 'guest';
            }

            // 1. Credit the payer
            if (exp.user_id && userStats[exp.user_id]) {
                if (category === 'regular') userStats[exp.user_id].regularSpent += amount;
                else if (category === 'guest') userStats[exp.user_id].guestSpent += amount;
                else userStats[exp.user_id].sharedSpent += amount;
            } else if (!exp.user_id) {
                // Guest paid
                if (category === 'regular') guestStats.regularSpent += amount;
                else if (category === 'guest') guestStats.guestSpent += amount;
                else guestStats.sharedSpent += amount;
            }

            // 2. Charge the participants
            members.forEach(m => {
                const stats = userStats[m.user_id];
                if (category === 'regular') stats.regularActual += singleShare;
                else if (category === 'guest') stats.guestActual += singleShare;
                else stats.sharedActual += singleShare;
            });

            // 3. Charge Guests if present
            if (guestsOnExp > 0) {
                const guestShareTotal = singleShare * guestsOnExp;
                if (category === 'regular') guestStats.regularActual += guestShareTotal;
                else if (category === 'guest') guestStats.guestActual += guestShareTotal;
                else guestStats.sharedActual += guestShareTotal;
            }
        });

        // Generate report objects for Members
        const reports = members.map(member => {
            const stats = userStats[member.user_id];

            const fmt = (val) => parseFloat(val.toFixed(2));

            const regularBalance = stats.regularSpent - stats.regularActual;
            const guestBalance = stats.guestSpent - stats.guestActual;
            const sharedBalance = stats.sharedSpent - stats.sharedActual;
            const overallBalance = regularBalance + guestBalance + sharedBalance;

            return {
                userId: member.user_id,
                userName: stats.userName,
                regular: {
                    spent: fmt(stats.regularSpent),
                    actual: fmt(stats.regularActual),
                    balance: fmt(regularBalance)
                },
                guest: {
                    spent: fmt(stats.guestSpent),
                    actual: fmt(stats.guestActual),
                    balance: fmt(guestBalance)
                },
                shared: {
                    spent: fmt(stats.sharedSpent),
                    actual: fmt(stats.sharedActual),
                    balance: fmt(sharedBalance)
                },
                overallBalance: fmt(overallBalance)
            };
        });

        // Add the Guest report entry if there were any guest expenses or payments
        const allGuestActivity =
            guestStats.regularSpent + guestStats.regularActual +
            guestStats.guestSpent + guestStats.guestActual +
            guestStats.sharedSpent + guestStats.sharedActual;

        if (allGuestActivity > 0) {
            const fmt = (val) => parseFloat(val.toFixed(2));

            const regularBalance = guestStats.regularSpent - guestStats.regularActual;
            const guestBalance = guestStats.guestSpent - guestStats.guestActual;
            const sharedBalance = guestStats.sharedSpent - guestStats.sharedActual;
            const overallBalance = regularBalance + guestBalance + sharedBalance;

            reports.push({
                userId: 'guest',
                userName: guestStats.userName,
                isGuest: true,
                regular: {
                    spent: fmt(guestStats.regularSpent),
                    actual: fmt(guestStats.regularActual),
                    balance: fmt(regularBalance)
                },
                guest: {
                    spent: fmt(guestStats.guestSpent),
                    actual: fmt(guestStats.guestActual),
                    balance: fmt(guestBalance)
                },
                shared: {
                    spent: fmt(guestStats.sharedSpent),
                    actual: fmt(guestStats.sharedActual),
                    balance: fmt(sharedBalance)
                },
                overallBalance: fmt(overallBalance)
            });
        }

        res.json({
            reports,
            period: `${startOfMonth.getDate()} ${startOfMonth.toLocaleString('default', { month: 'short' })} - ${endOfMonth.getDate()} ${endOfMonth.toLocaleString('default', { month: 'short' })} ${year}`
        });

    } catch (error) {
        console.error('Error in getMemberReports:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMemberReports
};
