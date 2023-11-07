const isAuth = require('../../../common/middleare/isAuth');
const { getAllOwners, createOwners, getCapitalAndOwnerDrawing } = require('../controller/owners.controller');

const ownersRoutes=require('express').Router() ;

ownersRoutes.post("/getAllOwners",getAllOwners) ;
ownersRoutes.post("/addOwners",isAuth('ALL'),createOwners) ;
ownersRoutes.get("/getCapitalAndOwnerDrawing",isAuth('ALL'),getCapitalAndOwnerDrawing)

module.exports=ownersRoutes ;  