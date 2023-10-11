const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");
const User = require("../../users/model/user.model");
const Company = require("../../companies/model/company.model")
const Customer =sequelize.define('customer',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type:Sequelize.STRING,
        allowNull: false ,
    },
    email:{
        type:Sequelize.STRING,
        allowNull:true ,
    },
    phoneNo:{
        type:Sequelize.INTEGER ,
    },
    deposite:{
        type:Sequelize.FLOAT ,
        defaultValue:0 
    },
    active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    }
});
    Customer.belongsTo(User, {  
        foreignKey: 'admin_id',
      });

module.exports=Customer ;