const express = require("express")
const router = express.Router()
const createError = require('http-errors')
const ShortUniqueId = require("short-unique-id")
const Session = require("../Model/Session.js")

const uid = new ShortUniqueId({ length: 10 });

router.post("/generate-qrCode", async (req, res, next) => {
    try {
        const resu = await req.body

        const session = new Session({
            course_id: resu.course_id, lecturer_id: resu.lecturer_id, course_code: resu.course_code, course_title: resu.course_title, lecturer_name: resu.lecturer_name, timeStamp: Date.now(), qrCode: uid.rnd(), attendance: []
        })
        const savedUser = await session.save()

        res.send(savedUser)


    } catch (error) {
        next(error)
    }
})

router.get("/get-session/:id", async (req, res, next)=> {
    try {
        const {id} = req.params      
        console.log(id)  
        const session = await Session.find({course_code: id})
        if(session){
            res.send(session)
        }
    } catch (error) {
        next(error)
    }
})



router.post("/scan-qrCode", async (req, res, next) => {
    try {
        const resu = await req.body
        const session = await Session.find({ qrCode: resu.qrCode })
        res.send(session)
    } catch (err) {
        next(err)
    }
})



router.post("/sign-qrCode", async (req, res, next) => {
    try {
        const resu = await req.body

        const session = await Session.find({ qrCode: resu.qrCode })
        


        session[0].attendance.push({
            name: resu.full_name,
            matric_number: resu.matric_number
        })

        const savedsession = await session[0].save()
        res.send(savedsession)
    } catch (err) {
        next(err)
    }
})




router.get("/get-attendance/:qrCode", async(req, res, next)=> {
    try {
        const resu =  req.params

        const session = await Session.find({ qrCode: resu.qrCode })
                
        const attendance = session[0].attendance
        res.send(attendance)
    } catch (error) {
        next(error)
    }
})











module.exports = router