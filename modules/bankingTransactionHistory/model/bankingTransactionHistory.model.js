const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");


const TransactionAccountBanking  = sequelize.define('TransactionAccountBanking', {
    type: {
        type: Sequelize.ENUM('deposit', 'withdraw'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      }
    
  });
  
  module.exports = TransactionAccountBanking ;