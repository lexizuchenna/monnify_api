const express = require('express')
const path = require('path')
const cors = require('cors')
const dotenv = require('dotenv')

const connectDB = require('./config/db')

// Initialize Env
dotenv.config()

// Initialize Express
const app = express()

// Connect to MongoDB
connectDB(process.env.MONGO_URI)

app.use(cors())

// Body Parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Public Folder
app.use(express.static(path.join(__dirname, "public")));

// Expres Routers
app.use('/api', require('./routes/api'))
app.use('/webhook', require('./routes/webhook'))

app.listen(process.env.PORT, () => {
  console.log(`App started in port: ${process.env.PORT}`)
})