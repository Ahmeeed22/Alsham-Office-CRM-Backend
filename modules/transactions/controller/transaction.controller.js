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
const sequelize = require("../../../configrations/sequelize");
const Owners = require("../../owners/model/owners.model");

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
    if (indexInputs.sponsoredName) {
        filterObj.where["sponsoredName"] = {
            [Op.like]: `%${indexInputs.sponsoredName}%`
        }
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
        { model: Service, attributes: ['name', "id"] },
        { model: Supplier, attributes: ['name', "id", "balance"] },
        { model: BankAccount, attributes: ['name', "id", "balance"] },
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
                Sequelize.fn(
                    'sum',
                    Sequelize.where(Sequelize.col('commission'), '*', Sequelize.col('quantity'))
                )
                , 'SumCommission'
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
    });
    var transactionsInfoComissionIsNotPaid = await Transaction.findAndCountAll({
        where: { ...filterObj.where, comIsDone: false }
        , attributes: [
            [
                Sequelize.fn('sum',
                    Sequelize.where(Sequelize.col('commission'), '*', Sequelize.col('quantity'))
                )
                , 'sumCommissionUNpaid'
            ]
        ]
    });
    var sumCommissionUNpaid = +transactionsInfoComissionIsNotPaid?.rows[0]?.dataValues?.sumCommissionUNpaid || 0;
    console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
    res.status(StatusCodes.OK).json({ message: "success", result: transactions, allProfite: transactionsInfo, sumCommissionUNpaid })
    // } catch (error) {
    //     // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : 'error' , error})
    // }
})

const addTransaction = catchAsyncError(async (req, res, next) => {

    if (req.body.accountId && req.body.normalTransaction != 'deposit') {

        // check payment and balance correct or no 
        req.body.paymentAmount = 0;
        if (((req.body.price + req.body.profite) * req.body.quantity) != (req.body.balanceDue + req.body.paymentAmount)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid data of payamount and balance" })
        }

        let bankAccount;
        bankAccount = await BankAccount.findOne({
            where: { id: req.body.accountId },
        });
        if (bankAccount && bankAccount.balance >= (req.body.price * req.body.quantity)) {

            var transaction = await Transaction.create({ ...req.body, sponsoredName: `${req.body.sponsoredName} , By bank:- ${bankAccount.name}` });
            // add history transaction
            let date = new Date()
            var historyTransaction = await HistoryTransactions.create({ details: `the fist payment Amount  = ${transaction.dataValues.paymentAmount} at ${date.toLocaleDateString()} ${date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}`, transaction_id: transaction.dataValues.id, company_id: req.loginData.company_id });

            var transactionAccountBanking = await TransactionAccountBanking.create({ type: "withdraw", amount: req.body.price * req.body.quantity, accountId: req.body.accountId, DESC: ` ${req.body?.sponsoredName}`, empName: `${req.loginData?.name}` });

            const updatedBalance = +bankAccount.balance - (+req.body.price * +req.body.quantity);
            const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: bankAccount.id } });

            res.status(StatusCodes.CREATED).json({ message: "success", result: transaction, historyTransaction: historyTransaction, transactionAccountBanking, updateBankAccount })

        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid bank account or Insufficient balance." })
        }
    } else if (req.body.supplierId && req.body.normalTransaction != 'deposit') {
        // HANDLE PAYMENT AND BALANCE due
        req.body.paymentAmount = 0;
        if (((req.body.price + req.body.profite) * req.body.quantity) != (req.body.balanceDue + req.body.paymentAmount)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid data of payamount and balance" })
        }
        // handle here visa transaction apply 
        let supplierAccount;
        supplierAccount = await Supplier.findOne({
            where: { id: req.body.supplierId },
        });
        // && supplierAccount.balance >= (req.body.price * req.body.quantity)
        if (supplierAccount) {
            const transaction = await Transaction.create(req.body);
            const supplierStatementAccount = await SupplierStatementAccount.create({ type: "debit", amount: req.body.price * req.body.quantity, supplierId: req.body.supplierId, desc: `${req.body.sponsoredName}`, empName: `${req.loginData?.name}` });

            const updatedBalance = +supplierAccount.balance - (+req.body.price * +req.body.quantity);
            const updateSupplierAccount = await Supplier.update({ balance: updatedBalance }, { where: { id: supplierAccount.id } });

            res.status(StatusCodes.CREATED).json({ message: "success", result: transaction, supplierStatementAccount, updateSupplierAccount })

        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid supplier account or Insufficient balance." });
        }
    } else if (req.body.normalTransaction == 'deposit') {
        let bankAccount;
        bankAccount = await BankAccount.findOne({
            where: { id: req.body.accountId },
        });
        bankAccount ? ' ' : res.status(StatusCodes.BAD_REQUEST).json({ message: 'invalid bank account' });

        var transaction = await Transaction.create({ ...req.body, balanceDue: 0, sponsoredName: `${req.body.sponsoredName} , deposite on  bank:- ${bankAccount.name}` });
        // add history transaction
        let date = new Date()
        // var historyTransaction = await HistoryTransactions.create({ details: `the fist payment Amount  = ${transaction.dataValues.paymentAmount} at ${date.toLocaleDateString()} ${date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}`, transaction_id: transaction.dataValues.id, company_id: req.loginData.company_id });

        var transactionAccountBanking = await TransactionAccountBanking.create({ type: "deposit", amount: req.body.paymentAmount, accountId: req.body.accountId, DESC: ` ${req.body?.sponsoredName}`, empName: `${req.loginData?.name}` });


        const updatedBalance = +bankAccount.balance + (+req.body.paymentAmount);
        const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: bankAccount.id } });

        res.status(StatusCodes.CREATED).json({ message: "success", result: transaction, historyTransaction: historyTransaction, transactionAccountBanking, updateBankAccount })

    }

})

