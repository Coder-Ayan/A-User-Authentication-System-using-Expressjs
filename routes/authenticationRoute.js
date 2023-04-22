const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
require('dotenv').config();
// Models
const User = require('../models/User');
//Middlewares
const continue_if_authenticated = require('../middlewares/continue_if_authenticated')
const continue_if_not_authenticated = require('../middlewares/continue_if_not_authenticated')

const sendverificationEmail = async (user) => {
    let config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
        theme: "salted",
        product: {
            name: "Express User Authentication System",
            link: 'http://localhost:3000'
        }
    })

    let email = {
        body: {
            name: user.name,
            intro: "Thanks for signing up for Express User Authentication System. We\'re very excited to have you on board",
            action: {
                instructions: 'To access your dashboard, please confirm your account below:',
                button: {
                    color: '#22BC66',
                    text: 'Verify your account',
                    link: `http://localhost:3000/authentication/verify?userId=${user.id}`
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we\'d love to help."
        }
    }

    let emailBody = MailGenerator.generate(email);

    let message = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Verify your email address",
        html: emailBody
    }

    // Send the email
    await transporter.sendMail(message)
}

// Define the register route
router.get('/register', continue_if_not_authenticated, (req, res) => {
    let context = req.app.locals.context
    req.app.locals.context = {}
    isAuthenticated = req.session.body
    return res.render('register', context)
})
    .post('/register', continue_if_not_authenticated, [
        // name must be a string & at least 3 chars long
        body('name')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Name must be at least 3 chars long'),
        // email must be a email
        body('email')
            .isEmail()
            .exists()
            .withMessage('Email is required'),
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
                if (!errors.isEmpty()) {
                    // Create the context
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
                    // Create the context
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
                    // Create the context
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
                const user = await User.create({
                    name: req.body['name'],
                    email: req.body['email'],
                    password: passwordHash
                });

                // Set the session
                req.session.isAuthenticated = true;
                req.session.user = { name: user.name, email: user.email };

                sendverificationEmail(user)

                // Create the context
                req.app.locals.context = {
                    alerts: [
                        {
                            type: 'success',
                            message: "Please verify your email address. verification email is sent to your email address"
                        }
                    ]
                }


                return res.redirect('/');

            } catch (error) {
                console.log(error);

                // Create the context
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

// Define the login route
router.get('/login', continue_if_not_authenticated, (req, res) => {
    let context = req.app.locals.context
    req.app.locals.context = {}
    return res.render('login', context)
})
    .post('/login', continue_if_not_authenticated, [
        // email must exist & must be a email
        body('email')
            .isEmail()
            .exists()
            .withMessage('Email is required'),
        // password must exist & must be a string 
        body('password')
            .isString()
            .exists()
            .withMessage('Password is required')
    ],
        async (req, res) => {
            try {
                // Finds the validation errors in this request and wraps them in an object
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    // Create the context
                    req.app.locals.context = {
                        alerts: errors.array().map((error) => {
                            return {
                                type: 'error',
                                message: error.msg
                            }
                        })
                    }
                    return res.redirect('/authentication/login');
                }

                const user = await User.findOne({ email: req.body['email'] });

                // Check whether the user with the given email exists or not
                if (!user) {
                    // Create the context
                    req.app.locals.context = {
                        alerts: [
                            {
                                type: 'error',
                                message: "Invalid credentials"
                            }
                        ]
                    }
                    return res.redirect('/authentication/login');
                }

                // Check whether the password with the given password matches or not
                const passwordCompare = await bcrypt.compare(req.body['password'], user.password);
                if (!passwordCompare) {
                    // Create the context
                    req.app.locals.context = {
                        alerts: [
                            {
                                type: 'error',
                                message: "Invalid credentials"
                            }
                        ]
                    }
                    return res.redirect('/authentication/login');
                }

                // Set the session
                req.session.isAuthenticated = true;
                req.session.user = { name: user.name, email: user.email };

                // Create the context
                req.app.locals.context = {
                    alerts: [
                        {
                            type: 'success',
                            message: "You have logged in successfully"
                        }
                    ]
                }

                return res.redirect('/dashboard');

            } catch (error) {
                console.log(error);

                // Create the context
                req.app.locals.context = {
                    alerts: [
                        {
                            type: 'error',
                            message: "Internal Server Error"
                        }
                    ]
                }
                return res.redirect('/authentication/login');
            }
        });


// Define the logout route
router.get('/logout', continue_if_authenticated, (req, res) => {
    try {
        req.session.destroy();

        // Create the context
        req.app.locals.context = {
            alerts: [
                {
                    type: 'success',
                    message: "You have logged out successfully"
                }
            ]
        }

        return res.redirect('/');
    } catch (error) {
        console.log(error);

        // Create the context
        req.app.locals.context = {
            alerts: [
                {
                    type: 'error',
                    message: "Internal Server Error"
                }
            ]
        }
        return res.redirect('/');
    }
})

// Define the verify route
router.get('/verify', async (req, res) => {
    try {
        let userId = req.query['userId']
        let user = await User.findById(userId);



        if (!user) {
            // Create the context
            req.app.locals.context = {
                alerts: [
                    {
                        type: 'error',
                        message: "Failed to verify email address as no user with the email address exists"
                    }
                ]
            }
            return res.redirect('/');
        }

        await User.updateOne(user, { isVerified: true })

        // Create the context
        req.app.locals.context = {
            alerts: [
                {
                    type: 'success',
                    message: "Your email address is verified successfully"
                }
            ]
        }

        return res.redirect('/');

    } catch (error) {
        console.log(error);

        // Create the context
        req.app.locals.context = {
            alerts: [
                {
                    type: 'error',
                    message: "Internal Server Error"
                }
            ]
        }
        return res.redirect('/');
    }
})

module.exports = router