const express = require("express")
const morgan = require("morgan")
const createError = require('http-errors')
require("dotenv").config()
const AuthRoute = require("./Route/AuthRoute")
const Course = require("./Route/Course")
const Session = require("./Route/Session")
require("./helpers/init_mongodb")



const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/auth", AuthRoute)
app.use("/course", Course)
app.use("/session", Session)



app.use(async (req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

app.listen(3000, () => {
    console.log("listening on port 3000")
})