const updateTransaction = catchAsyncError(async (req, res, next) => {
    // try{
    const id = req.params.id
    var transaction = await Transaction.findOne({ where: { id } })
    if (!transaction)
        next(new AppError("this id not valid", 400))
    console.log(transaction.dataValues);
    // when check to commission paied
    if (req.body.com) {
        console.log('req.body', req.body,);
        var transactionUpdated = await Transaction.update(req.body, { where: { id } });
        res.status(StatusCodes.OK).json({ message: "success" });
    }
    // handle all cases at update  
    //(req.body.paymentAmount + req.body.balanceDue) == ((req.body.price + req.body.profite) * req.body.quantity)
    console.log("ndfsbdnsfdkjgndfng fgdjngjd req.body.supplierId == ",req.body.supplierId);
    if ((req.body.accountId && req.body.paymentAmount == 0) || (req.body.supplierId && req.body.paymentAmount == 0) ) {
        let date = new Date()
        logger.info(`Last_P = ${transaction.dataValues.paymentAmount} and New_P = ${req.body.paymentAmount - transaction.dataValues.paymentAmount} the total payment = ${req.body.paymentAmount} at ${date.toLocaleDateString()} `)
        // add history transaction
        var historyTransaction = await HistoryTransactions.create({ details: `Last_P = ${transaction.dataValues.paymentAmount} and New_P = ${req.body.paymentAmount - transaction.dataValues.paymentAmount} the total payment = ${req.body.paymentAmount} at ${date.toLocaleDateString()} ${date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()}`, transaction_id: id, company_id: req.loginData.company_id })

        // update transaction
        var transactionUpdated = await Transaction.update(req.body, { where: { id } })

       // check price update  and update customer account
        if (+req.body.balanceDue > +transaction.dataValues.balanceDue) {
            var customer = await Customer.findOne({ where: { id: req.body.customer_id } })
            var newDeposit = customer.deposite + (-req.body.balanceDue + transaction.dataValues.balanceDue) 
            var customerupdated = await Customer.update({ deposite : +newDeposit}, { where: { id :req.body.customer_id} });
            console.log("tessssssssssssssssssssssssssssttttttttttttt increaaaaaaaaaaaaaase",newDeposit ,"customerupdated ", customerupdated);
        }else if (+req.body.balanceDue < +transaction.dataValues.balanceDue) {
            var customer = await Customer.findOne({ where: { id: req.body.customer_id } })
            var newDeposit = customer.deposite - (req.body.balanceDue - transaction.dataValues.balanceDue) 
            console.log("tessssssssssssssssssssssssssssttttttttttttt decreaaaaaaaaaaaaaase" , newDeposit);
            var customerupdated = await Customer.update({ deposite : +newDeposit }, { where: { id :req.body.customer_id} });
        }
      // hande supplier or banks balnce 
        if ((req.body.price * req.body.quantity) > (transaction.dataValues.price * transaction.dataValues.quantity)
        && (transaction.dataValues.supplierId ==req.body.supplierId)) {

            // if normal transaction  
            if (req.body.accountId && (transaction.dataValues.accountId ==req.body.accountId)) {
                var transactionAccountBanking = await TransactionAccountBanking.create({ type: "withdraw", amount: ((req.body.price * req.body.quantity) - (transaction.dataValues.price * transaction.dataValues.quantity)), accountId: req.body.accountId, DESC: `update ${req.body?.sponsoredName}`, empName: `${req.loginData?.name}` });

                const bankAccounnt = await BankAccount.findOne({ where: { id: req.body.accountId } })
                const updatedBalance = +bankAccounnt.balance - ((req.body.price * req.body.quantity) - (transaction.dataValues.price * transaction.dataValues.quantity));
                const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: req.body.accountId } });
            // if visa application
            } else if (req.body.supplierId && (transaction.dataValues.supplierId ==req.body.supplierId)) {

                await SupplierStatementAccount.create({ type: "debit", amount: ((req.body.price * req.body.quantity) - (transaction.dataValues.price * transaction.dataValues.quantity)), supplierId: req.body.supplierId, desc: `${req.body.sponsoredName}`, empName: `${req.loginData?.name}` });


                const supplierAccounnt = await Supplier.findOne({ where: { id: req.body.supplierId } })
                const updatedBalance = +supplierAccounnt.balance - ((req.body.price * req.body.quantity) - (transaction.dataValues.price * transaction.dataValues.quantity));
                const updateSupplier = await Supplier.update({ balance: updatedBalance }, { where: { id: req.body.supplierId } });
                // handle if different supplier selected
            }
        } else if ((req.body.price * req.body.quantity) < (transaction.dataValues.price * transaction.dataValues.quantity)
        && (transaction.dataValues.supplierId ==req.body.supplierId)) {

            if (req.body.accountId && (transaction.dataValues.accountId ==req.body.accountId)) {
                    await TransactionAccountBanking.create({ type: "deposit", amount: ((transaction.dataValues.price * transaction.dataValues.quantity) - (req.body.price * req.body.quantity)), accountId: req.body.accountId, DESC: `update ${req.body?.sponsoredName}`, empName: `${req.loginData?.name}` });

                const bankAccounnt = await BankAccount.findOne({ where: { id: req.body.accountId } })
                const updatedBalance = +bankAccounnt.balance + ((transaction.dataValues.price * transaction.dataValues.quantity) - (req.body.price * req.body.quantity));

                const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: req.body.accountId } });
            }else if (req.body.supplierId && (transaction.dataValues.supplierId ==req.body.supplierId)) {

                await SupplierStatementAccount.create({ type: "credit", amount: ((transaction.dataValues.price * transaction.dataValues.quantity) - (req.body.price * req.body.quantity)), supplierId: req.body.supplierId, desc: `${req.body.sponsoredName}`, empName: `${req.loginData?.name}` });
                const supplierAccounnt = await Supplier.findOne({ where: { id: req.body.supplierId } })

                const updatedBalance = +supplierAccounnt.balance + ((transaction.dataValues.price * transaction.dataValues.quantity) - (req.body.price * req.body.quantity));

                const updateBankAccount = await Supplier.update({ balance: updatedBalance }, { where: { id: req.body.supplierId } });
            }

        } 

        if (req.body.supplierId && (transaction.dataValues.supplierId !=req.body.supplierId)){
            console.log("tttttttttttttttttttttttttrrrrrrrrrrrrrrrrrrrwwwwwwwwwwwwww " );
            const supplierAccounntOld = await Supplier.findOne({ where: { id: transaction.dataValues.supplierId } }) ;
            const SupplierbalanceOld = +supplierAccounntOld.dataValues.balance  + (transaction.dataValues.price * transaction.dataValues.quantity);
            await Supplier.update({ balance: SupplierbalanceOld }, { where: { id: transaction.dataValues.supplierId } });
            await SupplierStatementAccount.create({ type: "credit", amount: ((transaction.dataValues.price * transaction.dataValues.quantity)), supplierId: transaction.dataValues.supplierId, desc: `${req.body.sponsoredName}`, empName: `${req.loginData?.name}` });

            const supplierAccounntNew = await Supplier.findOne({ where: { id: req.body.supplierId } }) ;
            const supplierBalanceNew= +supplierAccounntNew.dataValues.balance - (req.body.price * req.body.quantity);
            await Supplier.update({ balance: supplierBalanceNew }, { where: { id: req.body.supplierId } });
            await SupplierStatementAccount.create({ type: "debit", amount: (req.body.price * req.body.quantity), supplierId: req.body.supplierId, desc: `${req.body.sponsoredName}`, empName: `${req.loginData?.name}` });

        }



        res.status(StatusCodes.OK).json({ message: "success", result: transactionUpdated, historyTransaction: historyTransaction })
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid data of payamount and balance" })
    }

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
    console.log("hooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooome ", req.body);
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
    console.log('startedDate', startedDate)
    console.log('endDate', endDate)
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
                Sequelize.fn(
                    'sum',
                    Sequelize.where(Sequelize.col('commission'), '*', Sequelize.col('quantity'))
                )
                , 'sumCommission'
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
    });
    var transactionsInfoComissionIsPaid = await Transaction.findAndCountAll({
        where: { ...filterObj.where, comIsDone: true }
        , attributes: [
            [
                Sequelize.fn(
                    'sum',
                    Sequelize.where(Sequelize.col('commission'), '*', Sequelize.col('quantity'))
                )
                , 'sumCommissionPaid'
            ]
        ]
    });

    var suppliers = await Supplier.findAndCountAll({
        where: { company_id: req?.loginData.company_id }
        , attributes: [
            [
                Sequelize.fn('sum', Sequelize.col('balance')),
                'sumBalanceSupplier'
            ]
        ]
    });

    var banks = await BankAccount.findAndCountAll({
        where: { company_id: req?.loginData.company_id }
        , attributes: [
            [
                Sequelize.fn('sum', Sequelize.col('balance')),
                'sumBalanceBanks'
            ]
        ]
    })



    var count = +transactionsInfo?.count;
    var paymentAmount = +transactionsInfo?.rows[0]?.dataValues?.paymentAmount || 0;
    var balanceDue = +transactionsInfo?.rows[0]?.dataValues?.balanceDue || 0;
    var total_profite_gross = +transactionsInfo?.rows[0]?.dataValues?.total_profite_gross || 0;
    var total_price_without_profite = +transactionsInfo?.rows[0]?.dataValues?.total_price_without_profite || 0;
    var commission = +transactionsInfo?.rows[0]?.dataValues?.sumCommission || 0;
    var sumCommissionpaid = +transactionsInfoComissionIsPaid?.rows[0]?.dataValues?.sumCommissionPaid || 0;
    var supplierBalance = +suppliers?.rows[0]?.dataValues?.sumBalanceSupplier || 0;
    var banksBalance = +banks?.rows[0]?.dataValues?.sumBalanceBanks || 0;


    filterObjAccount.where = { ...filterObj.where, type: 'supply' }
    console.log("exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpppppenses ", filterObj);
    var transactionAccountSumSupply = await TransactionAccount.findAndCountAll({
        ...filterObjAccount, attributes: [

            [
                Sequelize.fn('sum', Sequelize.col('amount')), 'sumSupply'
            ]
        ],
    })
    var sumSupply = +transactionAccountSumSupply?.rows[0]?.dataValues?.sumSupply || 0;

    filterObjAccount.where = { ...filterObj.where, type: 'expenses' }
    console.log("filterObjAccount 888888888888888888888888888888888888888888888888", filterObj.where);
    var transactionAccountSumExpenses = await TransactionAccount.findAndCountAll({
        ...filterObjAccount, attributes: [

            [
                Sequelize.fn('sum', Sequelize.col('amount')), 'sumExpenses'
            ]
        ],
    })
    var sumExpenses = +transactionAccountSumExpenses?.rows[0]?.dataValues?.sumExpenses || 0;


    // add filteration by company id here
    const customersdeposit = await Customer.findAll({
        where: {
            company_id: req.loginData.company_id
        },
        attributes: [
            [Sequelize.fn('sum', Sequelize.col('deposite')), 'totalDeposit'],
        ],
    });
    var totalDeposit = +customersdeposit[0].dataValues.totalDeposit || 0;
    var total_price = +transactionsInfo?.rows[0]?.dataValues?.total_price;
    var currentCash = paymentAmount + totalDeposit - sumSupply - sumExpenses - total_price_without_profite - supplierBalance - banksBalance;
    // var cash = paymentAmount + totalDeposit + pettyCash - sumSupply - sumExpenses - total_price_without_profite -banks -suppliers ;

    res.status(StatusCodes.OK).json({ message: "success", summary: { sumExpenses, currentCash, total_profite_gross, balanceDue, paymentAmount, count, sumSupply, transactionAccountSumExpenses, total_price, totalDeposit, total_price_without_profite, commission, sumCommissionPaid: sumCommissionpaid, supplierBalance, banksBalance } })
});

