const express = require('express');
const user = require('../models/user');
const friendRequest = require('../models/friendRequest')
const isLoggedIn = require('../utilities/isLoggedIn')

const router = express.Router();

//Returns every friend you have.
router.get('/', isLoggedIn, async (req, res) => {
    const currUser = await user.findById(req.user._id).populate('friends');
    res.render('user/friends/friends', {friends:currUser.friends});
})

//Returns every friend request you have recieved.
router.get('/requests', isLoggedIn, async (req, res) => {
    const currUser = await user.findById(req.user._id).populate({
        path: 'friendRequests',
        populate:{
            path:'from',
            model:'User'
        }
    });
    await currUser.populate({
        path: 'friendRequests',
        populate:{
            path:'to',
            model:'User'
        }
    })
    res.render('user/friends/requests', {requests: currUser.friendRequests});
})

//Accepts request, returns the user that sent the invite.
router.post('/requests/:id/accept', isLoggedIn, async(req, res) => {
    try{
        const {id} = req.params;
        const fRequest = await friendRequest.findById(id);
        const fromUser = await user.findById(fRequest.from);
        const toUser = await user.findById(fRequest.to);
        toUser.friends = [...toUser.friends, fromUser];
        fromUser.friends = [...fromUser.friends, toUser];
        await toUser.save();
        await fromUser.save();
        await friendRequest.findByIdAndDelete(fRequest._id);
        return res.send(fromUser);
    }
    catch{
        return res.send('Error, couldn\'t accept request' )
    }

})

//Declines request.
router.post('/requests/:id/decline', isLoggedIn, async(req, res) => {
    try{
        const {id} = req.params;
        await friendRequest.findByIdAndDelete(id);
        res.send("Declined Request");
    }
    catch{
        res.send('Error, couldn\' decline request');
    }

})

//Sends request, returns new friend request object.
router.post('/new', isLoggedIn, async (req, res) => {
    try{
        const {id} = req.body;
        const toUser = await user.findById(id);
        const newFriendRequest = new friendRequest({from: req.user, to: toUser})
        toUser.friendRequests = [...toUser.friendRequests, newFriendRequest];
        await toUser.save();
        await newFriendRequest.save();
        res.send(newFriendRequest);
    }
    catch{
        res.send('Error, couldn\'t send request');
    }

})
router.get('/new', (req, res) => {
    res.render('user/friends/newFriend');
})

//Deletes friend.
router.delete('/:id', async(req, res) => {
    try{
        const {id} = req.params
        const currUser = await user.findById(req.user._id).populate('friends');
        const friendToDelete = await user.findById(id).populate('friends');
        currUser.friends = currUser.friends.filter((friend) => friend._id.toString() !== friendToDelete._id.toString());
        friendToDelete.friends = friendToDelete.friends.filter((friend) => friend._id.toString() !== currUser._id.toString());
        await currUser.save();
        await friendToDelete.save();
        res.send('Friend deleted.');
    }
    catch {
        res.send('Error, couldn\'t delete friend.')
    }
})

module.exports = router;
