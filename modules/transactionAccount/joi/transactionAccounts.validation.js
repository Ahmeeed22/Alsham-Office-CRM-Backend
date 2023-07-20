const Joi = require("joi");

module.exports = {
    addHistoryTransactionsSchema:{
        body:Joi.object().required().keys({
            company_id : Joi.number().min(1).required() ,
            amount : Joi.number().min(0).required()
        })
    },
    updateHistoryTransactionsSchema:{
        body:Joi.object().required().keys({
            company_id : Joi.number().min(1) ,
            amount : Joi.number().min(0).required()
        }).min(1)
    }
}