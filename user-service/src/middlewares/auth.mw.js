const Utils = require('../utils/utils');

module.exports = async function(req, res, next) {
    // Check for a token in the request headers.
    // If a token is found, verify it using jwt.verify().
    // If the token is valid, extract the user data and attach it to the request object.
    // If the token is not valid, send a 401 Unauthorized response.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>
    try {
        const userInfo = await Utils.validateToken(token);
        if (!token || !userInfo) {
            return res.status(401).json({msg: 'Unauthorized'});
        }
        req.user = userInfo
        next();
    } catch (err) {
        res.status(401).json({msg: 'Unauthorized'});
    }
}
