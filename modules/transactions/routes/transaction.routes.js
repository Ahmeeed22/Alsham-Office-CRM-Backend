const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { addTransaction,getAllTransactions, updateTransaction, deleteTransaction, getTransactionsSummary } = require('../controller/transaction.controller')
const { getAllTransaction, updateTransactionSchema, addTransactionSchema } = require('../joi/transaction.validation')
const transactionsRoutes=require('express').Router()

transactionsRoutes.post('/allTransactions',isAuth('ALL'),validationRequest(getAllTransaction),getAllTransactions) 
transactionsRoutes.post('/addTransaction',isAuth('ALL'),validationRequest(addTransactionSchema),addTransaction)
transactionsRoutes.put('/updateTransaction/:id',isAuth('ALL'),validationRequest(updateTransactionSchema),updateTransaction)
transactionsRoutes.patch('/deleteTransactionSoft/:id',isAuth('ALL'),deleteTransaction)
// transactionsRoutes.get('/searchTransaction',searchTransactions)
transactionsRoutes.post('/getTransactionsSummary',getTransactionsSummary)

module.exports=transactionsRoutes;