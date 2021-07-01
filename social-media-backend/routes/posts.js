const express = require('express');
const post = require('../models/post');
const user = require('../models/user')
const replyRoutes = require('./replies');
const isLoggedIn = require('../utilities/isLoggedIn');
const isAuthorized = require('../utilities/isAuthorized');
const deleteRepliesOfParent = require('../utilities/deleteRepliesOfParent')

const router = express.Router();

//Reply routes.
router.use('/', replyRoutes);

//Returns every post in chronological order.
router.get('/', async (req, res) => {
        const posts = await post.find()
        res.render('posts/posts', {posts: posts.sort((a, b) => b.date - a.date)});
})



//Returns every post created by friends in chronological order.
router.get('/friends', isLoggedIn, async (req, res) => {
    const posts = [];
    const currUser = await user.findById(req.user._id).populate({
        path:'friends',
        populate:{
            path:'posts',
            model:'Post'
        }

    });
    currUser.friends.map((friend) => {posts.push(...friend.posts)});
    res.render('posts/posts', {posts: posts.sort((a, b) => b.date - a.date)});
})



//Creates post, returns new post if its creation was successful.
router.post('/new', isLoggedIn, async (req, res) => {
    try{
        const newPost = new post(req.body);
        newPost.author = req.user;
        newPost.authorUsername = req.user.username;
        newPost.date = new Date();
        await newPost.save();
        const fUser = await user.findById(req.user._id);
        fUser.posts.push(newPost);
        await fUser.save();
        res.send(newPost);
    }
    catch{
        res.send("Sorry couldn't create Post.")
    }

})
router.get('/new', (req, res) => {
    res.render('posts/newPost');
})

//Edits post, returns edited post if the edit was successful.
router.patch('/:id/edit', isLoggedIn, isAuthorized(post), async(req, res) => {
    try{
        await post.findByIdAndUpdate(req.params.id, req.body);
        const editedPost = await post.findById(req.params.id);
        res.send(editedPost);
    }
    catch{
        res.send("Error, couldn't edit post.")
    }
})
router.get('/:id/edit', (req, res) => {
    const {id} = req.params
    res.render('posts/edit', {id});
})

//Returns a post object containing its replies.
router.get('/:id',async (req, res) => {
    try{
        const {id} = req.params;
        const fPost = await post.findById(id).populate('replies');
        res.render('posts/replies/parentReplies', {parent:fPost});
    }
    catch{
        res.send('Error, couldn\'t get post.')
    }

})

//Deletes post.
router.delete('/:id', isLoggedIn, isAuthorized(post), deleteRepliesOfParent(post), async (req, res) => {
    try{
        const {id} = req.params;
        await post.findByIdAndDelete(id);
        res.send("Deleted")
    }
    catch{
        res.send("Error, couldn't delete post")
    }
})

module.exports = router;