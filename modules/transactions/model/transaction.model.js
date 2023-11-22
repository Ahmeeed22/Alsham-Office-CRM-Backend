const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");
const Company = require("../../companies/model/company.model");
const Customer = require("../../customers/model/customer.model");
const Service = require("../../services/model/service.model");
const User = require("../../users/model/user.model");

const Transaction =sequelize.define('transaction',{
    id:{
        type:Sequelize.FLOAT,
        autoIncrement: true,
        primaryKey: true
    },
    paymentAmount:{
        type:Sequelize.FLOAT,
        allowNull: false ,
        defaultValue:0
    },
    balanceDue:{
        type:Sequelize.FLOAT,
        allowNull: false ,
        defaultValue:0
    },
    price:{
        type:Sequelize.FLOAT
    },
    profite:{
        type :Sequelize.FLOAT,
        allowNull:false
    },
    quantity:{
        type : Sequelize.FLOAT,
        defaultValue:1
    },
    totalPrice: {
      type: Sequelize.VIRTUAL,
      get() {
        return (+this.price + +this.profite)* +this.quantity;
      }  
    },  
    active:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    commission: {
        type : Sequelize.FLOAT,
        allowNull : true ,
        defaultValue:0
    },
    comIsDone:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    sponsoredName : {
        type : Sequelize.STRING,
        allowNull:true 
    },
    isCheck : {
        type :Sequelize.BOOLEAN,
        defaultValue: false 
    }
});
      // Transaction.belongsTo(User, {
      //   foreignKey: 'admin_id',
      // });
      // Transaction.belongsTo(Customer, {
      //   foreignKey: 'customer_id',
      // });
      // Transaction.belongsTo(Service, {
      //   foreignKey: 'service_id',
      // });
      // Transaction.belongsTo(Company, {
      //   foreignKey: 'company_id',
      // });

module.exports=Transaction ;