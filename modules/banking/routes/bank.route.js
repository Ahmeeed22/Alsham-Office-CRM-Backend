const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { addBankAccount, getAllBankAccount } = require('../controller/bank.controller')

const bankAccountRoutes=require('express').Router()

bankAccountRoutes.get('/getAllBankAccount',isAuth('ADMIN'),getAllBankAccount)
bankAccountRoutes.post('/addBankAccount',isAuth('ADMIN'),addBankAccount)
// companyRoutes.put('/updatecompany/:id',isAuth('ADMIN'),validationRequest(addCompanySchema),updatecompany)
// companyRoutes.delete('/deletecompany/:id',isAuth('ADMIN'),deletecompany)
// companyRoutes.get('/searchcompany',isAuth('ADMIN'),searchcompanys)

module.exports=bankAccountRoutes;