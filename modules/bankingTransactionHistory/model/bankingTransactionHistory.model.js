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
      },
    DESC: {
      type : Sequelize.STRING,
      allowNull : true
    }  ,
    empName: {
      type : Sequelize.STRING,
      allowNull : true
    } ,
    deposite : {
      type :Sequelize.FLOAT
    }
    
  });
  
  module.exports = TransactionAccountBanking ;