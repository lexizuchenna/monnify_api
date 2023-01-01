const mongoose = require('mongoose')
mongoose.set('strictQuery', true)

const connectDB = async (mongoURI) => {
    try {
        const conn = await mongoose.connect(mongoURI)
        console.log(`MongoDB Connected`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB