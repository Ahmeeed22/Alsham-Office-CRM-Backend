const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");


const Reminder = sequelize.define('reminder', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sponsored: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dateExpire: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: true,
    }
});




module.exports = Reminder;