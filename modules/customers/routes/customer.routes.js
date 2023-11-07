const { getAllCustomers, addCustomer, updateCustomer, deleteCustomer, searchCustomers, getAllSumDepositCustomers } = require('../controller/customer.controller')
const isAuth = require('../../../common/middleare/isAuth')
const { getAllSumBalanceCustomers } = require('../../transactions/controller/transaction.controller')

const customersRoutes=require('express').Router()

customersRoutes.get('/allcustomers',isAuth('ALL'),getAllCustomers) 
customersRoutes.post('/addCustomer',isAuth('ALL'),addCustomer)
customersRoutes.put('/updateCustomer/:id',isAuth('ALL'),updateCustomer)
customersRoutes.delete('/deleteCustomer/:id',isAuth('ALL'),deleteCustomer)
customersRoutes.get('/searchCustomer',isAuth('ALL'),searchCustomers)
customersRoutes.get('/getSumDeposit',isAuth('ALL') ,getAllSumDepositCustomers) ;
customersRoutes.get('/getAllSumBalanceCustomers',isAuth('ALL'),getAllSumBalanceCustomers)

module.exports=customersRoutes;