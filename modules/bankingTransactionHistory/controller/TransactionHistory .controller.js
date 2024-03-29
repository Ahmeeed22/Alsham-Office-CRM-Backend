const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const TransactionAccountBanking = require("../model/bankingTransactionHistory.model");
const BankAccount = require("../../banking/model/bank.model");

const getAllTransactionHistory =catchAsyncError(async(req,res,next)=>{
        var TransactionAccountBankings=await TransactionAccountBanking.findAndCountAll({
          order: [['createdAt', 'DESC']], // Order by the 'createdAt' column in descending order
        })
        res.status(StatusCodes.OK).json({message:"success",result:TransactionAccountBankings})

})

const addTransactionHistory=catchAsyncError(async (req,res,next)=>{

        const {type, accountIdCreditor , accountIdDebitor ,amount , DESC}=req.body

        const bankAccountCr = await BankAccount.findOne({
          where: { id:accountIdCreditor },
        });
         const bankAccountDr = await BankAccount.findOne({
          where: { id:accountIdDebitor },
        });
      
          if (!bankAccountCr || !bankAccountDr) {
            return res.status(404).json({ message: 'Account not found.' });
          }
          if (bankAccountCr.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance.' });
          }
      
          let updatedBalanceCr = bankAccountCr.balance - amount;
          let updatedBalanceDr = bankAccountDr.balance + amount;

      
          // Update the bank account balance
          await BankAccount.update({ balance: updatedBalanceCr }, { where: { id: bankAccountCr.id } });
          await BankAccount.update({ balance: updatedBalanceDr }, { where: { id: bankAccountDr.id } });
      
          // Create a transaction history record
          await TransactionAccountBanking.create({
            accountId: bankAccountCr.id,
            type : 'withdraw',
            amount,
            DESC
            ,empName : `${req.loginData?.name}`
          }); 
          // Create a transaction history record
          await TransactionAccountBanking.create({
          accountId: bankAccountDr.id,
          type : 'deposit',
          amount,
          DESC
          ,empName : `${req.loginData?.name}`
        });

          res.status(StatusCodes.CREATED).json({ message: `${type} successful.` });
})




module.exports={getAllTransactionHistory , addTransactionHistory }