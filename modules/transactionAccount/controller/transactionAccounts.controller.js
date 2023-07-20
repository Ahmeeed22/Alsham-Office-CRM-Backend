const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const TransactionAccount = require("../model/transactionAccounts.model");
const { Op, Sequelize } = require("sequelize");

const getAllTransactionAccount=catchAsyncError(async(req,res,next)=>{
    const indexInputs =  req.body ;
    const filterObj = {
        where: {},
        limit: indexInputs.limit || 10,
    }
    if (indexInputs.offset) { 
        filterObj['offset'] = indexInputs.offset * filterObj.limit;
    }
    
    filterObj.where['company_id'] =req.loginData?.company_id ||1
    // if (indexInputs.orderBy) {
        filterObj['order'] = [
            [indexInputs?.orderBy?.coulmn|| 'createdAt', indexInputs?.orderBy?.type || 'DESC'],
        ];
    // }
    if(indexInputs.type !=undefined){
        filterObj.where.type = indexInputs.type 
    }
    if(indexInputs.receiptNumber !=undefined){
        filterObj.where.receiptNumber = indexInputs.receiptNumber 
    }
    if(indexInputs.admin_id !=undefined){
        filterObj.where.admin_id = indexInputs.admin_id 
    }
    var startedDate=indexInputs.startedDate? new Date(indexInputs.startedDate) : new Date("2020-12-12 00:00:00");
    // date.setHours(date.getHours() + hours)
    let date=new Date(indexInputs.endDate)
    var  endDate=indexInputs.endDate? date.setHours(date.getHours() + 24) : new Date();
    if(indexInputs.startedDate || indexInputs.endDate){
        filterObj.where["createdAt"] ={
             [Op.between] : [startedDate , endDate]
        }   
    }
    if (indexInputs.active ==true ||indexInputs.active ==false ) {
        filterObj.where.active = indexInputs.active ;
    }
        var transactionAccount=await TransactionAccount.findAndCountAll({ 
            ...filterObj
        })
        var transactionAccountSum=await TransactionAccount.findAndCountAll({ 
            ...filterObj  ,attributes: [ 
                
                [
                    Sequelize.fn('sum', Sequelize.col('amount')), 'amount'
                ]
            ],
        })
        res.status(StatusCodes.OK).json({message:"success",result:{transactionAccount:transactionAccount,sum:transactionAccountSum}})
})

const addTransactionAccount=catchAsyncError(async (req,res,next)=>{
        const company_id=req.loginData?.company_id ||1
        var transactionAccount = await TransactionAccount.create({...req.body,company_id});
        res.status(StatusCodes.CREATED).json({message:"success",result:transactionAccount})
})

const updateTransactionAccount=catchAsyncError( async (req,res,next)=>{
        const id =req.params.id
        var x=await TransactionAccount.findOne({where:{id}})
        if (x)
            next(new AppError('this id not exist',400) )

        var TransactionAccount =await TransactionAccount.update(req.body,{where:{id}})
        res.status(StatusCodes.OK).json({message:"success",result:TransactionAccount})
})

const deleteTransactionAccount= catchAsyncError(async (req,res,next)=>{
        const id=req.params.id ;
        if (x)
        next(new AppError('this id not exist',400) )

        var TransactionAccount =await TransactionAccount.destroy({
            where :{
                id
            },
        })
        res.status(StatusCodes.OK).json({message:"success",result:TransactionAccount})
})

// search
const searchTransactionAccount=catchAsyncError(async(req,res,next)=>{
            let {searchKey}=req.query;
            if(searchKey){
            let TransactionAccount= await TransactionAccount.findAll({where:{type:{[Op.like]: `%${searchKey}%`}}});
                res.status(StatusCodes.OK).json({message:"success",TransactionAccount})
            }else{
            let TransactionAccount= await TransactionAccount.findAll({});
            res.status(StatusCodes.OK).json({message:"success",TransactionAccount})
            }
})

module.exports={getAllTransactionAccount , addTransactionAccount , deleteTransactionAccount ,searchTransactionAccount , updateTransactionAccount}