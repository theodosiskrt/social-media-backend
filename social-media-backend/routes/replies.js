const express = require('express');
const reply = require('../models/reply');
const post = require('../models/post');
const deleteRepliesOfParent = require('../utilities/deleteRepliesOfParent')
const isLoggedIn = require('../utilities/isLoggedIn');
const isAuthorized = require('../utilities/isAuthorized');
const addReply = require('../utilities/addReply');


const router = express.Router();

//Returns a post object containing its replies.
router.get('/:id/replies',async (req, res) => {
    try{
        const {id} = req.params;
        const fPost = await post.findById(id).populate('replies');
        res.send(fPost);
    }
    catch{
        res.send('Error, couldn\'t get post.')
    }

})

//Creates new reply to a certain post, return the post (which contains the new reply).
router.post('/:id/replies/new', isLoggedIn, async (req, res) => {
    try{
        const parentPost = await addReply(post, req)
        res.send(parentPost);
    }
    catch{
        console.log('Error, couldn\'t add reply.')
    }
})

//Creates new reply to a certain reply, returns parent reply (which contains the new reply)
router.post('/replies/:id/new', isLoggedIn, async (req, res) => {
    try{
        const parentReply = await addReply(reply, req);
        res.send(parentReply);
    }
    catch{
        console.log('Error, couldn\'t add reply.')
    }


})

//Edits reply, returns edited reply if the edit was successful.
router.patch('/replies/:id/edit', isLoggedIn, isAuthorized(reply),  async(req, res) => {
    try{
        const {id} = req.params;
        await reply.findByIdAndUpdate(id, req.body);
        const editedReply = await reply.findById(id);
        res.send(editedReply);
    }
    catch{
        res.send("Error, couldn't edit Reply.")
    }
})

//Deletes a reply.
router.delete('/replies/:id', isLoggedIn, isAuthorized(reply), deleteRepliesOfParent(reply), async (req, res) => {
    try{
        await reply.findByIdAndDelete(req.params.id);
        res.send('Deleted.');
    }
    catch{
        console.log("Error, couldn't delete reply.")
    }

})

module.exports = router;