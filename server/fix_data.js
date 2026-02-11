const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('messbook', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function main() {
    try {
        // Update Expense 18 (Guest paid) to have 1 guest
        await sequelize.query('UPDATE expenses SET guests = 1 WHERE id = 18');
        console.log('Updated expense 18 guests to 1');

        // Show the new state
        const [results] = await sequelize.query('SELECT * FROM expenses WHERE id = 18');
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

main();
