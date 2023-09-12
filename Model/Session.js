const mongoose = require('mongoose')
const Schema = mongoose.Schema


const sessionSchema = new Schema({
    course_title: {
        type: String,
        required: true,
    },
    course_code: {
        type: String,
        required: true,
    },
    course_id: {
        type: String,
        required: true,
    },

    lecturer_id: {
        type: String,
        required: true,
    },


    lecturer_name: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: String,
        required: true,
    },

    qrCode: {
        type: String,
        required: true,
    },
    attendance: {
        type: [],
        required: true,
    }

})


// middlesware created by mongoose it is fired before saving the doc



const Session = mongoose.model('session', sessionSchema)

module.exports = Session