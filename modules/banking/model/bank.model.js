const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");


const BankAccount = sequelize.define('BankAccount', {
    name:{
        type:Sequelize.STRING,
        allowNull: false ,
        unique: false
    },
    accountNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
  });
  
  module.exports = BankAccount;