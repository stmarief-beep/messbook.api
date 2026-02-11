const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessMember = sequelize.define('MessMember', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mess_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'disabled'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'messmembers'
});

module.exports = MessMember;
