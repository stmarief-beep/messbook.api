const sequelize = require('./config/database');
const User = require('./models/User');
const MessMember = require('./models/MessMember');
const { getMemberReports } = require('./controllers/reportController');

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

        const req = {
            user: { id: userId }
        };

        const res = {
            status: (code) => {
                console.log(`Response Status: ${code}`);
                return res;
            },
            json: (data) => {
                console.log('Response JSON:');
                console.log(JSON.stringify(data, null, 2));
                return res;
            }
        };

        await getMemberReports(req, res);

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await sequelize.close();
    }
};

runTest();
