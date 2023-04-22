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
// Models
const User = require('./models/User')


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
    resave: true,
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


app.use('/*', (req, res, next) => {
    req.app.locals.context = {
        ...req.app.locals.context,
        isAuthenticated: req.session.isAuthenticated ? true : false
    }
    next()
})

// define the home page route
app.get('/', (req, res) => {
    let context = req.app.locals.context
    req.app.locals.context = {}
    return res.render('home', context)
})

// define the dashboard page route
app.get('/dashboard', continue_if_authenticated, async (req, res) => {
    let user = await User.findOne(req.session.user)
    let isUserVerified = user.isVerified

    if (isUserVerified) {
        let context = { ...req.app.locals.context, user: req.session.user }
        req.app.locals.context = {}
        return res.render('dashboard', context)
    } else {
        // Create the context
        req.app.locals.context = {
            alerts: [
                {
                    type: 'info',
                    message: "Please verify your email address to access the dashboard"
                }
            ]
        }

        return res.redirect('/');
    }
})

// use authentication route
app.use('/authentication', authenticationRoute)

app.listen(port, () => {
    console.log(`User Authentication System listening on http://localhost:${port}`)
})