const continue_if_authenticated = (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            next();
        } else {
            // Create the context
            req.app.locals.context = {
                alerts: [
                    {
                        type: 'info',
                        message: "You have to login to continue..."
                    }
                ]
            }
            return res.redirect('/authentication/login')
        }
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
}

module.exports = continue_if_authenticated