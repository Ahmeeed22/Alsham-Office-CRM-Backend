const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { addTransactionHistory, getAllTransactionHistory } = require('../controller/TransactionHistory .controller')

const bankingTransactionHistoryRoutes=require('express').Router()

bankingTransactionHistoryRoutes.get('/allbankingTransactionHistory',isAuth('ADMIN'),getAllTransactionHistory)
bankingTransactionHistoryRoutes.post('/addbankingTransactionHistory',isAuth('ADMIN'),addTransactionHistory)
// companyRoutes.put('/updatecompany/:id',isAuth('ADMIN'),validationRequest(addCompanySchema),updatecompany)
// companyRoutes.delete('/deletecompany/:id',isAuth('ADMIN'),deletecompany)
// companyRoutes.get('/searchcompany',isAuth('ADMIN'),searchcompanys)

module.exports=bankingTransactionHistoryRoutes;