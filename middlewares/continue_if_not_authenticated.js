const continue_if_not_authenticated = (req, res, next) => {
    try {
        if (!req.session.isAuthenticated) {
            next();
        } else {
            return res.redirect('/')
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

module.exports = continue_if_not_authenticated