const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");
const Customer = require("../../customers/model/customer.model");


const Company =sequelize.define('company',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type:Sequelize.STRING,
        allowNull: false ,
        unique: true
    },
    active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    pettyCash:{
        type :Sequelize.FLOAT ,
        defaultValue: 0
    }
});

   


module.exports=Company ;