const pool = require('../config/db');
const Utils = require('../utils/utils');

const Friends = {
    /** Sends friend request to USER */
    async sendFriendRequest(user) {
        const senderInfo = req.user;
        const receiverInfo = await pool.query('SELECT user_id FROM users WHERE username = $1', [user]);
        if (!receiverInfo) {
            return null;
        }
        
    },

    /** Accepts friend request from USER */
    async acceptFriendRequest() {

    },

    /** Rejects friend request from USER */
    async rejectFriendRequest() {

    },

    /** Removes the friend. In case when the friend request was not
     *  accepted yet, the friend request will be deleted.
     */
    async removeFriend() {

    },

    /** Blocks USER from viewing the profile or inviting to chat. */
    async blockUser() {

    },

    /** Unblocks USER  */
    async unblockUser() {

    },

    /** Gets the users' friendship status between USER 1 and USER 2 */
    async getFriendStatus() {

    },
}

module.exports = Friends;