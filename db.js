const mongoose = require('mongoose');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

mongoose.set('strictQuery', true)

const URI = `${process.env.DATABASE_HOST}/user-authentication-system`

const connectToMongoDB = () => {
    mongoose.connect(URI)
        .then(() => console.log('Connected to MongoDB successfully!'))
}

const createSessionStore = () => {
    const store = new MongoDBStore({
        uri: URI,
        collection: 'user_sessions'
    });

    // Catch errors
    store.on('error', function (error) {
        console.log(error);
    });

    return store
}

module.exports = { connectToMongoDB, createSessionStore };