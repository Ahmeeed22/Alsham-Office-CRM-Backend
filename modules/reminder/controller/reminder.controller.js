const Reminder = require("../model/reminder.model");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../../../helpers/AppError");
const { catchAsyncError } = require("../../../helpers/catchSync");
const { Op } = require("sequelize");
const Service = require("../../services/model/service.model");
const User = require("../../users/model/user.model");

const getAllReminders = catchAsyncError(async (req, res, next) => {
    const indexInputs = req.body;
    // console.log(indexInputs);
    const filterObj = {
        where: {},
        // limit: indexInputs.limit || 10,
    }
    if (indexInputs.offset) {
        filterObj['offset'] = indexInputs.offset * filterObj.limit;
    }
    filterObj['order'] = [
        [indexInputs?.orderBy?.coulmn || 'dateExpire', indexInputs?.orderBy?.type || 'ASC'],
    ];
    var dateExpire=indexInputs?.dateExpire ? new Date(indexInputs?.dateExpire) : new Date();

    var date2=new Date()
    if (!indexInputs?.dateExpire) {
        date2.setDate(date2.getDate() + 10);
        dateExpire.setDate(dateExpire.getDate() + 10);
    }
    filterObj.where["dateExpire"] ={
            [Op.between] : [dateExpire , dateExpire]
    }
    if (dateExpire.getFullYear() === date2.getFullYear()
        && dateExpire.getMonth() === date2.getMonth()
        && dateExpire.getDate() === date2.getDate()) {
        console.log('The two dates are on the same day.');
        var oldDate=new Date("2010-12-12 00:00:00")
            await Reminder.update({ status:'pending' }, { where:
                {
            dateExpire: {
                [Op.between]: [oldDate, dateExpire],
                        }
            }
            });
        } else {
            console.log('The two dates are not on the same day.');
        }
    var oldDate=indexInputs?.endExpire ? new Date(indexInputs?.endExpire) :new Date("2100-12-12 00:00:00");   
    if (indexInputs?.endExpire || indexInputs?.dateExpire || indexInputs?.companyName) {
        var filter={}

        if(indexInputs?.dateExpire) filter.dateExpire = { [Op.between]: [ dateExpire,oldDate]  }

        if (indexInputs?.companyName) {
            filter.companyName ={
                [Op.like] :`%${indexInputs.companyName}%`
           }   
        }
        filter.company_id=req.loginData.company_id ;
        filterObj.where=filter
    } else {
        filterObj.where={ [Op.or]:[ 
            {dateExpire: { [Op.between]: [ dateExpire,dateExpire]  }},
            {status : 'pending'}
                        ],company_id:req.loginData.company_id}
    }    
    

    const updatedReminders = await Reminder.findAndCountAll({
        ...filterObj
        ,include:[{model:Service,attributes: ['name', "id"]},{model:User,attributes:['name']}]
    });  

    res.status(StatusCodes.OK).json({ message: "success", result:updatedReminders })
})

// add reminder controller
const addReminder=catchAsyncError(async (req,res,next)=>{ 
            console.log(req.loginData.id);
            var reminder = await Reminder.create({...req.body,admin_id:req.loginData.id,company_id:req.loginData.company_id});
            res.status(StatusCodes.CREATED).json({message:"success",result:reminder})
})

// update reminder controller
const updateReminder=catchAsyncError( async(req, res , next)=>{
    const {id} =req.params ;
    var {message,dateExpire}=req.body ;
    const oldReminder=await Reminder.findOne({where:{id}})
    if (oldReminder) {
        dateExpire=new Date(dateExpire);
        // const oldExpireDate=new Date(oldReminder.dateExpire)
        // if (!(dateExpire.getFullYear() === oldExpireDate.getFullYear()
        // && dateExpire.getMonth() === oldExpireDate.getMonth()
        // && dateExpire.getDate() === oldExpireDate.getDate())) {
        //     console.log('The two dates are on NOT the same day.'); 
        //     await Reminder.update({ status:'new' }, { where:{ id} });
        // } 

        var reminderUpdated =await Reminder.update({message,dateExpire,status:'new',admin_id:req.loginData.id},{where:{id}}) ;
        res.status(StatusCodes.OK).json({message:"success",result:reminderUpdated})
    }else{
        res.status(StatusCodes.BAD_REQUEST).json({message:"reminder is not exit"}) 
    }
})

// delete reminder controller
const deleteReminder=catchAsyncError(async(req,res,next)=>{
            let id=req.params.id
            var reminderX=await Reminder.findOne({where:{id}})
            if (!reminderX)
                next(new AppError('this id not exist ',400))
            await Reminder.destroy({
                where :{
                    id
                },
            })
            res.status(StatusCodes.OK).json({message:"deleted success"})
    })

module.exports = { getAllReminders , addReminder , updateReminder , deleteReminder}