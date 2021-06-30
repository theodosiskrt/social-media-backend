const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const user = require('./user');

const postSchema = new Schema({
    text:{
        type: String,
        required: true
    },
    author:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    replies:{
        type:[mongoose.Types.ObjectId],
        ref:'Reply'
    },
    authorUsername:{
        type:String,
        required: true
    }
})

postSchema.post('findOneAndDelete', async (doc) => {
    //Removes the deleted post id from its authors post array.
    const fUser = await user.findById(doc.author);
    fUser.posts = fUser.posts.filter((post) => post._id.toString() !== doc._id.toString());
    await fUser.save();
})


module.exports = mongoose.model('Post', postSchema);