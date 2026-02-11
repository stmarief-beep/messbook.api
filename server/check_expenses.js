const sequelize = require('./config/database');
const Expense = require('./models/Expense');
const User = require('./models/User');

async function checkExpenses() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        const expenses = await Expense.findAll({
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${expenses.length} expense(s) in database:\n`);

        if (expenses.length > 0) {
            for (const exp of expenses) {
                const user = await User.findByPk(exp.user_id);
                console.log('---');
                console.log(`ID: ${exp.id}`);
                console.log(`Amount: $${exp.amount}`);
                console.log(`Description: ${exp.description}`);
                console.log(`Type: ${exp.type}`);
                console.log(`Date: ${exp.date}`);
                console.log(`User ID: ${exp.user_id} (${user ? user.name : 'Unknown'})`);
                console.log(`Mess ID: ${exp.mess_id}`);
                console.log(`Created: ${exp.createdAt}`);
            }
        } else {
            console.log('⚠️  No expenses found in database!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkExpenses();
