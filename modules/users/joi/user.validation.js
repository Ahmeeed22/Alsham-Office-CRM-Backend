const Joi = require("joi");

module.exports = {
    addUserSchema:{
        body:Joi.object().required().keys({
            name : Joi.string().min(3).required().messages({
                "string.empty":"sorry ...name is required"
            }),
            email : Joi.string().email().required().messages({
                "string.email":"sorry ...please enter valid email"
            }),
            password :Joi.string().min(6).required(),
            role : Joi.number().default(1),
            company_id:Joi.number().min(0)
        })
    },
    loginSchema : {
        body:Joi.object().required().keys({
            email : Joi.string().email().required(),
            password :Joi.string().required()
        })
    },
    updateUserSchema:{
        params: Joi.object().required().keys({
            id : Joi.number().required()
        }),
        body:Joi.object().required().keys({
            name : Joi.string().min(3).messages({
                "string.empty":"sorry ...name is required"
            }),
            email : Joi.string().email().messages({
                "string.email":"sorry ...please enter valid email"
            }),
            password :Joi.string().min(6),
            role : Joi.number().default(1),
            company_id:Joi.number().required().min(0)
        }).min(1)
    }
}