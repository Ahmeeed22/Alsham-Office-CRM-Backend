const sequelize = require("../configrations/sequelize");
const createTable=()=>{
    sequelize.sync(
        // {alter: true}     
        ).then((result)=>{
        console.log("connection success");
    }).catch((err)=>{
        console.log("err",err);
        
    })  
} 
module.exports=createTable;        