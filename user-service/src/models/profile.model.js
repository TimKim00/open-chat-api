const pool = require('../config/db');
const Utils = require('../utils/utils');

const Profile = {
    /** Creates a profile with the given input. */
    async createProfile(username, displayname, birthdate, sex, bio) {
        // Get the user Id of the username. 
        const user = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
        if (user.rowCount === 0) {
            return null;
        }

        const existingProfile = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [user.rows[0].user_id]);
        if (existingProfile.rowCount > 0) {
            // There already exists a profile. 
            return null;
        }
        
        const queryObj = buildProfileQuery(displayname, birthdate, sex, bio, 2);
        if (!queryObj.notNull) {
            // No fields to create the profile.
            return null;
        }

        const query = `INSERT INTO user_profiles (user_id, ${queryObj.fields})
         VALUES ($1, ${queryObj.insertFields}) RETURNING *`;
        const values = queryObj.values;
        values.unshift(user.rows[0].user_id);

        const result = await pool.query(query, values);

        return result.rowCount > 0 ? Utils.setUserProfile(Utils.userProfileFilter(result.rows[0])) : null;
    },

    /** Updates the profile information */
    async updateProfile(username, displayname, birthdate, sex, bio) {
        // Get the user Id of the username. 
        const user = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
        if (user.rowCount === 0) {
            return null;
        }

        const existingProfile = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [user.rows[0].user_id]);
        if (existingProfile.rowCount === 0) {
            // There is no profile set by the user.
            return null;
        }
        
        const queryObj = buildProfileQuery(displayname, birthdate, sex, bio);
        if (!queryObj.notNull) {
            // No fields to update the profile. Return the existing profile.
            return Utils.userProfileFilter(existingProfile.rows[0]);
        }

        let num = 2;
        const fields = queryObj.fields.split(', ').map(field => `${field} = $${num++}`).join(', ');

        const query = `UPDATE user_profiles SET ${fields} WHERE user_id = $1 RETURNING *`;
        const values = queryObj.values;
        values.unshift(user.rows[0].user_id);

        const result = await pool.query(query, values);

        return result.rowCount > 0 ? Utils.userProfileFilter(result.rows[0]) : null;
    },

    /** Searches for a profile of a user named USERNAME or USERID*/
    async searchProfile(username=null, userId=null) {
        if (!username && !userId) {
            // Nothing has been defined to search for.
            return null;
        }

        let result = undefined;
        if (username) {
            const user = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
            if (user.rowCount === 0) {
                return null;
            }
            result = await pool.query(`SELECT * FROM user_profiles WHERE user_id = $1`, [user.rows[0].user_id]);
        } else {
            result = await pool.query(`SELECT * FROM user_profiles WHERE user_id = $1`, [userId]);
        }

        return result.rowCount > 0 ? Utils.userProfileFilter(result.rows[0]) : null;
    },

    /** Remove the profile. */
    async deleteProfile(username=null, userId=null) {
        if (!username && !userId) {
            // Nothing has been defined to search for.
            return null;
        }

        let result = undefined;
        if (username) {
            const user = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
            if (user.rowCount === 0) {
                return null;
            }
            result = await pool.query(`DELETE FROM user_profiles WHERE user_id = $1`, [user.rows[0].user_id]);
            if (result.rowCount > 0) {
                result = await pool.query('UPDATE users SET profile_id = NULL WHERE user_id = $1', [user.rows[0].user_id]);
            }
        } else {
            result = await pool.query(`DELETE FROM user_profiles WHERE user_id = $1`, [userId]);
            if (result.rowCount > 0) {
                result = await pool.query('UPDATE users SET profile_id = NULL WHERE user_id = $1', [userId]);
            }
        }

        return result.rowCount > 0;
    },

    /** Sets the profile privacy. */
    async setProfilePrivacy() {

    },

    /** Sets the profile image */
    async setProfileImage() {

    },

    /** Sends friend request to USER */
    async sendFriendRequest() {

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

    /** Gets the user's privacy settings */
    async getPrivacyStatus() {

    },
}

/** Build the profile query, returning FIELDS, INSERTFIELDS and VALUES object.
 *  Counter should be the number of the next value to be inserted. (1 by default)
 */
function buildProfileQuery(displayname, birthdate, sex, bio, counter=1) {
    let fields = ``;
    let insertFields = ``;
    let values = [];
    let defaultCount = counter;

    if (displayname) {
        fields += `name, `;
        insertFields += `$${counter++}, `;
        values.push(displayname);
    }

    if (birthdate) {
        fields += `birthdate, `;
        insertFields += `$${counter++}, `;
        values.push(new Date(birthdate));

        fields += `age, `;
        insertFields += `$${counter++}, `;
        values.push(new Date().getFullYear() - new Date(birthdate).getFullYear());
    }

    if (sex) {
        fields += `sex, `;
        insertFields += `$${counter++}, `;
        values.push(sex);
    }

    if (bio) {
        fields += `bio, `;
        insertFields += `$${counter++}, `;
        values.push(bio);
    }
    
    fields = fields.substring(0, fields.length - 2);
    insertFields = insertFields.substring(0, insertFields.length - 2);

    return {
        fields: fields, 
        insertFields: insertFields,
        values: values,
        length: counter - defaultCount,
        notNull: counter > defaultCount
    }
}

module.exports = Profile;