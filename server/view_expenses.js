const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('messbook', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function main() {
    try {
        const [results] = await sequelize.query('SELECT * FROM expenses ORDER BY date ASC');
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

main();
