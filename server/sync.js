const sequelize = require('./config/database');
const User = require('./models/User');
const Mess = require('./models/Mess');
const MessMember = require('./models/MessMember');
const Expense = require('./models/Expense');
const Settlement = require('./models/Settlement');

// Define Relationships
User.hasOne(Mess, { foreignKey: 'admin_id', as: 'OwnedMess' });
Mess.belongsTo(User, { foreignKey: 'admin_id', as: 'Admin' });

User.belongsToMany(Mess, { through: MessMember, foreignKey: 'user_id' });
Mess.belongsToMany(User, { through: MessMember, foreignKey: 'mess_id' });

User.hasMany(Expense, { foreignKey: 'user_id' });
Expense.belongsTo(User, { foreignKey: 'user_id' });

Mess.hasMany(Expense, { foreignKey: 'mess_id' });
Expense.belongsTo(Mess, { foreignKey: 'mess_id' });

User.hasMany(Settlement, { foreignKey: 'from_user_id', as: 'Debts' });
User.hasMany(Settlement, { foreignKey: 'to_user_id', as: 'Credits' });
Settlement.belongsTo(User, { foreignKey: 'from_user_id', as: 'Debtor' });
Settlement.belongsTo(User, { foreignKey: 'to_user_id', as: 'Creditor' });

Mess.hasMany(Settlement, { foreignKey: 'mess_id' });
Settlement.belongsTo(Mess, { foreignKey: 'mess_id' });


const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Sync all models (alter: true updates tables if they exist, force: true drops them)
        await sequelize.sync({ alter: true });
        console.log('All tables created/updated successfully!');
        process.exit();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

syncDB();
