module.exports  = (req, res, next) => {
    if (!req.user) {
        return res.send('You have to be logged in to do that.');
    }
    return next();
}