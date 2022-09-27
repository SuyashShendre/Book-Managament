const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require('./routes/route.js') 

app.use(express.json())

mongoose.connect("mongodb+srv://root:1234@suyashshendre.wfinbwt.mongodb.net/bookmanagement?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then(() => console.log("MongoDb Connected"))
.catch(err => console.log(err))

app.use('/', route)

app.listen(3000, () => {
    console.log("Server Started At " + 3000)
})