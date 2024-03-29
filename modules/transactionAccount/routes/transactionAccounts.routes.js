const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { getAllTransactionAccount, addTransactionAccount, deleteTransactionAccount, searchTransactionAccount, updateTransactionAccount, getExpensesSum } = require('../controller/transactionAccounts.controller')
 
const transactionAccountRoutes=require('express').Router()

transactionAccountRoutes.post('/getAllTransactionAccount',getAllTransactionAccount)
transactionAccountRoutes.post('/addTransactionAccount',isAuth('ALL'),addTransactionAccount)
transactionAccountRoutes.put('/updateTransactionAccount/:id',isAuth('ADMIN'),updateTransactionAccount)
transactionAccountRoutes.delete('/deleteTransactionAccount/:id',isAuth('ADMIN'),deleteTransactionAccount)
transactionAccountRoutes.get('/searchTransactionAccount',isAuth('ADMIN'),searchTransactionAccount)
transactionAccountRoutes.get('/getExpensesSum',isAuth('ALL'),getExpensesSum)

module.exports=transactionAccountRoutes; 