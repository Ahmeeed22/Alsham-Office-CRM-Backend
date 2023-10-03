const { Op, Sequelize } = require("sequelize");
const { catchAsyncError } = require("../../../helpers/catchSync");
const BankAccount = require("../../banking/model/bank.model");
const TransactionAccountBanking = require("../../bankingTransactionHistory/model/bankingTransactionHistory.model");
const Owners = require("../model/owners.model");
const { StatusCodes } = require("http-status-codes");

const createOwners =catchAsyncError(async (req, res) => {
    const company_id=req.loginData?.company_id ||1
    if (req.body.accountId) {
        let bankAccount;
        bankAccount = await BankAccount.findOne({
            where: { id: req.body.accountId },
        });

        if (bankAccount && req.body.type == "drowing") {
            if (+bankAccount.balance >= (+req.body.amount)) {

                var transactionAccountBanking = await TransactionAccountBanking.create({ type: "withdraw",DESC:req.body.desc, amount: req.body.amount, accountId: req.body.accountId , empName : `${req.loginData?.name}`});
                const updatedBalance = +bankAccount.balance - (+req.body.amount);
                const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: bankAccount.id } });
                console.log("before ",);
                var ownersAcc = await Owners.create({ ...req.body, company_id });
                console.log("after", ownersAcc);
                res.status(StatusCodes.CREATED).json({ message: "success", result: ownersAcc })
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid bank account or Insufficient balance." })
            }

        }else if(bankAccount && req.body.type == "invest" ){
            var transactionAccountBanking = await TransactionAccountBanking.create({ type: "deposit", amount: req.body.amount,DESC:req.body.desc, accountId: req.body.accountId , empName : `${req.loginData?.name}`});
            const updatedBalance = +bankAccount.balance + (+req.body.amount);
            const updateBankAccount = await BankAccount.update({ balance: updatedBalance }, { where: { id: bankAccount.id } });
            var ownersAcc = await Owners.create({ ...req.body, company_id });
            res.status(StatusCodes.CREATED).json({ message: "success", result: ownersAcc })
        }
    } else {
        var ownersAcc = await Owners.create({ ...req.body, company_id });
        res.status(StatusCodes.CREATED).json({ message: "success", result: ownersAcc })
    }

})  ;

const getAllOwners = catchAsyncError(async (req, res, next) => {
    const indexInputs = req.body;
    const filterObj = {
        where: {},
        limit: indexInputs.limit || 10,
    }
    if (indexInputs.offset) {
        filterObj['offset'] = indexInputs.offset * filterObj.limit;
    }

    filterObj.where['company_id'] = req.loginData?.company_id || 1;
    filterObj['order'] = [
        [indexInputs?.orderBy?.coulmn || 'createdAt', indexInputs?.orderBy?.type || 'DESC'],
    ];
    if (indexInputs.type != undefined) {
        filterObj.where.type = indexInputs.type;
    }
    if (indexInputs.desc) {
        filterObj.where.desc = indexInputs.desc;
    };

    var startDate = indexInputs.startDate ? new Date(indexInputs.startDate) : new Date("2010-01-01");
    let date = new Date(indexInputs.endDate);
    var endDate = indexInputs.endDate ? date.setHours(date.getHours() + 24) : new Date();

    if (indexInputs.startDate || indexInputs.endDate) {
        filterObj.where.createdAt = {
            [Op.between]: [startDate, endDate]
        }
    };
    if (indexInputs.active === true || indexInputs.active === false) {
        filterObj.where.active = indexInputs.active;
    };

    var ownersTransactions = await Owners.findAndCountAll({ ...filterObj });
    var ownersTransactionSum = await Owners.findAll({
        ...filterObj,
        attributes: [
            [Sequelize.fn('sum', Sequelize.col('amount')), 'totalAmount']
        ]
    });

    // Extract the sum from the result
    const sum = ownersTransactionSum[0]?.dataValues?.totalAmount || 0;

    res.status(StatusCodes.OK).json({ message: "success", result: { ownersTransactions, sum } });
});


module.exports ={createOwners ,getAllOwners}  ;