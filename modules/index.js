const sequelize = require("../configrations/sequelize");
const BankAccount = require("./banking/model/bank.model");
const Company = require("./companies/model/company.model");
const Owners = require("./owners/model/owners.model");
const Supplier = require("./supplier/model/supplier.model");
const Transaction = require("./transactions/model/transaction.model");
const createTable=()=>{
    sequelize.sync(
        // {alter: true}        
        ).then(async(result)=>{
            // await BankAccount.sync({ alter: true });
        console.log("connection success");
    }).catch((err)=>{
        console.log("err",err); 
        
    })  
} 
module.exports=createTable;        