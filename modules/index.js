const sequelize = require("../configrations/sequelize");
const Company = require("./companies/model/company.model");
const Owners = require("./owners/model/owners.model");
const createTable=()=>{
    sequelize.sync(
        // {alter: true}        
        ).then(async(result)=>{
            // await Company.sync({ alter: true });
        console.log("connection success");
    }).catch((err)=>{
        console.log("err",err); 
        
    })  
} 
module.exports=createTable;        