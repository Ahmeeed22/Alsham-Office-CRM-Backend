const User = require("../../users/model/user.model");
const Customer = require("../../customers/model/customer.model");
const Service = require("../../services/model/service.model");
const Transaction = require("../model/transaction.model");
const { Op, Sequelize } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const LoggerService = require("../../../services/logger.service");
const HistoryTransactions = require("../../historyTransaction/model/history.transactions.model");
const TransactionAccount = require("../../transactionAccount/model/transactionAccounts.model");
const TransactionAccountBanking = require("../../bankingTransactionHistory/model/bankingTransactionHistory.model");
const BankAccount = require("../../banking/model/bank.model");
const Supplier = require("../../supplier/model/supplier.model");
const SupplierStatementAccount = require("../../supplierStatementAccount/model/supplierStatementAccount.model");

const logger = new LoggerService('transaction.controller')


const getAllTransactions = catchAsyncError(async (req, res, next) => {
    const indexInputs = req.body;
    const filterObj = {
        where: {},
        limit: indexInputs.limit || 10,
    }
    if (indexInputs.offset) {
        filterObj['offset'] = indexInputs.offset * filterObj.limit;
    }

    filterObj.where['company_id'] = req.loginData.company_id
    // if (indexInputs.orderBy) {
    filterObj['order'] = [
        [indexInputs?.orderBy?.coulmn || 'createdAt', indexInputs?.orderBy?.type || 'DESC'],
    ];
    // }
    if (indexInputs.customer_id != undefined) {
        filterObj.where.customer_id = indexInputs.customer_id
    }
    if (indexInputs.admin_id != undefined) {
        filterObj.where.admin_id = indexInputs.admin_id
    }
    var startedDate = indexInputs.startedDate ? new Date(indexInputs.startedDate) : new Date("2020-12-12 00:00:00");
    // date.setHours(date.getHours() + hours)
    let date = new Date(indexInputs.endDate)
    var endDate = indexInputs.endDate ? date.setHours(date.getHours() + 24) : new Date();
    if (indexInputs.startedDate || indexInputs.endDate) {
        filterObj.where["createdAt"] = {
            [Op.between]: [startedDate, endDate]
        }
    }
    if (indexInputs.active == true || indexInputs.active == false) {
        filterObj.where.active = indexInputs.active;
    }
    if (indexInputs.balanceDue) {
        filterObj.where.balanceDue = { [Op.gte]: indexInputs.balanceDue };
    }

    // try {
    console.log(filterObj.where);
    var transactions = await Transaction.findAndCountAll({
        ...filterObj
        , include: [{ model: User, attributes: ['name', "id"] },
        { model: Customer, attributes: ['name', "id"] },
        { model: Service, attributes: ['name', "id", "desc"] },
        { model: HistoryTransactions, attributes: ["details", "id", "createdAt", "transaction_id", "company_id"] }
        ]
    })
    var transactionsInfo = await Transaction.findAll({
        where: filterObj.where
        , attributes: [
            [
                // Sequelize.fn('sum', Sequelize.col('profite')), 'total profite'
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('profite'), '*', Sequelize.col('quantity'))
                ),
                'total_profite',
            ],
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('paymentAmount'), '+', Sequelize.col('balanceDue'))
                ),
                'total_price',
            ],
            [
                Sequelize.fn('sum', Sequelize.col('paymentAmount')), 'paymentAmount'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('commission')), 'SumCommission'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('balanceDue')), 'balanceDue'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('quantity')), 'quantity'
            ],
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('price'), '*', Sequelize.col('quantity'))
                ),
                'total_price_without_profite'
            ]
        ],
    }) ;
    var transactionsInfoComissionIsPaid = await Transaction.findAndCountAll({
        where: {...filterObj.where,comIsDone:false}
        , attributes: [
            [
                Sequelize.fn('sum', Sequelize.col('commission')),
                'sumCommissionUNpaid'
            ]
        ]
    }) ;
    var sumCommissionUNpaid = +transactionsInfoComissionIsPaid?.rows[0]?.dataValues?.sumCommissionUNpaid || 0;

    res.status(StatusCodes.OK).json({ message: "success", result: transactions, allProfite: transactionsInfo ,sumCommissionUNpaid })
    // } catch (error) {
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})

