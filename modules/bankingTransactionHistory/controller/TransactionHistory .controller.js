const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const TransactionAccountBanking = require("../model/bankingTransactionHistory.model");
const BankAccount = require("../../banking/model/bank.model");

const getAllTransactionHistory =catchAsyncError(async(req,res,next)=>{
        var TransactionAccountBankings=await TransactionAccountBanking.findAndCountAll()
        res.status(StatusCodes.OK).json({message:"success",result:TransactionAccountBankings})

})

const addTransactionHistory=catchAsyncError(async (req,res,next)=>{

        const {type, accountId ,amount , DESC}=req.body

        const bankAccount = await BankAccount.findOne({
            where: { id:accountId },
          });
      
          if (!bankAccount) {
            return res.status(404).json({ message: 'Account not found.' });
          }
      
          let updatedBalance;
      
          if (type === 'deposit') {
            updatedBalance = bankAccount.balance + amount;
          } else if (type === 'withdraw') {
            if (bankAccount.balance < amount) {
              return res.status(400).json({ message: 'Insufficient balance.' });
            }
            updatedBalance = bankAccount.balance - amount;
          } else {
            return res.status(400).json({ message: 'Invalid transaction type.' });
          }
      
          // Update the bank account balance
          await BankAccount.update({ balance: updatedBalance }, { where: { id: bankAccount.id } });
      
          // Create a transaction history record
          await TransactionAccountBanking.create({
            accountId: bankAccount.id,
            type,
            amount,
            DESC
          });
      
          res.status(StatusCodes.CREATED).json({ message: `${type} successful.`, balance: updatedBalance });
})




module.exports={getAllTransactionHistory , addTransactionHistory }