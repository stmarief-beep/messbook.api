const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const User = require('./models/User');
const Mess = require('./models/Mess');
const MessMember = require('./models/MessMember');

async function debugMess() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const email = 'admin@test.com';
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User not found!');
            return;
        }
        console.log('User found:', user.id);

        const member = await MessMember.findOne({ where: { user_id: user.id } });
        if (member) {
            console.log('User is ALREADY in a mess:', member.toJSON());
        } else {
            console.log('User is NOT in any mess. Creation should work.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugMess();
