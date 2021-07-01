const express = require('express');
const user = require('../models/user.js');
const passport = require('passport');
const friendRequestRoutes = require('./friendRequests');
const isLoggedIn = require('../utilities/isLoggedIn')

const router = express.Router()

//Friend Requests Routes.
router.use('/friends', friendRequestRoutes);

//Checks if you are logged in, returns user if you are.
router.get('/', (req, res) => {
    if(req.user) return res.send(req.user)
    return res.send(`You are not logged in.`)
})

//Registers a new user, returns the new user if the registration was successful.
router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        const newUser = new user({username});
        //Creates hashed user using the function "register()" that passport provides.
        const hashedUser = await user.register(newUser, password);
        //Logs in user after registration so you are logged in immedeatly after registering.
        req.login(hashedUser, err => {
            if (err) return res.send("Error, couldn't login.");
            return res.send(req.user);
        })
    }
    catch{
        res.send("Registration failed.");
    }
})
router.get('/register', (req, res) => {
    res.render('user/register');
})

//Logs you in, returns the user that you logged in as.
router.post('/login', passport.authenticate('local', { failureRedirect: '/posts' }),  (req, res) => {
    res.send(req.user);
})
router.get('/login', (req, res) => {
    res.render('user/login')
})

//Logs out.
router.get('/logout', (req, res) => {
    req.logout();
    res.send("Logged out successfully");
})

//Deletes user.
router.delete('/', isLoggedIn,  async(req, res) => {
    const toDeleteUser = await user.findById(req.user._id).populate('friends');
    //Updates deleted users frined array so it doens containe a deleted user.
    toDeleteUser.friends.map((friend) => {
        friend.friends = friend.friends.filter((friend) => friend.toString() !== toDeleteUser._id.toString())
        friend.save();
    })
    //Deletes user
    await user.findByIdAndDelete(req.user._id);
    req.logout();
    res.send("Account deleted.")
})


module.exports = router;