const getAllSumBalanceCustomers = catchAsyncError(async (req, res, next) => {

    // get sum balance cuatomers ////////////////////////////////////////

    const sumbalanceDue = await Transaction.sum("balanceDue", {
        where: {
            active: true, // You can add any conditions you need here
            company_id: req.loginData.company_id
        },
    });

    const sumCommission = await Transaction.sum("commission", {
        where: {
            active: true, // You can add any conditions you need here
            company_id: req.loginData.company_id,
            comIsDone: false
        },
    });

    const sumCommissionPaied = await Transaction.sum('commission', {
        where: {
            active: true,
            company_id: req.loginData.company_id,
            comIsDone: true
        }
    })

    //   filterObjAccount.where = { ...filterObj.where, type: 'expenses' }
    // console.log("filterObjAccount",filterObjAccount);
    var transactionAccountSumExpenses = await TransactionAccount.findAndCountAll({
        where: {
            active: true, // You can add any conditions you need here
            company_id: req.loginData.company_id,
            type: 'expenses'
        },
        attributes: [

            [
                Sequelize.fn('sum', Sequelize.col('amount')), 'sumExpenses'
            ]
        ],
    })
    var sumExpenses = +transactionAccountSumExpenses?.rows[0]?.dataValues?.sumExpenses || 0;

    const totalProfit = await Transaction.findAndCountAll({
        where: {
            active: true, // You can add any conditions you need here
            company_id: req.loginData.company_id
        }, attributes: [
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
                    Sequelize.where(Sequelize.col('price'), '*', Sequelize.col('quantity'))
                ),
                'total_price_without_profite'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('paymentAmount')), 'paymentAmount'
            ]
        ],
    });



    res.status(StatusCodes.OK).json({
        message: "success", result: {
            sumExpenses, sumBalanceCustomers: sumbalanceDue, sumCommission, totalProfit: +totalProfit?.rows[0]?.dataValues?.total_profite_gross || 0, totalPayment: totalProfit?.rows[0]?.dataValues?.paymentAmount || 0,
            total_price_without_profite: totalProfit?.rows[0]?.dataValues?.total_price_without_profite || 0, sumCommissionPaied, sumBalance
        }
    })

})

