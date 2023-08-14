const { Sequelize } = require("sequelize");
const sequelize = require("../../../configrations/sequelize");
const Company = require("../../companies/model/company.model");
const Customer = require("../../customers/model/customer.model");
const Service = require("../../services/model/service.model");
const User = require("../../users/model/user.model");

const Transaction =sequelize.define('transaction',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    paymentAmount:{
        type:Sequelize.INTEGER,
        allowNull: false ,
        defaultValue:0
    },
    balanceDue:{
        type:Sequelize.INTEGER,
        allowNull: false ,
        defaultValue:0
    },
    price:{
        type:Sequelize.INTEGER
    },
    profite:{
        type :Sequelize.INTEGER,
        allowNull:false
    },
    quantity:{
        type : Sequelize.INTEGER,
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
        type : Sequelize.INTEGER,
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