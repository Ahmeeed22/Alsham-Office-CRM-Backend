const isAuth = require("../../../common/middleare/isAuth");
const { createDepositeHistory } = require("../controller/depositHistory.controller");
const historyDipostRoutes=require('express').Router()

historyDipostRoutes.post('/addDepositHistory',isAuth('ADMIN'),createDepositeHistory) ;

module.exports=historyDipostRoutes ;
