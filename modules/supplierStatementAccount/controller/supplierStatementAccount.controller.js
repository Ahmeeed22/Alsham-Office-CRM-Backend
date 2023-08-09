const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const SupplierStatementAccount = require("../model/supplierStatementAccount.model");
const Supplier = require("../../supplier/model/supplier.model");
const BankAccount = require("../../banking/model/bank.model");
const TransactionAccountBanking = require("../../bankingTransactionHistory/model/bankingTransactionHistory.model");


const getAllSupplierStatementAccount = catchAsyncError(async (req, res, next) => {
    var SupplierStatementAccounts = await SupplierStatementAccount.findAndCountAll({
      order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
    })
    res.status(StatusCodes.OK).json({ message: "success", result: SupplierStatementAccounts })

})

const addSupplierStatementAccount = catchAsyncError(async (req, res, next) => {

    const { supplierId, type, amount ,desc,bankId} = req.body;
        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        // Calculate the new balance based on the account statement type
        const updatedBalance = type === 'debit' ? supplier.balance - amount : supplier.balance + amount;

        if (supplier.balance < amount && type === 'debit') {
            return res.status(400).json({ message: 'Insufficient balance.' });
          }

          if (bankId && type === 'credit' ) {
            const bank= await BankAccount.findByPk(bankId)
            if (!bank || bank.balance < amount) {
                return res.status(404).json({ message: 'Account not found or Insufficient balance.' });
              }else{
                var updatedBalanceBank = bank.balance - amount;
                await BankAccount.update({ balance: updatedBalanceBank }, { where: { id: bankId } });
                await TransactionAccountBanking.create({
                    accountId: bankId,
                    type : 'withdraw',
                    amount ,
                    DESC : req.body?.desc
                    ,empName : `${req.loginData?.name}`
                  });
              }
          }

        // Update the supplier's balance
        await Supplier.update({ balance: updatedBalance }, { where: { id: supplierId } });

        // Create the account statement record
        var supplierStatementAccount = await SupplierStatementAccount.create({ supplierId, type, amount , desc ,empName : `${req.loginData?.name}`});

        res.status(StatusCodes.CREATED).json({ message: "success", result: supplierStatementAccount })
        

})




module.exports = { getAllSupplierStatementAccount, addSupplierStatementAccount }