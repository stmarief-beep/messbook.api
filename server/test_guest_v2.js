const reportController = require('./controllers/reportController');
const expenseController = require('./controllers/expenseController');
const sequelize = require('./config/database');
const Expense = require('./models/Expense');

const mockRes = {
    json: (data) => {
        // Only log specific results to avoid clutter
        if (data.reports) {
            console.log('--- RELEVANT REPORT DATA ---');
            data.reports.forEach(r => {
                console.log(`${r.userName}: Spent=${r.messExpenses.spent}, Actual=${r.messExpenses.actual}, Balance=${r.messExpenses.balance}`);
            });
        }
    },
    status: (code) => mockRes
};

async function testComplexGuestMath() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        const today = new Date().toISOString().split('T')[0];
        await Expense.destroy({ where: { date: today } });

        const MessMember = require('./models/MessMember');
        const activeMembers = await MessMember.findAll({ where: { status: 'active' } });
        const memberCount = activeMembers.length;
        console.log(`✓ Active Members: ${memberCount}`);

        // Member Arif buys 120. Guests: 1. Total 3. Share: 40.
        await expenseController.addExpense({
            user: { id: 1 },
            body: { amount: 120, description: 'Lunch', type: 'Mess', date: today, guests: 1, paid_by: 'self' }
        }, mockRes);

        // Guest buys 60. Guests: 1. Total 3. Share: 20.
        await expenseController.addExpense({
            user: { id: 1 },
            body: { amount: 60, description: 'Dinner', type: 'Mess', date: today, guests: 1, paid_by: 'guest' }
        }, mockRes);

        // Expected for Arif: Spent 120. Actual 60 (40+20). Balance +60.
        // Expected for Arjun: Spent 0. Actual 60. Balance -60.

        await reportController.getMemberReports({ user: { id: 1 } }, mockRes);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testComplexGuestMath();
