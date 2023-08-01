const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const Supplier = require("../model/supplier.model");


const getAllSupplier =catchAsyncError(async(req,res,next)=>{
        var Suppliers=await Supplier.findAndCountAll({
                where :{company_id:req.loginData.company_id}
        })
        res.status(StatusCodes.OK).json({message:"success",result:Suppliers})

})

const addSupplier=catchAsyncError(async (req,res,next)=>{
        var x=await Supplier.findOne({where:{name:req.body.name}})
        if (x)
            next(new AppError('this name exist',400) )

        var supplier = await Supplier.create(req.body);
        res.status(StatusCodes.CREATED).json({message:"success",result:supplier})
})




module.exports={getAllSupplier , addSupplier }