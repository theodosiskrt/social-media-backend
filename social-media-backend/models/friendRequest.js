const mongoose =require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({
    from:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required: true
    }
})

friendRequestSchema.post('findOneAndDelete', async (doc) => {
    //Removes the requests id from the users request array once the request is deleted.
    const toUser = await user.findById(doc.to);
    toUser.friendRequests = toUser.friendRequests.filter((request) => request._id.toString() !== doc._id.toString());
    await toUser.save();
})



module.exports = mongoose.model('FriendRequest', friendRequestSchema);