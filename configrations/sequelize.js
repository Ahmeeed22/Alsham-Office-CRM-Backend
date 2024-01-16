const Sequelize=require("sequelize");
const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD,{
    dialect:"mysql",
    host:process.env.DB_HOST,
    port:18186  
    // port:3306
})     
module.exports=sequelize;               