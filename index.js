const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const db = require('./db')
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()
// Routes
const authenticationRoute = require('./routes/authenticationRoute')
//Middlewares
const continue_if_authenticated = require('./middlewares/continue_if_authenticated')


const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
db.connectToMongoDB()

// Create mongoDB session store
const store = db.createSessionStore()

// Set up for session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        httpOnly: true,
        // secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        sameSite: true
    }
}))

// Add Static
app.use('/static', express.static(path.join(__dirname, 'public')))

// Set View Engine
app.set('view engine', 'njk')

// Configure Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
})

// define the home page route
app.get('/', (req, res) => {
    let context = req.app.locals.context
    req.app.locals.context = []
    return res.render('home', context)
})

// define the dashboard page route
app.get('/dashboard', continue_if_authenticated, (req, res) => {
    let context = { ...req.app.locals.context, user: req.session.user }
    req.app.locals.context = []
    return res.render('dashboard', context)
})

// use authentication route
app.use('/authentication', authenticationRoute)

app.listen(port, () => {
    console.log(`User Authentication System listening on http://localhost:${port}`)
})