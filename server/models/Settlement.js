const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settlement = sequelize.define('Settlement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    from_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid'),
        defaultValue: 'pending'
    },
    mess_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'settlements'
});

module.exports = Settlement;
