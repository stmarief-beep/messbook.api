const settlementController = require('./controllers/settlementController');
const expenseController = require('./controllers/expenseController');
const sequelize = require('./config/database');
const Expense = require('./models/Expense');

const mockRes = {
    json: (data) => {
        if (data.settlements) {
            console.log('\n--- SETTLEMENT RECOMMENDATIONS ---');
            data.settlements.forEach(s => {
                console.log(`${s.from_user_name} -> ${s.to_user_name}: ${s.amount} SAR`);
            });
            console.log('----------------------------------\n');
        }
        if (data.balances) {
            console.log('--- INDIVIDUAL BALANCES ---');
            data.balances.forEach(b => {
                console.log(`${b.userName}: Paid=${b.paid}, Owed=${b.fairShare}, Balance=${b.balance}`);
            });
            console.log('---------------------------\n');
        }
    },
    status: (code) => mockRes
};

async function testSettlementLogic() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        const today = new Date().toISOString().split('T')[0];
        await Expense.destroy({ where: { date: today } });

        console.log('--- SCENARIO: Guest Pays for shared item ---');

        // 1. Guest Pays: 90 SAR, 1 Guest.
        // Total: 3 participants. Share: 30 each.
        // Members Arif/Arjun: Owe 30 each. Guest: Spent 90, Owe 30 (Balance +60).
        console.log('Adding 90 SAR (Paid by Guest, 1 Guest)...');
        await expenseController.addExpense({
            user: { id: 1 },
            body: { amount: 90, description: 'Guest Purchase', type: 'Mess', date: today, guests: 1, paid_by: 'guest' }
        }, mockRes);

        /*
        EXPECTED SETTLEMENT:
        Arif owes Guest 30
        Arjun owes Guest 30
        */

        await settlementController.calculateSettlements({ user: { id: 1 } }, mockRes);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testSettlementLogic();
