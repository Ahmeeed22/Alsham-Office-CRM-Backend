const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const SupplierStatementAccount = require("../model/supplierStatementAccount.model");
const Supplier = require("../../supplier/model/supplier.model");

const getAllSupplierStatementAccount = catchAsyncError(async (req, res, next) => {
    var SupplierStatementAccounts = await SupplierStatementAccount.findAndCountAll()
    res.status(StatusCodes.OK).json({ message: "success", result: SupplierStatementAccounts })

})

const addSupplierStatementAccount = catchAsyncError(async (req, res, next) => {

    const { supplierId, type, amount ,desc} = req.body;
        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        // Calculate the new balance based on the account statement type
        const updatedBalance = type === 'debit' ? supplier.balance - amount : supplier.balance + amount;

        if (bankAccount.balance < amount && type === 'debit') {
            return res.status(400).json({ message: 'Insufficient balance.' });
          }

        // Update the supplier's balance
        await Supplier.update({ balance: updatedBalance }, { where: { id: supplierId } });

        // Create the account statement record
        var supplierStatementAccount = await SupplierStatementAccount.create({ supplierId, type, amount , desc });

        res.status(StatusCodes.CREATED).json({ message: "success", result: supplierStatementAccount })
        

})




module.exports = { getAllSupplierStatementAccount, addSupplierStatementAccount }