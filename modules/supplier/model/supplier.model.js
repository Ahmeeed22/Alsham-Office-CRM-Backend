const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");


const Supplier = sequelize.define('Supplier', {
    name:{
        type:Sequelize.STRING,
        allowNull: false ,
        unique: true
    },
    balance: {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    },
  });
  
  module.exports = Supplier;