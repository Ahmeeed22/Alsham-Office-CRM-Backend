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
        type:Sequelize.FLOAT, 
        allowNull:false
    },
    active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    

});

   
module.exports=TransactionAccount ;