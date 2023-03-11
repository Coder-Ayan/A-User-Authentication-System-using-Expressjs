const express = require('express')
const nunjucks = require('nunjucks')

const app = express()
const port = 3000

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.get('/', (req, res) => {
    res.render('index.njk')
})

app.listen(port, () => {
    console.log(`User Authentication System listening on http://localhost:${port}`)
})