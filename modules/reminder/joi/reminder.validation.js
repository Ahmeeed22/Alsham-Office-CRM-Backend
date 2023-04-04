const Joi = require("joi");

module.exports = {
    addReminderSchema:{
        body:Joi.object().required().keys({
            companyName : Joi.string().required(),
            sponsored : Joi.string().required(),
            message : Joi.string().required(),
            status : Joi.string().required(),
            service_id : Joi.number(),
            dateExpire : Joi.date().iso()
        })
    },
    deleteReminderSchema:{
        params: Joi.object().required().keys({
            id : Joi.number().required()
        }),
    }  
    ,
    updateReminderSchema:{
        params: Joi.object().required().keys({
            id : Joi.number().required()
        }),
        body:Joi.object().required().keys({
            companyName : Joi.string(),
            sponsored : Joi.string(),
            message : Joi.string(),
            status : Joi.string(),
            service_id : Joi.number(),
            dateExpire : Joi.date().iso()
        }).min(1)
    },
    getAllReminder:{
        body:Joi.object().required().keys({
            limit : Joi.number().min(1).max(1000).default(10),
            offset : Joi.number().min(0),
            companyName : Joi.string(),
            dateExpire : Joi.date().iso(),
            endExpire : Joi.date().iso() 
        }).min(1)
    },
    }

    