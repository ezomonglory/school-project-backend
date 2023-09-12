const express = require("express")
const router = express.Router()
const createError = require('http-errors')
const { RegistrationSchema, LoginSchema } = require("../helpers/validation_schema.js")
const User = require("../Model/User.js")


router.post("/register", async (req, res, next) => {
    try {
        const resu = await RegistrationSchema.validateAsync(req.body)
    

        // if (!resu.email || !resu.password) throw createError.BadRequest()

        const result = await User.findOne({ identity_number: resu.identity_number })

        if (result) {
            throw createError.Conflict(`${resu.identity_number} is already been registered`)
        }

        const user = new User({ full_name: resu.full_name, identity_number:resu.identity_number, role:resu.role, password:resu.password
         })
        const savedUser = await user.save()
    

        res.send(savedUser)


    } catch (error) {        
        next(error)
    }
})



router.post("/login", async (req, res, next) => {
    try {
        const resu = await LoginSchema.validateAsync(req.body)
        // const {email, password} = req.body
        // console.log(email, password)

        // if(!resu.email || !resu.password) throw createError.BadRequest()

        const user = await User.findOne({ identity_number: resu.identity_number })

        if (!user) {
            throw createError.NotFound(`User not registered`)
        }

        const isMatch = user.isValidPassword(resu.password)
        if (!isMatch) throw createError.Unauthorized("Username/Password not valid")

        res.send({
            message:"login Successfull"
        })



    } catch (error) {        
        next(error)
    }
})


















module.exports = router