function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        req.session.error = 'You must be logged in to view this page.';
        return res.redirect('/signin');
    }
}

module.exports = { isAuthenticated };