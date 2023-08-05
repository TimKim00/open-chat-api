const Utils = require('../utils/utils');

module.exports = async function(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>
    try {
        req.user = await Utils.validateUserToken(token);
        if (!req.user) {
            return res.status(401).json({msg: 'Unauthorized'});
        }
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).json({msg: 'Unauthorized'});
    }
}
