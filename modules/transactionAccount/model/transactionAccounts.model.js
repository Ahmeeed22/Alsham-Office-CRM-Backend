const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");


const TransactionAccount =sequelize.define('transactionAccount',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type:{
        type:Sequelize.ENUM('supply', 'expenses', 'other'),
        allowNull: false 
    },
    receiptNumber:{
        type:Sequelize.STRING,
        allowNull:true
    },
    amount : {
        type:Sequelize.INTEGER,
        allowNull:false,
        validate: {
            isInt: true,
            min: 0, // Minimum value of 0
          },
    },
    active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    }
});

   
module.exports=TransactionAccount ;