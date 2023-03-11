const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')

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

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/authentication', (req, res) => {
    res.render('authentication', {
        alerts: [
            {
                type: 'success',
                message: 'Hello World!'
            }
        ]
    })
})

app.listen(port, () => {
    console.log(`User Authentication System listening on http://localhost:${port}`)
})