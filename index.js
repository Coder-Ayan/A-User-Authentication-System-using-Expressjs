const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const connectToMongoDB = require('./connect-to-mongodb')
const bodyParser = require('body-parser');
// Routes
const authenticationRoute = require('./routes/authenticationRoute')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectToMongoDB()

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
    res.render('home', context)
})

// define the dashboard page route
app.get('/dashboard', (req, res) => {
    // TODO: show the dashboard page if the user is logged in
    let context = req.app.locals.context
    res.render('dashboard', context)
})

// use authentication route
app.use('/authentication', authenticationRoute)

app.listen(port, () => {
    console.log(`User Authentication System listening on http://localhost:${port}`)
})