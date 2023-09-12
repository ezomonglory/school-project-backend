const joi = require("@hapi/joi")

const RegistrationSchema = joi.object({
    full_name: joi.string().required(),
    identity_number:joi.string().required(),
    role:joi.string().required(),
    password: joi.string().min(2).required()
})


const LoginSchema = joi.object({
    identity_number:joi.string().required(),    
    password: joi.string().min(2).required()
})


module.exports = {
    RegistrationSchema,
    LoginSchema
}