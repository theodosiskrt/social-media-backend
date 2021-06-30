
module.exports = function(model){
    return async (req, res, next) => {
        const { id } = req.params;
        const fElement = await model.findById(id);
        if(!fElement) {
            return res.send(`${model.modelName} was not found.`);
        }
        if(fElement.author.equals(req.user._id)){
            return next();
        }
        else{
            return res.send("You are not authorized to do that.");
        }
    }
}