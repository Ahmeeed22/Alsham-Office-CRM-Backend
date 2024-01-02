const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { addTransaction,getAllTransactions, updateTransaction, deleteTransaction, getTransactionsSummary, sumBalance, calcCash } = require('../controller/transaction.controller')
const { getAllTransaction, updateTransactionSchema, addTransactionSchema } = require('../joi/transaction.validation')
const transactionsRoutes=require('express').Router()

transactionsRoutes.post('/allTransactions',isAuth('ALL'),validationRequest(getAllTransaction),getAllTransactions) 
transactionsRoutes.post('/addTransaction',isAuth('ALL'),validationRequest(addTransactionSchema),addTransaction)
transactionsRoutes.put('/updateTransaction/:id',isAuth('ALL'),validationRequest(updateTransactionSchema),updateTransaction)
transactionsRoutes.patch('/deleteTransactionSoft/:id',isAuth('ALL'),deleteTransaction)
// transactionsRoutes.get('/searchTransaction',searchTransactions)
transactionsRoutes.post('/getTransactionsSummary',isAuth('ALL'),getTransactionsSummary)
transactionsRoutes.get('/sumBalance',isAuth('ALL'),sumBalance) ;
transactionsRoutes.get('/cash',isAuth('ALL'),calcCash)

module.exports=transactionsRoutes; 