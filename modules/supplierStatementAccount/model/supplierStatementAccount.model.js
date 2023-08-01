const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");


const SupplierStatementAccount  = sequelize.define('SupplierStatementAccount', {
    type: {
        type: Sequelize.ENUM('debit', 'credit'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      desc: {
        type :Sequelize.STRING,
      }
    
  });
  
  module.exports = SupplierStatementAccount ;