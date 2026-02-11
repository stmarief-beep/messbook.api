const sequelize = require('./config/database');
const Expense = require('./models/Expense');
const User = require('./models/User');
const MessMember = require('./models/MessMember');
const { Op } = require('sequelize');

async function analyzeCurrentExpenses() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database\n');

        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        console.log('='.repeat(80));
        console.log(`ANALYZING EXPENSES FOR: ${startOfMonth.toDateString()} - ${endOfMonth.toDateString()}`);
        console.log('='.repeat(80));

        // Get all expenses for current month
        const expenses = await Expense.findAll({
            where: {
                mess_id: 2, // Using the mess_id from check_mess.js output
                date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            order: [['date', 'ASC']]
        });

        // Get all active members
        const members = await MessMember.findAll({
            where: {
                mess_id: 2,
                status: 'active'
            }
        });

        // Get user names
        const users = await User.findAll({
            where: { id: members.map(m => m.user_id) },
            attributes: ['id', 'name']
        });

        const userMap = {};
        users.forEach(u => {
            userMap[u.id] = u.name;
        });

        console.log('\nACTIVE MEMBERS:', members.length);
        members.forEach(m => {
            console.log(`  - ${userMap[m.user_id]} (ID: ${m.user_id})`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('EXPENSE DETAILS');
        console.log('='.repeat(80));

        let totalExpenses = 0;
        const userStats = {};
        members.forEach(m => {
            userStats[m.user_id] = {
                name: userMap[m.user_id],
                regularSpent: 0,
                regularOwed: 0,
                guestSpent: 0,
                guestOwed: 0
            };
        });

        const guestStats = {
            name: 'Guest / Friends',
            regularSpent: 0,
            regularOwed: 0,
            guestSpent: 0,
            guestOwed: 0
        };

        expenses.forEach((exp, index) => {
            const amount = parseFloat(exp.amount);
            const guestsOnExp = parseInt(exp.guests) || 0;
            const isGuestExpense = guestsOnExp > 0;
            const totalParticipants = members.length + guestsOnExp;
            const perPersonShare = amount / totalParticipants;

            console.log(`\n${index + 1}. ${exp.description || 'Expense'}`);
            console.log(`   Date: ${new Date(exp.date).toDateString()}`);
            console.log(`   Amount: ${amount} SAR`);
            console.log(`   Guests: ${guestsOnExp}`);
            console.log(`   Category: ${exp.category || 'N/A'}`);
            console.log(`   Paid by: ${exp.user_id ? userMap[exp.user_id] : 'Guest'} (ID: ${exp.user_id || 'guest'})`);
            console.log(`   Type: ${isGuestExpense ? 'GUEST EXPENSE' : 'REGULAR MESS'}`);
            console.log(`   Total Participants: ${totalParticipants} (${members.length} members + ${guestsOnExp} guests)`);
            console.log(`   Per Person Share: ${perPersonShare.toFixed(2)} SAR`);

            totalExpenses += amount;

            // Credit the payer
            if (exp.user_id && userStats[exp.user_id]) {
                if (isGuestExpense) {
                    userStats[exp.user_id].guestSpent += amount;
                } else {
                    userStats[exp.user_id].regularSpent += amount;
                }
            } else if (!exp.user_id) {
                if (isGuestExpense) {
                    guestStats.guestSpent += amount;
                } else {
                    guestStats.regularSpent += amount;
                }
            }

            // Charge all members
            members.forEach(m => {
                if (isGuestExpense) {
                    userStats[m.user_id].guestOwed += perPersonShare;
                } else {
                    userStats[m.user_id].regularOwed += perPersonShare;
                }
            });

            // Charge guests
            if (guestsOnExp > 0) {
                guestStats.guestOwed += (perPersonShare * guestsOnExp);
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY OF BALANCES');
        console.log('='.repeat(80));
        console.log(`Total Expenses: ${totalExpenses} SAR\n`);

        console.log('MEMBER BREAKDOWN:');
        console.log('-'.repeat(80));

        Object.entries(userStats).forEach(([userId, stats]) => {
            const regularBalance = stats.regularSpent - stats.regularOwed;
            const guestBalance = stats.guestSpent - stats.guestOwed;
            const totalBalance = regularBalance + guestBalance;

            console.log(`\n${stats.name}:`);
            console.log(`  REGULAR MESS:`);
            console.log(`    Paid: ${stats.regularSpent.toFixed(2)} SAR`);
            console.log(`    Owed: ${stats.regularOwed.toFixed(2)} SAR`);
            console.log(`    Balance: ${regularBalance > 0 ? '+' : ''}${regularBalance.toFixed(2)} SAR ${regularBalance > 0 ? '(Receivable)' : regularBalance < 0 ? '(Payable)' : '(Settled)'}`);
            console.log(`  GUEST EXPENSES:`);
            console.log(`    Paid: ${stats.guestSpent.toFixed(2)} SAR`);
            console.log(`    Owed: ${stats.guestOwed.toFixed(2)} SAR`);
            console.log(`    Balance: ${guestBalance > 0 ? '+' : ''}${guestBalance.toFixed(2)} SAR ${guestBalance > 0 ? '(Receivable)' : guestBalance < 0 ? '(Payable)' : '(Settled)'}`);
            console.log(`  TOTAL BALANCE: ${totalBalance > 0 ? '+' : ''}${totalBalance.toFixed(2)} SAR`);
        });

        // Add Guest balance if exists
        if (guestStats.guestOwed > 0 || guestStats.guestSpent > 0 || guestStats.regularOwed > 0 || guestStats.regularSpent > 0) {
            const regularBalance = guestStats.regularSpent - guestStats.regularOwed;
            const guestBalance = guestStats.guestSpent - guestStats.guestOwed;
            const totalBalance = regularBalance + guestBalance;

            console.log(`\n${guestStats.name}:`);
            console.log(`  REGULAR MESS:`);
            console.log(`    Paid: ${guestStats.regularSpent.toFixed(2)} SAR`);
            console.log(`    Owed: ${guestStats.regularOwed.toFixed(2)} SAR`);
            console.log(`    Balance: ${regularBalance > 0 ? '+' : ''}${regularBalance.toFixed(2)} SAR`);
            console.log(`  GUEST EXPENSES:`);
            console.log(`    Paid: ${guestStats.guestSpent.toFixed(2)} SAR`);
            console.log(`    Owed: ${guestStats.guestOwed.toFixed(2)} SAR`);
            console.log(`    Balance: ${guestBalance > 0 ? '+' : ''}${guestBalance.toFixed(2)} SAR`);
            console.log(`  TOTAL BALANCE: ${totalBalance > 0 ? '+' : ''}${totalBalance.toFixed(2)} SAR`);
        }

        console.log('\n' + '='.repeat(80));
        console.log('SETTLEMENT RECOMMENDATIONS');
        console.log('='.repeat(80));

        // Calculate settlements separately for regular and guest
        const calculateSettlementsForCategory = (stats, categorySpent, categoryOwed) => {
            const balances = Object.entries(stats).map(([userId, s]) => ({
                userId,
                name: s.name,
                balance: s[categorySpent] - s[categoryOwed]
            }));

            // Add guest if exists
            if (categorySpent === 'guestSpent' || categoryOwed === 'guestOwed') {
                const guestBal = guestStats[categorySpent] - guestStats[categoryOwed];
                if (Math.abs(guestBal) > 0.01) {
                    balances.push({
                        userId: 'guest',
                        name: 'Guest / Friends',
                        balance: guestBal
                    });
                }
            }

            const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
            const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

            const settlements = [];
            let i = 0, j = 0;

            while (i < creditors.length && j < debtors.length) {
                const amount = Math.min(creditors[i].balance, Math.abs(debtors[j].balance));

                settlements.push({
                    from: debtors[j].name,
                    to: creditors[i].name,
                    amount: parseFloat(amount.toFixed(2))
                });

                creditors[i].balance -= amount;
                debtors[j].balance += amount;

                if (Math.abs(creditors[i].balance) < 0.01) i++;
                if (Math.abs(debtors[j].balance) < 0.01) j++;
            }

            return settlements;
        };

        const regularSettlements = calculateSettlementsForCategory(userStats, 'regularSpent', 'regularOwed');
        const guestSettlements = calculateSettlementsForCategory(userStats, 'guestSpent', 'guestOwed');

        // Combine settlements
        const settlementMap = new Map();

        regularSettlements.forEach(s => {
            const key = `${s.from}_${s.to}`;
            if (!settlementMap.has(key)) {
                settlementMap.set(key, {
                    from: s.from,
                    to: s.to,
                    regularAmount: 0,
                    guestAmount: 0,
                    total: 0
                });
            }
            const settlement = settlementMap.get(key);
            settlement.regularAmount += s.amount;
            settlement.total += s.amount;
        });

        guestSettlements.forEach(s => {
            const key = `${s.from}_${s.to}`;
            if (!settlementMap.has(key)) {
                settlementMap.set(key, {
                    from: s.from,
                    to: s.to,
                    regularAmount: 0,
                    guestAmount: 0,
                    total: 0
                });
            }
            const settlement = settlementMap.get(key);
            settlement.guestAmount += s.amount;
            settlement.total += s.amount;
        });

        if (settlementMap.size === 0) {
            console.log('\n✅ All Settled! Everyone has paid their fair share.');
        } else {
            Array.from(settlementMap.values()).forEach((s, index) => {
                console.log(`\n${index + 1}. ${s.from} → ${s.to}`);
                if (s.regularAmount > 0) {
                    console.log(`   Regular Mess: ${s.regularAmount.toFixed(2)} SAR`);
                }
                if (s.guestAmount > 0) {
                    console.log(`   Guest Amount: ${s.guestAmount.toFixed(2)} SAR`);
                }
                console.log(`   Total: ${s.total.toFixed(2)} SAR`);
            });
        }

        console.log('\n' + '='.repeat(80));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

analyzeCurrentExpenses();
