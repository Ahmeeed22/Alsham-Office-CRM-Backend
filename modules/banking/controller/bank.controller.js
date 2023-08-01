const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const BankAccount = require("../model/bank.model");

const getAllBankAccount =catchAsyncError(async(req,res,next)=>{
        var BankAccounts=await BankAccount.findAndCountAll({
                where :{company_id:req.loginData.company_id}
        })
        res.status(StatusCodes.OK).json({message:"success",result:BankAccounts})

})

const addBankAccount=catchAsyncError(async (req,res,next)=>{
        var x=await BankAccount.findOne({where:{accountNumber:req.body.accountNumber}})
        if (x)
            next(new AppError('this accountNumber exist',400) )

        var bankAccount = await BankAccount.create(req.body);
        res.status(StatusCodes.CREATED).json({message:"success",result:bankAccount})
})




module.exports={getAllBankAccount , addBankAccount }