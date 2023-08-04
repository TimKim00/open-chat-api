const Utils = require('../Utils/utils');

module.exports = async function(req, res, next) {
    const {userToken} = req.body;
    try {
        req.user = await Utils.verifyUserToken(userToken);
        if (!req.user) {
            return res.status(401).json({msg: 'Unauthorized'});
        }
        next();
    } catch (error) {
        res.status(401).json({msg: 'Unauthorized'});
    }
}
