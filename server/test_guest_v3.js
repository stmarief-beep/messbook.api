const reportController = require('./controllers/reportController');
const expenseController = require('./controllers/expenseController');
const sequelize = require('./config/database');
const Expense = require('./models/Expense');

const mockRes = {
    json: (data) => {
        if (data.reports) {
            console.log('\n--- CALCULATED REPORT ---');
            data.reports.forEach(r => {
                console.log(`${r.userName}: Spent=${r.messExpenses.spent}, Owed=${r.messExpenses.actual}, Balance=${r.messExpenses.balance}`);
            });
            console.log('-------------------------\n');
        }
    },
    status: (code) => mockRes
};

async function testFinalGuestMath() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        const today = new Date().toISOString().split('T')[0];
        await Expense.destroy({ where: { date: today } });

        console.log('--- SCENARIO: 2 Members, 1 Guest Event ---');

        // 1. Regular Member Expense: 100 SAR, 0 Guests.
        // Members: 2. Share: 50 each. Guest Share: 0.
        console.log('Adding 100 SAR (Members Only)...');
        await expenseController.addExpense({
            user: { id: 1 },
            body: { amount: 100, description: 'Member Rice', type: 'Mess', date: today, guests: 0, paid_by: 'self' }
        }, mockRes);

        // 2. Guest Event: 60 SAR, 1 Guest.
        // Total: 3 participants. Share: 20 each. 
        // Members Arif/Arjun: +20 each. Guest: +20.
        console.log('Adding 60 SAR (1 Guest)...');
        await expenseController.addExpense({
            user: { id: 1 },
            body: { amount: 60, description: 'Guest Dinner', type: 'Mess', date: today, guests: 1, paid_by: 'self' }
        }, mockRes);

        // 3. Guest Pays for an item: 30 SAR, 1 Guest.
        // Total: 3 participants. Share: 10 each.
        // Members: +10 each. Guest Owed: +10. Guest Spent: +30.
        console.log('Adding 30 SAR (Paid by Guest, 1 Guest)...');
        await expenseController.addExpense({
            user: { id: 1 },
            body: { amount: 30, description: 'Guest Tea', type: 'Mess', date: today, guests: 1, paid_by: 'guest' }
        }, mockRes);

        /*
        EXPECTED:
        Members Arif/Arjun Owe: 50 (Rice) + 20 (Dinner) + 10 (Tea) = 80 SAR each.
        Arif Spent: 100 + 60 = 160 SAR.
        Arif Balance: 160 - 80 = +80.
        
        Arjun Spent: 0.
        Arjun Balance: 0 - 80 = -80.
        
        Guest Owe: 0 (Rice) + 20 (Dinner) + 10 (Tea) = 30 SAR.
        Guest Spent: 30 (Tea).
        Guest Balance: 30 - 30 = 0.
        */

        await reportController.getMemberReports({ user: { id: 1 } }, mockRes);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testFinalGuestMath();
