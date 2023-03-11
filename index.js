const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const authenticationRoute = require('./routes/authenticationRoute')

const app = express()
const port = 3000

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
    res.render('home')
})

// use authentication route
app.use('/authentication', authenticationRoute)

app.listen(port, () => {
    console.log(`User Authentication System listening on http://localhost:${port}`)
})