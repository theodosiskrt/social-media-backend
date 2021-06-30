const mongoose = require('mongoose');
const post = require('./post')
const user = require('./user')
const Schema = mongoose.Schema;

const replySchema = new Schema({
    text:{
        type: String,
        required: true
    },
    refModel:{
        type: String,
        required: true,
        enum:['Post', 'Reply']
    },
    replies:{
        type: [mongoose.Types.ObjectId],
        ref: 'Reply'
    },
    parent:{
        type:mongoose.Types.ObjectId,
        required: true,
        refPath: 'refModel'
    },
    author:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required: true
    },
    authorUsername:{
        type: String,
        required: true
    }
});


replySchema.post('findOneAndDelete', async function (doc){
    //Removes the reply id from its parents reply array
    if (doc){
        let parent;
        if(doc.refModel === 'Post') parent = await post.findById(doc.parent._id);
        else parent = await this.model.findById(doc.parent._id);
        if(parent){
            parent.replies = parent.replies.filter((reply) => reply._id.toString()!== doc._id.toString());
            await parent.save();
        }
        //Let's say this tree contains replies.
        //        O
        //      /   \
        //     O     O
        //   /  \   / \
        //  O   O  O   O
        //If you delete the top reply then you need to delete all the replies under it as well.
        //So everytime you delete a reply you also need to delete its children, its childrens children etc.
        //For every child of the deleted reply, find it by id and delete it. (Lines 56-58)
        doc.replies.map(async (r) => {
            await this.model.findByIdAndDelete(r)
        });
    }
})


module.exports = mongoose.model('Reply', replySchema);