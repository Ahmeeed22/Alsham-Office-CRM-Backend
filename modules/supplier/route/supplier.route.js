const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { getAllSupplier, addSupplier } = require('../controller/supplier.controller')

const supplierRoutes=require('express').Router()

supplierRoutes.get('/allsupplier',isAuth('ADMIN'),getAllSupplier)
supplierRoutes.post('/addsupplier',addSupplier)


module.exports=supplierRoutes;