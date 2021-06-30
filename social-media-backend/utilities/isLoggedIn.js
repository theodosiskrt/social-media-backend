module.exports  = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.send('You have to be logged in to do that.');
    }
    return next();
}