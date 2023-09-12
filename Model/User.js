const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')


const userSchema = new Schema({
    full_name:{
        type:String,
        required:true,
        lowercase:true,        
    },
    role:{
        type:String,
        required:true,
        lowercase:true,        
    },

    identity_number:{
        type:String,
        required:true,
        lowercase:true,     
    },

    password:{
        type:String,
        require:true
    }
})


// middlesware created by mongoose it is fired before saving the doc
userSchema.pre("save", async function  (next) {
    try{
        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(this.password, salt)
        this.password = hashpassword
        next()
    }catch(err){
        next(err)
    }
})

userSchema.methods.isValidPassword = async function(password){
    try{
        return await bcrypt.compare(password, this.password)
    }catch(err){
        throw err
    }
}

const User = mongoose.model('user', userSchema)

module.exports = User