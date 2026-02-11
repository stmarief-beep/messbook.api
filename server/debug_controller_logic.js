const expenseController = require('./controllers/expenseController');
const reportController = require('./controllers/reportController');
const sequelize = require('./config/database');

const mockRes = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2).substring(0, 500) + '...'),
    status: (code) => {
        console.log(`Response Status: ${code}`);
        return mockRes;
    }
};

async function testControllers() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Test with User ID 3 (Arjun) who has active status and expenses
        const req = {
            user: { id: 3 },
            body: {},
            params: {}
        };

        console.log('--- Testing getCategoryBreakdown ---');
        await expenseController.getCategoryBreakdown(req, mockRes);
        console.log('\n');

        console.log('--- Testing getTopContributors ---');
        await expenseController.getTopContributors(req, mockRes);
        console.log('\n');

        console.log('--- Testing getMemberReports ---');
        await reportController.getMemberReports(req, mockRes);
        console.log('\n');

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await sequelize.close();
    }
}

testControllers();
