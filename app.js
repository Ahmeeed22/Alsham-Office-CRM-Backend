// handle syntax error 
process.on('uncaughtException',err=>{
    console.log(err);
})

// winston
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
const winston = require("winston/lib/winston/config");
const LoggerService = require("./services/logger.service");
var cors = require('cors');
const HistoryTransactions = require("./modules/historyTransaction/model/history.transactions.model");
const historyTransactionsRoutes = require("./modules/historyTransaction/routes/history.transactions.routes");
const remindersRoutes = require("./modules/reminder/routes/reminder.route");
const Reminder = require("./modules/reminder/model/reminder.model");
const transactionAccountRoutes = require("./modules/transactionAccount/routes/transactionAccounts.routes");
const TransactionAccount = require("./modules/transactionAccount/model/transactionAccounts.model");
const TransactionAccountBanking = require("./modules/bankingTransactionHistory/model/bankingTransactionHistory.model");
const BankAccount = require("./modules/banking/model/bank.model");
const supplierRoutes = require("./modules/supplier/route/supplier.route");
const supplierStatementAccountRoutes = require("./modules/supplierStatementAccount/route/supplierStatementAccount.route");
const bankingTransactionHistoryRoutes = require("./modules/bankingTransactionHistory/routes/bankingTransactionHistory.route");
const bankAccountRoutes = require("./modules/banking/routes/bank.route");
const SupplierStatementAccount = require("./modules/supplierStatementAccount/model/supplierStatementAccount.model");
const Supplier = require("./modules/supplier/model/supplier.model");
const Owners = require("./modules/owners/model/owners.model");
const ownersRoutes = require("./modules/owners/routes/owners.route");
const DepositHistory = require("./modules/depositHistory/model/depositHistory.model");
const historyDipostRoutes = require("./modules/depositHistory/routes/dipositHistory.controller");

const app =express();
// app.use(cors())
app.use(cors({ origin: 'https://ahmeeed22.github.io' }));
app.use(express.json());

// wiston
const logger=new LoggerService('user.controller')
const loggerError=new LoggerService('error.general')
const loggerRoute=new LoggerService('error.route')


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
    Customer.hasMany(Transaction,{
        foreignKey : 'customer_id'
    })
    Transaction.hasMany(HistoryTransactions,{
        foreignKey : 'transaction_id'
    })
    Company.hasMany(HistoryTransactions,{
        foreignKey : 'company_id'
    })
    Transaction.belongsTo(User, {
        foreignKey: 'admin_id',
      });
    // make relationship  between banks and transaction    
    BankAccount.hasMany(Transaction,{
        foreignKey : 'accountId'
    })  
    Transaction.belongsTo(BankAccount, {
        foreignKey: 'accountId',
      });
    // make relationship  between supliers and transaction    
    Supplier.hasMany(Transaction,{
        foreignKey : 'supplierId'
    })  
    Transaction.belongsTo(Supplier, {
        foreignKey: 'supplierId',
      });

    HistoryTransactions.belongsTo(Transaction, {
        foreignKey: 'transaction_id',
    });
    HistoryTransactions.belongsTo(Company, {    
        foreignKey: 'company_id',
    });
    Transaction.belongsTo(Customer, { 
        foreignKey: 'customer_id',
    });
    Transaction.belongsTo(Service, { 
        foreignKey: 'service_id',
    });
    Reminder.belongsTo(Service, {
        foreignKey: 'service_id',
    });
    Reminder.belongsTo(User, {
        foreignKey: 'admin_id',
      });
      Reminder.belongsTo(Company, { 
        foreignKey: 'company_id',
    });

    Company.hasMany(TransactionAccount,{
        foreignKey : 'company_id'
    })

    TransactionAccount.belongsTo(Company, { 
        foreignKey: 'company_id',
    }); 

    Company.hasMany(Owners, {
        foreignKey :'company_id'
    })

    Owners.belongsTo(Company ,{
        foreignKey :'company_id'
    })

    TransactionAccountBanking.belongsTo(BankAccount, { foreignKey: 'accountId' });
    BankAccount.hasMany(TransactionAccountBanking, { foreignKey: 'accountId' });

    BankAccount.belongsTo(Company, { foreignKey: 'company_id' });
    Company.hasMany(BankAccount, { foreignKey: 'company_id' });

    SupplierStatementAccount.belongsTo(Supplier, { foreignKey: 'supplierId' });
    Supplier.hasMany(SupplierStatementAccount, { foreignKey: 'supplierId' });

    Supplier.belongsTo(Company, { foreignKey: 'company_id' });
    Company.hasMany(Supplier, { foreignKey: 'company_id' });

    // Transaction.belongsTo(DepositHistory, { foreignKey: 'transactionId' });
    // DepositHistory.hasMany(Transaction, { foreignKey: 'transactionId' });
    DepositHistory.belongsTo(Customer, { foreignKey: 'customerId' });
    Customer.hasMany(DepositHistory, { foreignKey: 'customerId' });


     
 
app.use(cookieParser());
createTable();
const port=process.env.PORT ; 
app.use('/api/v1',userRoutes);   
app.use('/api/v1',customersRoutes);
app.use('/api/v1',servicesRoutes);
app.use('/api/v1',transactionsRoutes);
app.use('/api/v1',companyRoutes)
app.use('/api/v1',historyTransactionsRoutes)
app.use('/api/v1',remindersRoutes)
app.use('/api/v1',transactionAccountRoutes)
app.use('/api/v1',bankAccountRoutes)
app.use('/api/v1',bankingTransactionHistoryRoutes) 
app.use('/api/v1',supplierRoutes)
app.use('/api/v1',supplierStatementAccountRoutes);
app.use('/api/v1',ownersRoutes);
app.use('/api/v1',historyDipostRoutes)


// handle wronge routes 
app.all("*",(req,res,next)=>{
    // res.json(`can not find this route : ${req.originalUrl} on serve `)
    loggerRoute.error(`can not find this route : ${req.originalUrl} on serve`)
    next(new AppError(`can not find this route : ${req.originalUrl} on serve `,404))
})

// global error handling middleware
app.use((error , req ,res , next)=>{
    error.statusCode=error.statusCode || 500
    if (process.env.MODE_ENV === 'DEVELOP') {
        loggerError.error(`error`,{status:error.statusCode,message:error.message,error,stack:error.stack})
        res.status(error.statusCode)
        .json({status:error.statusCode,message:error.message,error,stack:error.stack})
    }else{
        loggerError.error(`error`,{status:error.statusCode,message:error.message,error,stack:error.stack})
        res.status(error.statusCode)
        .json({status:error.statusCode,message:error.message,error})
    }
})
// Owners
app.listen(process.env.PORT||3000, () => {   
    console.log(`Server started on port ${port}`);
});
// handle outside express
process.on('unhandledRejection',err=>{
    console.log('unhandledRejection',err); 
})      
  






