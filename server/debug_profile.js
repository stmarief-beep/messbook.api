const sequelize = require('./config/database');
const User = require('./models/User');
const MessMember = require('./models/MessMember');
const { getProfile } = require('./controllers/userController');

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

        const userId = member.user_id;
        console.log(`Testing with User ID: ${userId}`);

        // Mock Request
        const req = {
            user: { id: userId }
        };

        // Mock Response
        const res = {
            status: (code) => {
                console.log(`\nResponse Status: ${code}`);
                return res;
            },
            json: (data) => {
                console.log('Response JSON:', JSON.stringify(data, null, 2));
                return res;
            }
        };

        console.log('\n--- Testing Profile Controller ---');
        await getProfile(req, res);

        process.exit(0);

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
