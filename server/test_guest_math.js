const reportController = require('./controllers/reportController');
const expenseController = require('./controllers/expenseController');
const sequelize = require('./config/database');
const Expense = require('./models/Expense');

const mockRes = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log(`Response Status: ${code}`);
        return mockRes;
    }
};

async function testGuestMath() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // 1. Cleanup old test data for today
        const today = new Date().toISOString().split('T')[0];
        await Expense.destroy({ where: { date: today } });
        console.log('✓ Cleaned up today\'s test data');

        // 2. Add an expense of 150 SAR with 1 guest
        // Members = 2 (Test Admin, Arjun)
        // Guests = 1
        // Total = 3
        // Expected Share = 150 / 3 = 50
        console.log('\n--- Adding 150 SAR Expense with 1 Guest ---');
        const reqAdd = {
            user: { id: 1 }, // Test Admin
            body: {
                amount: 150,
                description: 'Guest Dinner',
                type: 'Mess',
                date: today,
                guests: 1
            }
        };
        await expenseController.addExpense(reqAdd, mockRes);

        // 3. Verify Report
        console.log('\n--- Verifying Report Calculations ---');
        const reqReport = {
            user: { id: 1 },
            params: {}
        };
        await reportController.getMemberReports(reqReport, mockRes);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testGuestMath();
