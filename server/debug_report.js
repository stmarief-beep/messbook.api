const sequelize = require('./config/database');
const Mess = require('./models/Mess');
const User = require('./models/User');
const MessMember = require('./models/MessMember');
const Expense = require('./models/Expense');
const { Op } = require('sequelize');

async function debugReport() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Get all users
        const users = await User.findAll({
            attributes: ['id', 'name', 'email']
        });
        console.log('=== ALL USERS ===');
        users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`));
        console.log('');

        // Get all messes
        const messes = await Mess.findAll();
        console.log('=== ALL MESSES ===');
        messes.forEach(m => console.log(`ID: ${m.id}, Name: ${m.name}, Admin ID: ${m.admin_id}, Code: ${m.unique_code}`));
        console.log('');

        // Get all mess members
        const members = await MessMember.findAll();
        console.log('=== ALL MESS MEMBERS ===');
        for (const member of members) {
            const user = await User.findByPk(member.user_id);
            console.log(`Mess ID: ${member.mess_id}, User ID: ${member.user_id}, Name: ${user?.name || 'Unknown'}, Status: ${member.status}`);
        }
        console.log('');

        // Get current month expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await Expense.findAll({
            where: {
                date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        console.log('=== CURRENT MONTH EXPENSES ===');
        console.log(`Period: ${startOfMonth.toDateString()} - ${endOfMonth.toDateString()}`);
        for (const exp of expenses) {
            const user = await User.findByPk(exp.user_id);
            console.log(`User: ${user?.name || 'Unknown'}, Type: ${exp.type}, Amount: ${exp.amount}, Date: ${new Date(exp.date).toDateString()}`);
        }
        console.log('');

        // Simulate the report generation for the first mess
        if (messes.length > 0) {
            const testMess = messes[0];
            console.log(`=== SIMULATING REPORT FOR MESS: ${testMess.name} ===`);

            const activeMembers = await MessMember.findAll({
                where: {
                    mess_id: testMess.id,
                    status: 'active'
                }
            });

            console.log(`Active members count: ${activeMembers.length}`);

            for (const member of activeMembers) {
                const user = await User.findByPk(member.user_id);
                console.log(`  - ${user?.name || 'Unknown'} (ID: ${member.user_id})`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugReport();
