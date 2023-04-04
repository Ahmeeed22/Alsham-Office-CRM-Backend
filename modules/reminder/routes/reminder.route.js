const isAuth = require('../../../common/middleare/isAuth')
const validationRequest = require('../../../common/middleare/validationRequest')
const { getAllReminders, addReminder, updateReminder, deleteReminder } = require('../controller/reminder.controller')
const { getAllReminder, addReminderSchema, updateReminderSchema } = require('../joi/reminder.validation')
const remindersRoutes=require('express').Router()

remindersRoutes.post('/allReminders',isAuth('ALL'),validationRequest(getAllReminder),getAllReminders) 
remindersRoutes.post('/addReminder',isAuth('ALL'),validationRequest(addReminderSchema),addReminder)
remindersRoutes.put('/updateReminder/:id',isAuth('ALL'),validationRequest(updateReminderSchema),updateReminder)
remindersRoutes.delete('/deleteReminder/:id',isAuth('ALL'),deleteReminder)
// remindersRoutes.patch('/deleteTransactionSoft/:id',isAuth('ALL'),deleteTransaction)
// remindersRoutes.get('/searchTransaction',searchTransactions)

module.exports=remindersRoutes;