const addTransaction = catchAsyncError(async (req, res, next) => {
    // try{
    if ((req.body.paymentAmount + req.body.balanceDue) === ((req.body.price + req.body.profite) * req.body.quantity)) {
        console.log("req.loginData  = ",req.loginData);
        if (req.body.accountId) {
            let bankAccount;
                bankAccount = await BankAccount.findOne({
                    where: { id: req.body.accountId },
                });
            if (bankAccount && bankAccount.balance >= (req.body.price * req.body.quantity)) {

                var transaction = await Transaction.create(req.body);
                // add history transaction
                let date = new Date()
                var historyTransaction = await HistoryTransactions.create({ details: `the fist payment Amount  = ${transaction.dataValues.paymentAmount} at ${date.toLocaleDateString()} ${date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}`, transaction_id: transaction.dataValues.id, company_id: req.loginData.company_id });

                var transactionAccountBanking = await TransactionAccountBanking.create({ type: "withdraw", amount: req.body.price * req.body.quantity, accountId: req.body.accountId , DESC : ` ${req.body?.sponsoredName}`,empName : `${req.loginData?.name}`});

                const updatedBalance = +bankAccount.balance - (+req.body.price * +req.body.quantity);
                const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: bankAccount.id } });

                res.status(StatusCodes.CREATED).json({ message: "success", result: transaction, historyTransaction: historyTransaction, transactionAccountBanking, updateBankAccount })

            } else {
                res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid bank account or Insufficient balance." })
            }
        } else if(req.body.visa) {
            // handle here visa transaction apply 
            let supplierAccount;
                supplierAccount = await Supplier.findOne({
                    where: { id: req.body.supplierId },
                });
                if (supplierAccount && supplierAccount.balance >= (req.body.price * req.body.quantity)) {
                    const transaction = await Transaction.create(req.body);
                    const supplierStatementAccount = await SupplierStatementAccount.create({ type: "debit", amount: req.body.price * req.body.quantity,supplierId:req.body.supplierId, desc: `${req.body.sponsoredName}` ,empName : `${req.loginData?.name}`});

                    const updatedBalance=+supplierAccount.balance - (+req.body.price * +req.body.quantity) ;
                    const updateSupplierAccount = await Supplier.update({ balance: updatedBalance }, { where: { id: supplierAccount.id } });

                    res.status(StatusCodes.CREATED).json({ message: "success", result: transaction, supplierStatementAccount, updateSupplierAccount })

                }else{
                    res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid supplier account or Insufficient balance." }) ;      
                }    
        }


    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid data of payamount and balance" })
    }

    // } catch (error) {
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})

const updateTransaction = catchAsyncError(async (req, res, next) => {
    // try{
    const id = req.params.id
    var transaction = await Transaction.findOne({ where: { id } })
    if (!transaction)
        next(new AppError("this id not valid", 400))
    // res.status(StatusCodes.BAD_REQUEST).json({message:"this id not valid"}) 
    console.log(transaction.dataValues);
    if(req.body.com){
        console.log('req.body',req.body , );
        var transactionUpdated = await Transaction.update(req.body, { where: { id } }) ;
        res.status(StatusCodes.OK).json({ message: "success" }) ;
    }

    if ((req.body.paymentAmount + req.body.balanceDue) == ((transaction.dataValues.price + transaction.dataValues.profite) * transaction.dataValues.quantity)) {

        var transactionUpdated = await Transaction.update(req.body, { where: { id } })
        let date = new Date()
        logger.info(`Last_P = ${transaction.dataValues.paymentAmount} and New_P = ${req.body.paymentAmount - transaction.dataValues.paymentAmount} the total payment = ${req.body.paymentAmount} at ${date.toLocaleDateString()} `)
        // add history transaction
        var historyTransaction = await HistoryTransactions.create({ details: `Last_P = ${transaction.dataValues.paymentAmount} and New_P = ${req.body.paymentAmount - transaction.dataValues.paymentAmount} the total payment = ${req.body.paymentAmount} at ${date.toLocaleDateString()} ${date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}`, transaction_id: id, company_id: req.loginData.company_id })
        res.status(StatusCodes.OK).json({ message: "success", result: transactionUpdated, historyTransaction: historyTransaction })
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid data of payamount and balance" })
    }
    // } catch (error) {
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})
 
const deleteTransaction = catchAsyncError(async (req, res, next) => {
    //    try {
    const id = req.params.id;
    var transaction = await Transaction.findOne({ where: { id } })
    if (!transaction)
        next(new AppError("this id not valid", 400))
    // res.status(StatusCodes.BAD_REQUEST).json({message:"this id not valid"}) 

    var transactioDeleted = await Transaction.update({ active: false }, {
        where: {
            id
        },
    })
    res.status(StatusCodes.OK).json({ message: "success", result: transactioDeleted })
    //    } catch (error) {
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    //    }
})


