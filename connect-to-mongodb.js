const mongoose = require('mongoose');
mongoose.set('strictQuery', true)

const URI = "mongodb://127.0.0.1:27017/user-authentication-system"

const connectToMongoDB = () => {
    mongoose.connect(URI)
        .then(() => console.log('Connected to MongoDB successfully!'))
}

module.exports = connectToMongoDB;