// const sumBalance= catchAsyncError(async (req,res)=>{
//     let sumBalance = await Transaction.findAll({
//         attributes: [
//           [Sequelize.fn('SUM', Sequelize.col('balanceDue')), 'total_balance'],
//         ],
//         include: [{
//           model: Customer,
//           attributes: ['name'],
//         }],
//         group: ['Transaction.customer_id', 'Customer.name'],
//       }) ;
//       res.status(StatusCodes.OK).json({
//         message: "success", result: { sumBalance } 
//     })
// })

// 
const sumBalance = catchAsyncError(async (req, res) => {
    const sumBalanceQuery = `
      SELECT
        customers.name,
        SUM(transactions.balanceDue) AS total_balance
      FROM
        transactions
      INNER JOIN
        customers ON transactions.customer_id = customers.id
        WHERE
    transactions.company_id = ${req.loginData?.company_id}

        GROUP BY
        transactions.customer_id, customers.name;
    `;

    const sumBalanceResult = await sequelize.query(sumBalanceQuery, {
        type: Sequelize.QueryTypes.SELECT,
    });

    res.status(StatusCodes.OK).json({
        message: "success",
        result: { sumBalance: sumBalanceResult },
    });
});

const calcCash = catchAsyncError(async (req, res) => {

    const totalProfit = await Transaction.findAndCountAll({
        where: {
            active: true, // You can add any conditions you need here
            company_id: req.loginData.company_id
        }, attributes: [
            [
                Sequelize.fn(
                    'SUM',
                    Sequelize.where(Sequelize.col('price'), '*', Sequelize.col('quantity'))
                ),
                'total_price_without_profite'
            ],
            [
                Sequelize.fn('sum', Sequelize.col('paymentAmount')), 'paymentAmount'
            ]
        ],
    });

    const total_price_without_profite = totalProfit?.rows[0]?.dataValues?.total_price_without_profite || 0;
    const totalPayment = totalProfit?.rows[0]?.dataValues?.paymentAmount || 0;

    const sum = await Customer.sum("deposite", {
        where: {
            active: true, // You can add any conditions you need here
            company_id: req.loginData.company_id
        },
    });
    const customersDeposites = sum;

    const drowingSum = await Owners.sum("amount", {
        where: {
            type: "drowing",
            active: true, // You can add any additional conditions here
            company_id: req.loginData.company_id
        },
    });

    const investSum = await Owners.sum("amount", {
        where: {
            type: "invest",
            active: true, // You can add any additional conditions here
            company_id: req.loginData.company_id
        },
    });

    const sumCommissionPaied = await Transaction.sum('commission', {
        where: {
            active: true,
            company_id: req.loginData.company_id,
            comIsDone: true
        }
    })

    var suppliers = await Supplier.sum('balance', {
        where: { company_id: req?.loginData.company_id }
    });

    var banks = await BankAccount.sum('balance', {
        where: { company_id: req?.loginData.company_id }
    })

    var transactionAccountSumExpenses = await TransactionAccount.findAndCountAll({
        where: {
            type: 'expenses',
            company_id: req?.loginData.company_id,
            active: true
        }
        , attributes: [

            [
                Sequelize.fn('sum', Sequelize.col('amount')), 'sumExpenses'
            ]
        ],
    })
    const sumExpenses = +transactionAccountSumExpenses?.rows[0]?.dataValues?.sumExpenses || 0;

    const cash = totalPayment + customersDeposites + investSum - drowingSum - sumExpenses - total_price_without_profite - suppliers - banks - sumCommissionPaied;

    res.status(StatusCodes.OK).json({
        message: "success",
        result: { cash, totalPayment, customersDeposites, investSum, drowingSum, sumExpenses, total_price_without_profite, suppliers, banks, sumCommissionPaied },
    });

})

module.exports = { getAllTransactions, addTransaction, updateTransaction, deleteTransaction, getTransactionsSummary, getAllSumBalanceCustomers, sumBalance, calcCash }
