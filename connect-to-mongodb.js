const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', true)

const URI = `${process.env.DATABASE_HOST}/user-authentication-system`

const connectToMongoDB = () => {
    mongoose.connect(URI)
        .then(() => console.log('Connected to MongoDB successfully!'))
}

module.exports = connectToMongoDB;