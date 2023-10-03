const isAuth = require('../../../common/middleare/isAuth');
const { getAllOwners, createOwners } = require('../controller/owners.controller');

const ownersRoutes=require('express').Router() ;

ownersRoutes.post("/getAllOwners",getAllOwners) ;
ownersRoutes.post("/addOwners",isAuth('ALL'),createOwners) ;

module.exports=ownersRoutes ;  