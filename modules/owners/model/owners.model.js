const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");

const Owners = sequelize.define('owner', {
    id : {
        type :Sequelize.INTEGER ,
        autoIncrement :true ,
        primaryKey :true
    },
    type :{
        type:Sequelize.ENUM('drowing', 'invest', 'other'),
        allowNull: false 
    },
    desc :{
        type :Sequelize.STRING ,
    },
    amount :{
        type :Sequelize.FLOAT
    },
    active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
});

module.exports =Owners ;