


module.exports = (model) => {

    return async (req, res, next) => {
        let reply = require('../models/reply');
        if(model.modelName === 'Reply') reply = model;
        const parent = await model.findById(req.params.id);
        parent.replies.map(async (r) => { await reply.findByIdAndDelete(r); })
        next();
    }
}
