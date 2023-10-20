// models/deposit.model.js
const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");

const DepositHistory = sequelize.define('depositHistory', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: Sequelize.ENUM('deposit', 'withdraw'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    details:{
        type:Sequelize.STRING,
        allowNull: false 
    },
    deposite : {
      type :Sequelize.FLOAT
    }
});

module.exports = DepositHistory;
