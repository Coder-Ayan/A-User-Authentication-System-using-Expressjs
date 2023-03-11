const express = require('express')
const router = express.Router()

// define the authentication page route
router.get('/', (req, res) => {
    res.render('authentication', {
        alerts: [
            {
                type: 'success',
                message: 'Hello World!'
            }
        ]
    })
})

module.exports = router