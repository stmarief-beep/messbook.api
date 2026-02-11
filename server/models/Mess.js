const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mess = sequelize.define('Mess', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unique_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rules: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Mess;
