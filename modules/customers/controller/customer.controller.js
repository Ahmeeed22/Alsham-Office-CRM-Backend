const User = require("../../users/model/user.model");
const Customer = require("../model/customer.model");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const { Op, Sequelize } = require("sequelize");
const Transaction = require("../../transactions/model/transaction.model");
const DepositHistory = require("../../depositHistory/model/depositHistory.model");

const getAllCustomers = catchAsyncError(async (req, res, next) => {
    // try{
    var customers = await Customer.findAndCountAll({
        where: { company_id: req.loginData.company_id, active: true }
        , order: [
            ['createdAt', 'DESC'],
            ['name', 'ASC'],
        ], include: User
    })
    res.status(StatusCodes.OK).json({ message: "success", result: customers })

    // } catch (error) {
    //    next(new AppError('error server ',500))
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})

const addCustomer = catchAsyncError(async (req, res, next) => {
    // try{
    const customer = await Customer.findOne({ where: { name: req.body.name } });
    if (customer) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "name is exit" })
    } else {
        var customercreated = await Customer.create(req.body);
        let depositeHistory
        if (req.body.deposite && req.body.deposite > 0) {
             depositeHistory=await DepositHistory.create({type:'deposit' , details : `first Deposit when customer created ` ,customerId :customercreated.id , amount:req.body.deposite})
        }

        res.status(StatusCodes.CREATED).json({ message: "success", result: customercreated ,depositeHistory})
    }
    // } catch (error) {
    //    next(new AppError('error server ',500,error))
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})



const updateCustomer = catchAsyncError(async (req, res, next) => {
    // try{
    const id = req.params.id
    var x = await Customer.findOne({ where: { id } })
    if (!x)
        next(new AppError('invalid id customer', 400))
        var updateData={} ;
        var {name,...rest}=req.body
        if (x.dataValues.name=="petty Cash") {
            updateData={...rest}
        }else{
            updateData={...req.body}
        }

    var customer = await Customer.update(updateData, { where: { id } }) ;
    let depositeHistory ;
   
    if (req.body.deposite && req.body.deposite > 0) {
        depositeHistory=await DepositHistory.create({type: req.body.deposite>x.dataValues.deposite? 'deposit':'withdraw' , details : `update Deposit ` ,customerId :id , amount:+req.body.deposite -  +x.dataValues.deposite })
   }

    res.status(StatusCodes.OK).json({ message: "success", result: customer ,depositeHistory })
    // } catch (error) {
    //    next(new AppError('error server ',500))
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})

const deleteCustomer = catchAsyncError(async (req, res, next) => {
    // try{
    const id = req.params.id;
    var x = await Customer.findOne({ where: { id } })
    if (!x)
        next(new AppError('invalid id Customer', 400))


        var transaction = await Transaction.findOne({where:{customer_id:id}})
        if (!transaction) {
            var customer = await Customer.destroy({
                where: {
                    id
                },
            })
            res.status(StatusCodes.OK).json({ message: "success", result: customer })
        } else {
            next(new AppError("failed delete this customer type contains transactions must delete these are transactions can you deactive this customer",403))
            // res.status(StatusCodes.FORBIDDEN).json({message:"failed delte this service type contains transactions must delete these are transactions"})
        }


 
    // } catch (error) {
    //    next(new AppError('error server ',500))
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})

// search
const searchCustomers = catchAsyncError(async (req, res, next) => {
    // try{
    let indexInputs = req.query;
    console.log('line 70', indexInputs);
    const filterObj = {
        where: {},
    }
    filterObj['order'] = [
        ['createdAt', 'DESC'],
    ];
    if (indexInputs.name) {
        filterObj.where["name"] = {
            [Op.like]: `%${indexInputs.name}%`
        }
    }
    filterObj.where['company_id'] =req.loginData.company_id
    if (indexInputs.active == 0 || indexInputs.active == 1) {
        filterObj.where["active"] = indexInputs.active
    }

    if (filterObj.where.name || filterObj.where.active == 0 || filterObj.where.active == 1) {
        let customers = await Customer.findAll({ ...filterObj   ,include:[
             {model:Transaction,attributes: ['paymentAmount','balanceDue', "id"]},
             { model: DepositHistory}
            
            ],});
        res.status(StatusCodes.OK).json({ message: "success", result: customers })
    } else {
        let customers = await Customer.findAll({
            where: {
                company_id: req.loginData.company_id
              },
            order: [
                ['createdAt', 'DESC']
            ],include:[
                {model:Transaction,attributes: ['paymentAmount','balanceDue', "id"]},
                { model: DepositHistory}
               
               ]
        });
        res.status(StatusCodes.OK).json({ message: "success", result: customers })
    }

    // } catch (error) {
    //    next(new AppError('error server ',500))
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})



module.exports = { getAllCustomers, addCustomer, updateCustomer, deleteCustomer, searchCustomers }