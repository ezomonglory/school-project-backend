const mongoose = require('mongoose')
const Schema = mongoose.Schema


const courseSchema = new Schema({
    course_title:{
        type:String,
        required:true,              
    },
    course_code:{
        type:String,
        required:true,               
    },
   

   lecturers:{
        type:[],
        required:true,           
    },

    students:{
        type:[],
        require:true
    }
})


// middlesware created by mongoose it is fired before saving the doc



const Course = mongoose.model('course',courseSchema)

module.exports = Course