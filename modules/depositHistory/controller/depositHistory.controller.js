const { StatusCodes } = require("http-status-codes");
const { catchAsyncError } = require("../../../helpers/catchSync");
const DepositHistory = require("../model/depositHistory.model");

const createDepositeHistory=catchAsyncError(async(req,res,next)=>{
    const data=req.body ;
    const result=await DepositHistory.create(data) ;
    read.status(StatusCodes.CREATED).json({message : "success" ,result})
}) ;

module.exports={createDepositeHistory}