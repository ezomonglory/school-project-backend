const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL, {
    dbName:process.env.DB_NAME,   
}).then(()=> {
    console.log("mongodb connected")
}).catch((err)=> {
    console.log(err.message)
})

mongoose.connection.on('connected', ()=> {
    console.log("mongoose connected to db")

})

mongoose.connection.on('error', (err)=> {
    console.log(err.message)
})

mongoose.connection.on('diconnected', ()=> {
    console.log("mongoose diconnected to db")

}) 


process.on('SIGINT', async ()=> {
await mongoose.connection.close()
process.exit(0);
})