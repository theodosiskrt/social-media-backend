let reply = require('../models/reply')

//Adds reply to a Post/Reply and returns the parent Post/Reply
module.exports = async (model, req) => {
    if(model.modelName === 'Reply'){
        reply = model;
    }
    const {id} = req.params;
    const parent = await model.findById(id);
    const newReply = new reply(req.body);
    parent.replies.push(newReply);
    newReply.refModel = model.modelName;
    newReply.parent = parent;
    newReply.author = req.user;
    newReply.authorUsername = req.user.username;
    await newReply.save();
    await parent.save();
    return parent;
}