const getTransactionsSummary = catchAsyncError(async (req, res, next) => {
    const indexInputs = req.body;
    const filterObj = {
        where: {},
        limit: indexInputs.limit || 10,
    }
    const filterObjAccount = {
        where: {},
        limit: indexInputs.limit || 10,
    }
    if (indexInputs.offset) {
        filterObj['offset'] = indexInputs.offset * filterObj.limit;
    }

    filterObj.where['company_id'] = req.loginData?.company_id || 1

    var startedDate = indexInputs.startedDate ? new Date(indexInputs.startedDate) : new Date("2020-12-12 00:00:00");
    let date = new Date(indexInputs.endDate)
    var endDate = indexInputs.endDate ? date.setHours(date.getHours() + 24) : new Date();
    if (indexInputs.startedDate || indexInputs.endDate) {
        filterObj.where["createdAt"] = {
            [Op.between]: [startedDate, endDate]
        }
    }
    if (indexInputs?.balanceDue) {
        filterObj.where.balanceDue = { [Op.gte]: indexInputs.balanceDue };
    }


    var transactionsInfo = await Transaction.findAndCountAll({
        where: filterObj.where
        , attributes: [
            [
                Sequelize.fn('sum', Sequelize.col('paymentAmount')), 'paymentAmount'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('balanceDue')), 'balanceDue'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('commission')), 'sumCommission'
            ],
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('profite'), '*', Sequelize.col('quantity'))
                ),
                'total_profite_gross',
            ],
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('paymentAmount'), '+', Sequelize.col('balanceDue'))
                ),
                'total_price',
            ],
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('price'), '*', Sequelize.col('quantity'))
                ),
                'total_price_without_profite'
            ]
        ],
    }) ;
    var transactionsInfoComissionIsPaid = await Transaction.findAndCountAll({
        where: {...filterObj.where,comIsDone:false}
        , attributes: [
            [
                Sequelize.fn('sum', Sequelize.col('commission')),
                'sumCommissionUNpaid'
            ]
        ]
    })


    var count = +transactionsInfo?.count;
    var paymentAmount = +transactionsInfo?.rows[0]?.dataValues?.paymentAmount || 0;
    var balanceDue = +transactionsInfo?.rows[0]?.dataValues?.balanceDue || 0;
    var total_profite_gross = +transactionsInfo?.rows[0]?.dataValues?.total_profite_gross || 0;
    var total_price_without_profite = +transactionsInfo?.rows[0]?.dataValues?.total_price_without_profite ||0;
    var commission = +transactionsInfo?.rows[0]?.dataValues?.sumCommission || 0;
    var sumCommissionUNpaid = +transactionsInfoComissionIsPaid?.rows[0]?.dataValues?.sumCommissionUNpaid || 0;

    filterObjAccount.where = { ...filterObj.where, type: 'supply' }
    var transactionAccountSumSupply = await TransactionAccount.findAndCountAll({
        ...filterObjAccount, attributes: [

            [
                Sequelize.fn('sum', Sequelize.col('amount')), 'sumSupply'
            ]
        ],
    })
    var sumSupply = +transactionAccountSumSupply?.rows[0]?.dataValues?.sumSupply || 0;

    filterObjAccount.where = { ...filterObj.where, type: 'expenses' }
    // console.log("filterObjAccount",filterObjAccount);
    var transactionAccountSumExpenses = await TransactionAccount.findAndCountAll({
        ...filterObjAccount, attributes: [

            [
                Sequelize.fn('sum', Sequelize.col('amount')), 'sumExpenses'
            ]
        ],
    })
    var sumExpenses = +transactionAccountSumExpenses?.rows[0]?.dataValues?.sumExpenses || 0;

    var filterPettyCash = {
        company_id: req.loginData?.company_id || 1,
        name: {
            [Op.like]: `%petty Cash%`
        }
    }
    let customers = await Customer.findAll({ where: filterPettyCash, include: [{ model: Transaction, attributes: ['paymentAmount', "id"] }], });
    const customersdeposit = await Customer.findAll({
        attributes: [
            [Sequelize.fn('sum', Sequelize.col('deposite')), 'totalDeposit'],
        ],
    });
    var pettyCash = +customers[0].transactions[0].paymentAmount ||0 ;
    var totalDeposit = +customersdeposit[0].dataValues.totalDeposit ||0;
    var total_price = +transactionsInfo?.rows[0]?.dataValues?.total_price;
    var currentCash = paymentAmount + totalDeposit + pettyCash - sumSupply - sumExpenses - total_price_without_profite;
    // var cash = paymentAmount + totalDeposit + pettyCash - sumSupply - sumExpenses - total_price_without_profite -banks -suppliers ;

    res.status(StatusCodes.OK).json({ message: "success", summary: { sumExpenses, currentCash, total_profite_gross, balanceDue, paymentAmount, count, sumSupply, transactionAccountSumExpenses, total_price, pettyCash, totalDeposit, total_price_without_profite,commission ,sumCommissionUNpaid } })
});

module.exports = { getAllTransactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsSummary }
