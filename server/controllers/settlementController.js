const Expense = require('../models/Expense');
const MessMember = require('../models/MessMember');
const Settlement = require('../models/Settlement');
const User = require('../models/User');
const { Op } = require('sequelize');

// Calculate current settlements (who owes whom)
const calculateSettlements = async (req, res) => {
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

        const startOfMonth = new Date(year, month - 1, 1); // JS Date months are 0-indexed
        const endOfMonth = new Date(year, month, 0); // Last day of month

        // Get all expenses for current month
        const expenses = await Expense.findAll({
            where: {
                mess_id: membership.mess_id,
                date: {
                    [Op.between]: [startOfMonth, endOfMonth]
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
            return res.json({
                settlements: [],
                balances: [],
                totalExpenses: 0,
                fairShare: 0
            });
        }

        // Initialize stats - separate tracking for regular and guest expenses
        const userStats = {};
        members.forEach(m => {
            userStats[m.user_id] = {
                spent: 0,
                actual: 0,
                userName: '',
                regularSpent: 0,
                regularActual: 0,
                guestSpent: 0,
                guestActual: 0
            };
        });
        const guestStats = {
            spent: 0,
            actual: 0,
            userName: 'Guest / Friends',
            regularSpent: 0,
            regularActual: 0,
            guestSpent: 0,
            guestActual: 0
        };

        // Get user names
        const users = await User.findAll({
            where: { id: members.map(m => m.user_id) },
            attributes: ['id', 'name']
        });
        users.forEach(u => {
            if (userStats[u.id]) userStats[u.id].userName = u.name;
        });

        // Granular per-expense processing - separate regular and guest expenses
        let totalExpenses = 0;
        expenses.forEach(exp => {
            const amount = parseFloat(exp.amount);
            totalExpenses += amount;
            const guestsOnExp = parseInt(exp.guests) || 0;
            const isGuestExpense = guestsOnExp > 0;
            const totalParticipants = members.length + guestsOnExp;
            const singleShare = amount / totalParticipants;

            // Credit Payer
            // Categorize based on expense type: has guests or not
            if (exp.user_id && userStats[exp.user_id]) {
                userStats[exp.user_id].spent += amount;
                if (isGuestExpense) {
                    userStats[exp.user_id].guestSpent += amount; // Guest expense
                } else {
                    userStats[exp.user_id].regularSpent += amount; // Regular mess
                }
            } else if (!exp.user_id) {
                guestStats.spent += amount;
                guestStats.guestSpent += amount; // Guest always pays for guest expenses
            }

            // Charge Members
            // Categorize based on expense type: has guests or not
            members.forEach(m => {
                userStats[m.user_id].actual += singleShare;
                if (isGuestExpense) {
                    userStats[m.user_id].guestActual += singleShare; // Guest expense
                } else {
                    userStats[m.user_id].regularActual += singleShare; // Regular mess
                }
            });

            // Charge Guest
            if (guestsOnExp > 0) {
                guestStats.actual += (singleShare * guestsOnExp);
                guestStats.guestActual += (singleShare * guestsOnExp);
            }
        });

        // Calculate final balances with breakdown
        const balances = members.map(member => {
            const stats = userStats[member.user_id];
            return {
                userId: member.user_id,
                userName: stats.userName,
                paid: parseFloat(stats.spent.toFixed(2)),
                fairShare: parseFloat(stats.actual.toFixed(2)),
                balance: parseFloat((stats.spent - stats.actual).toFixed(2)),
                regularBalance: parseFloat((stats.regularSpent - stats.regularActual).toFixed(2)),
                guestBalance: parseFloat((stats.guestSpent - stats.guestActual).toFixed(2))
            };
        });

        // Add Guest to balances if they exist
        if (guestStats.actual > 0 || guestStats.spent > 0) {
            balances.push({
                userId: 'guest',
                userName: guestStats.userName,
                paid: parseFloat(guestStats.spent.toFixed(2)),
                fairShare: parseFloat(guestStats.actual.toFixed(2)),
                balance: parseFloat((guestStats.spent - guestStats.actual).toFixed(2)),
                regularBalance: parseFloat((guestStats.regularSpent - guestStats.regularActual).toFixed(2)),
                guestBalance: parseFloat((guestStats.guestSpent - guestStats.guestActual).toFixed(2))
            });
        }

        // Generate settlement recommendations based on pairwise relationships
        // Track direct debts between each pair of people for each expense

        // Create pairwise debt matrix for tracking who owes whom
        const pairwiseDebts = {}; // key: "fromId_toId_category", value: amount

        // Process each expense to build pairwise relationships
        expenses.forEach(exp => {
            const amount = parseFloat(exp.amount);
            const guestsOnExp = parseInt(exp.guests) || 0;

            const totalParticipants = members.length + guestsOnExp;
            const perPersonShare = amount / totalParticipants;

            const payerId = exp.user_id || 'guest';

            // For each member participant, they owe the payer their share
            // Categorize based on EXPENSE TYPE (has guests or not)
            members.forEach(m => {
                const debtorId = m.user_id;

                // Skip if debtor is the payer
                if (debtorId === payerId) return;

                // Member shares categorized by expense type
                let category = 'regular';
                if (exp.type === 'Shared') {
                    category = 'shared';
                } else if (guestsOnExp > 0) {
                    category = 'guest';
                }
                const key = `${debtorId}_${payerId}_${category}`;
                pairwiseDebts[key] = (pairwiseDebts[key] || 0) + perPersonShare;
            });

            // If there are guests, they owe the payer their share
            // Guest consumption is ALWAYS categorized as 'guest'
            if (guestsOnExp > 0) {
                const guestShare = perPersonShare * guestsOnExp;

                // Skip if guest is the payer
                if (payerId !== 'guest') {
                    const key = `guest_${payerId}_guest`; // Always 'guest' for guest consumption
                    pairwiseDebts[key] = (pairwiseDebts[key] || 0) + guestShare;
                }
            }
        });

        // Net out pairwise debts (if A owes B and B owes A, net them)
        const netPairwiseDebts = {};

        Object.entries(pairwiseDebts).forEach(([key, amount]) => {
            const [fromId, toId, category] = key.split('_');
            const reverseKey = `${toId}_${fromId}_${category}`;

            if (pairwiseDebts[reverseKey]) {
                const reverseAmount = pairwiseDebts[reverseKey];
                const netAmount = amount - reverseAmount;

                if (netAmount > 0.01) {
                    // fromId owes toId the net amount
                    netPairwiseDebts[key] = netAmount;
                } else if (netAmount < -0.01) {
                    // toId owes fromId the absolute net amount
                    netPairwiseDebts[reverseKey] = Math.abs(netAmount);
                }
                // If close to zero, no debt

                // Mark reverse as processed by deleting it
                delete pairwiseDebts[reverseKey];
            } else {
                // No reverse debt, keep the original
                if (amount > 0.01) {
                    netPairwiseDebts[key] = amount;
                }
            }
        });

        // First combine regular + guest + shared for each pair
        const pairCombined = {};
        Object.entries(netPairwiseDebts).forEach(([key, amount]) => {
            const [fromId, toId, category] = key.split('_');
            const pairKey = `${fromId}_${toId}`;

            if (!pairCombined[pairKey]) {
                pairCombined[pairKey] = { fromId, toId, regular: 0, guest: 0, shared: 0, total: 0 };
            }

            if (category === 'regular') {
                pairCombined[pairKey].regular += amount;
            } else if (category === 'shared') {
                pairCombined[pairKey].shared += amount;
            } else {
                pairCombined[pairKey].guest += amount;
            }
            pairCombined[pairKey].total += amount;
        });

        // Then net bidirectional debts
        const finalPairs = {};
        const processed = new Set();

        Object.entries(pairCombined).forEach(([key, data]) => {
            if (processed.has(key)) return;

            const { fromId, toId } = data;
            const reverseKey = `${toId}_${fromId}`;

            if (pairCombined[reverseKey]) {
                // Both directions exist - net them
                const netAmount = data.total - pairCombined[reverseKey].total;

                if (Math.abs(netAmount) > 0.01) {
                    // Helper to distribute negative credits to positive debts
                    const distributeCredits = (debts) => {
                        const keys = ['regular', 'guest', 'shared'];
                        let credit = 0;
                        // Collect credits
                        keys.forEach(k => {
                            if (debts[k] < 0) {
                                credit += Math.abs(debts[k]);
                                debts[k] = 0;
                            }
                        });
                        // Distribute credits to reduce debts (Guest first, then Shared, then Regular)
                        const payOrder = ['guest', 'shared', 'regular'];
                        payOrder.forEach(k => {
                            if (credit > 0 && debts[k] > 0) {
                                const take = Math.min(credit, debts[k]);
                                debts[k] -= take;
                                credit -= take;
                            }
                        });
                        return debts;
                    };

                    if (netAmount > 0) {
                        // fromId owes toId (net)
                        let netRegular = data.regular - (pairCombined[reverseKey].regular || 0);
                        let netGuest = data.guest - (pairCombined[reverseKey].guest || 0);
                        let netShared = data.shared - (pairCombined[reverseKey].shared || 0);

                        const debts = distributeCredits({ regular: netRegular, guest: netGuest, shared: netShared });

                        finalPairs[key] = {
                            fromId,
                            toId,
                            regular: debts.regular,
                            guest: debts.guest,
                            shared: debts.shared,
                            total: netAmount,
                            breakdown: {
                                forward: { ...data },
                                reverse: { ...pairCombined[reverseKey] }
                            }
                        };
                    } else {
                        // toId owes fromId (net)
                        let netRegular = (pairCombined[reverseKey].regular || 0) - data.regular;
                        let netGuest = (pairCombined[reverseKey].guest || 0) - data.guest;
                        let netShared = (pairCombined[reverseKey].shared || 0) - data.shared;

                        const debts = distributeCredits({ regular: netRegular, guest: netGuest, shared: netShared });

                        finalPairs[reverseKey] = {
                            fromId: toId,
                            toId: fromId,
                            regular: debts.regular,
                            guest: debts.guest,
                            shared: debts.shared,
                            total: Math.abs(netAmount),
                            breakdown: {
                                forward: { ...pairCombined[reverseKey] },
                                reverse: { ...data }
                            }
                        };
                    }
                }

                processed.add(key);
                processed.add(reverseKey);
            } else {
                // Only one direction
                if (data.total > 0.01) {
                    finalPairs[key] = {
                        ...data,
                        shared: data.shared || 0,
                        breakdown: {
                            forward: { ...data },
                            reverse: { regular: 0, guest: 0, shared: 0, total: 0 }
                        }
                    };
                }
                processed.add(key);
            }
        });

        // Convert to settlement array
        const settlements = Object.values(finalPairs).map(data => {
            const { fromId, toId, regular, guest, shared, total, breakdown } = data;

            let fromName = 'Unknown';
            let toName = 'Unknown';

            if (fromId === 'guest') {
                fromName = 'Guest / Friends';
            } else {
                const fromUser = users.find(u => u.id == fromId);
                fromName = fromUser ? fromUser.name : 'Unknown';
            }

            if (toId === 'guest') {
                toName = 'Guest / Friends';
            } else {
                const toUser = users.find(u => u.id == toId);
                toName = toUser ? toUser.name : 'Unknown';
            }

            return {
                from_user_id: fromId,
                from_user_name: fromName,
                to_user_id: toId,
                to_user_name: toName,
                regularAmount: parseFloat(Math.max(0, regular || 0).toFixed(2)),
                guestAmount: parseFloat(Math.max(0, guest || 0).toFixed(2)),
                sharedAmount: parseFloat(Math.max(0, shared || 0).toFixed(2)),
                amount: parseFloat(total.toFixed(2)),
                breakdown, // Pass full breakdown
                status: 'pending'
            };
        });

        res.json({
            settlements,
            balances,
            totalExpenses: parseFloat(totalExpenses.toFixed(2)),
            period: `${startOfMonth.getDate()} ${startOfMonth.toLocaleString('default', { month: 'short' })} - ${endOfMonth.getDate()} ${endOfMonth.toLocaleString('default', { month: 'short' })} ${year}`
        });

    } catch (error) {
        console.error('Error in calculateSettlements:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all settlements (saved settlements)
const getSettlements = async (req, res) => {
    try {
        const userId = req.user.id;
        const membership = await MessMember.findOne({ where: { user_id: userId } });

        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        const settlements = await Settlement.findAll({
            where: { mess_id: membership.mess_id },
            order: [['createdAt', 'DESC']]
        });

        // Enrich with user names
        const enrichedSettlements = await Promise.all(settlements.map(async (s) => {
            const fromUser = await User.findByPk(s.from_user_id, { attributes: ['name'] });
            const toUser = await User.findByPk(s.to_user_id, { attributes: ['name'] });

            return {
                ...s.toJSON(),
                from_user_name: fromUser ? fromUser.name : 'Unknown',
                to_user_name: toUser ? toUser.name : 'Unknown'
            };
        }));

        res.json(enrichedSettlements);

    } catch (error) {
        console.error('Error in getSettlements:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save settlement (create record)
const saveSettlement = async (req, res) => {
    try {
        const { from_user_id, to_user_id, amount } = req.body;
        const userId = req.user.id;

        const membership = await MessMember.findOne({ where: { user_id: userId } });
        if (!membership) {
            return res.status(400).json({ message: 'No mess found' });
        }

        const now = new Date();
        const settlement = await Settlement.create({
            from_user_id,
            to_user_id,
            amount,
            status: 'pending',
            mess_id: membership.mess_id,
            settlement_period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        });

        res.status(201).json({ message: 'Settlement saved', settlement });

    } catch (error) {
        console.error('Error in saveSettlement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark settlement as paid
const markAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const settlement = await Settlement.findByPk(id);
        if (!settlement) {
            return res.status(404).json({ message: 'Settlement not found' });
        }

        // Verify user is part of the mess
        const membership = await MessMember.findOne({
            where: { user_id: userId, mess_id: settlement.mess_id }
        });

        if (!membership) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await settlement.update({ status: 'paid' });

        res.json({ message: 'Settlement marked as paid', settlement });

    } catch (error) {
        console.error('Error in markAsPaid:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    calculateSettlements,
    getSettlements,
    saveSettlement,
    markAsPaid
};
