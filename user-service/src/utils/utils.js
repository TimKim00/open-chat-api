const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const Utils = {
    /** Validates the accesstoken.*/
    async validateToken(token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1h' });
        const userInfo = decoded.userInfo;
        const lastTimestamp = await pool.query('SELECT password_changed_at, logged_out_at FROM users WHERE user_id = $1', [userInfo.userId]);
        const tokenTimestamp = new Date(decoded.timestamp);

        if (!userInfo || lastTimestamp.rows[0].last_login > tokenTimestamp
            || lastTimestamp.rows[0].password_changed_at > tokenTimestamp) {
            return false;
        }
        return true;
    },

    /** Creates a json object that contains the accesstoken
     *  in addition to the user information.
     */
    createUserToken(userInfo) {
        const token = jwt.sign({
            userInfo: userInfo,
            timestamp: new Date()
        }, process.env.JWT_SECRET);

        return { accessToken: token, userInfo: userInfo };
    }, 

    /** Filter for filtering out sensitive information about the user. */
    userInfoFilter(userInfo) {
        return {
            userId: userInfo.user_id,
            username: userInfo.username,
            email: userInfo.email,
            name: userInfo.name,
            adminStatus: userInfo.admin_status,
            createdAt: userInfo.created_at,
        }
    }
}

module.exports = Utils;
