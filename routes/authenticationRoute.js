const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

// Define the register page route
router.get('/register', (req, res) => {
    let context = req.app.locals.context
    res.render('register', context)
})

// Define the register route
router.post('/register', [
    // name must be a string & at least 3 chars long
    body('name')
        .isString()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 chars long'),
    // email must be a email
    body('email')
        .isEmail(),
    // password must be a string & at least 8 chars long
    body('password')
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 chars long'),
],
    async (req, res) => {
        try {
            // Finds the validation errors in this request and wraps them in an object
            const errors = validationResult(req);
            if (errors.errors.length) {
                req.app.locals.context = {
                    alerts: errors.array().map((error) => {
                        return {
                            type: 'error',
                            message: error.msg
                        }
                    })
                }
                return res.redirect('/authentication/register');
            }


            // Check wheather the entered passwords do not match
            if (req.body['password'] !== req.body['reentered-password']) {
                req.app.locals.context = {
                    alerts: [
                        {
                            type: 'error',
                            message: "The entered passwords do not match"
                        }
                    ]
                }
                return res.redirect('/authentication/register');
            }

            // Check whether the user with the given email address exists already
            if (await User.exists({ email: req.body.email })) {
                req.app.locals.context = {
                    alerts: [
                        {
                            type: 'error',
                            message: "User already exists with the given email address"
                        }
                    ]
                }
                return res.redirect('/authentication/register')
            }

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(req.body['password'], salt);

            // Create user
            const newUser = await User.create({
                name: req.body['name'],
                email: req.body['email'],
                password: passwordHash
            });

            // const data = {
            //     user: {
            //         id: newUser._id,
            //     }
            // };

            // Generate the token
            // const token = jwt.sign(data, process.env.JWT_SECRET_KEY);

            req.app.locals.context = {
                alerts: [
                    {
                        type: 'success',
                        message: "The user has been created successfully"
                    }
                ]
            }
            return res.redirect('/dashboard');

        } catch (error) {
            console.log(error);

            req.app.locals.context = {
                alerts: [
                    {
                        type: 'error',
                        message: "Internal Server Error"
                    }
                ]
            }
            return res.redirect('/authentication/register');
        }
    });

// Define the log in page route
router.get('/login', (req, res) => {
    let context = req.app.locals.context
    res.render('login', context)
})

module.exports = router