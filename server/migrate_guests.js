const sequelize = require('./config/database');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        await sequelize.query("ALTER TABLE Expenses ADD COLUMN guests INT DEFAULT 0 AFTER type");
        console.log('✓ Column "guests" added successfully');

    } catch (error) {
        if (error.original && error.original.errno === 1060) {
            console.log('! Column "guests" already exists');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await sequelize.close();
    }
}

migrate();
