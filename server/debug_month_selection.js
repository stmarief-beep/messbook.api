const sequelize = require('./config/database');
const User = require('./models/User');
const MessMember = require('./models/MessMember');
const { getMemberReports } = require('./controllers/reportController');
const { calculateSettlements } = require('./controllers/settlementController');

const runTest = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        // Find a user with a mess
        const member = await MessMember.findOne();
        if (!member) {
            console.log('No mess members found to test with.');
            process.exit();
        }

        const userId = member.user_id; // Use the found user
        console.log(`Testing with User ID: ${userId}`);

        // Mock Request for Jan 2025
        const req = {
            user: { id: userId },
            query: { month: '1', year: '2025' }
        };

        // Mock Response
        const res = {
            status: (code) => {
                console.log(`\nResponse Status: ${code}`);
                return res;
            },
            json: (data) => {
                console.log('Response JSON Period:', data.period);
                // console.log('Response Data Keys:', Object.keys(data));
                return res;
            }
        };

        console.log('\n--- Testing Report Controller (Jan 2025) ---');
        await getMemberReports(req, res);

        console.log('\n--- Testing Settlement Controller (Jan 2025) ---');
        await calculateSettlements(req, res);

        process.exit(0);

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
