const sequelize = require('./config/database');
const Expense = require('./models/Expense');
const { Op } = require('sequelize');

async function debugDateQuery() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        console.log('Start of Month:', startOfMonth);
        console.log('End of Month:', endOfMonth);

        // Fetch all expenses without date filter
        const allExpenses = await Expense.findAll();
        console.log(`Total expenses in DB: ${allExpenses.length}`);
        allExpenses.forEach(e => console.log(`  - ID: ${e.id}, Date: ${e.date} (Type: ${typeof e.date})`));

        // Fetch with date filter
        const filteredExpenses = await Expense.findAll({
            where: {
                date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        console.log(`Expenses found with filter: ${filteredExpenses.length}`);
        filteredExpenses.forEach(e => console.log(`  - ID: ${e.id}, Date: ${e.date}`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugDateQuery();
