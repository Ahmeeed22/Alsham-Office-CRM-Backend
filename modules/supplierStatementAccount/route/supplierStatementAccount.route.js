const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { addSupplierStatementAccount, getAllSupplierStatementAccount } = require('../controller/supplierStatementAccount.controller')

const supplierStatementAccountRoutes=require('express').Router()

supplierStatementAccountRoutes.get('/allsupplierStatementAccount',isAuth('ADMIN'),getAllSupplierStatementAccount)
supplierStatementAccountRoutes.post('/addsupplierStatementAccount',isAuth('ADMIN'),addSupplierStatementAccount)


module.exports=supplierStatementAccountRoutes;