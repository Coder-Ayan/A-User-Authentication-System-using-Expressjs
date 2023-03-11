const express = require('express')
const router = express.Router()

// define the authentication page route
router.get('/', (req, res) => {
    res.render('authentication', {
        alerts: req.alerts
    })
    console.log(req)
})

module.exports = router