const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    posts: {
        type: [mongoose.Types.ObjectId],
        ref: 'Post'
    },
    friends: {
        type: [mongoose.Types.ObjectId],
        ref: 'User',
    },
    friendRequests:{
        type:[mongoose.Types.ObjectId],
        ref:'FriendRequest'
    }
})



userSchema.plugin(passportLocalMongoose);

const user =mongoose.model('User', userSchema);



module.exports = user;