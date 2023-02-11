// handle syntax error 
process.on('uncaughtException',err=>{
    console.log(err);
})


const express= require("express");
require("dotenv").config();
const createTable = require("./modules");
const Customer = require("./modules/customers/model/customer.model");
const customersRoutes = require("./modules/customers/routes/customer.routes");
const servicesRoutes = require("./modules/services/routes/service.routes");
const transactionsRoutes = require("./modules/transactions/routes/transaction.routes");
const User = require("./modules/users/model/user.model");
const userRoutes = require("./modules/users/routes/user.routes");
const cookieParser=require('cookie-parser');
const companyRoutes = require("./modules/companies/routes/company.routes");
const Company = require("./modules/companies/model/company.model");
const Transaction = require("./modules/transactions/model/transaction.model");
const Service = require("./modules/services/model/service.model");
const AppError = require("./helpers/AppError");

 const app =express();
app.use(express.json());

    User.hasMany(Customer,{
        foreignKey :'admin_id'
    })
    Company.hasMany(User,{
        foreignKey : 'company_id'
    })
    Company.hasMany(Transaction,{
        foreignKey : 'company_id'
    })
    Company.hasMany(Customer,{
        foreignKey : 'company_id'
    })
    Transaction.belongsTo(User, {
        foreignKey: 'admin_id',
      });
      Transaction.belongsTo(Customer, {
        foreignKey: 'customer_id',
      });
      Transaction.belongsTo(Service, {
        foreignKey: 'service_id',
      });
    
 
app.use(cookieParser());
createTable();
const port=process.env.PORT ;
app.use('/api/v1',userRoutes);
app.use('/api/v1',customersRoutes);
app.use('/api/v1',servicesRoutes);
app.use('/api/v1',transactionsRoutes);
app.use('/api/v1',companyRoutes)

// handle wronge routes 
app.all("*",(req,res,next)=>{
    // res.json(`can not find this route : ${req.originalUrl} on serve `)
    next(new AppError(`can not find this route : ${req.originalUrl} on serve `,404))
})

// global error handling middleware
app.use((error , req ,res , next)=>{
    error.statusCode=error.statusCode || 500
    if (process.env.MODE_ENV === 'DEVELOP') {
        res.status(error.statusCode)
        .json({status:error.statusCode,message:error.message,error,stack:error.stack})
    }else{
        res.status(error.statusCode)
        .json({status:error.statusCode,message:error.message,error})
    }
})
app.listen(port, () => {   
    console.log(`Server started on port ${port}`);
});
// handle outside express
process.on('unhandledRejection',err=>{
    console.log('unhandledRejection',err);
})     
  






