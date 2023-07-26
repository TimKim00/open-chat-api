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

        return result.rowCount > 0 ? Utils.userProfileFilter(result.rows[0]) : null;
    },

    /** Updates the profile information */
    async updateProfile(username, displayname, birthdate, sex, bio) {
        const user = await pool.query(`SELECT user_id FROM users WHERE username = $1`, [username]);
        if (user.rowCount === 0) {
            return null;
        }

        const query = `INSERT INTO user_profiles (
            name, birthdate, age, sex, bio)
        ) VALUES ($1, $2, $3, $4, $5) WHERE user_id = $6
         RETURNING *`;

        const values = [displayname, birthdate, sex, bio, user.rows[0].user_id];
        const result = await pool.query(query, values);

        return result.rowCount > 0 ? Utils.userProfileFilter(result.rows[0]) : null;
    },

    /** Retreives the profile information */
    async getProfile() {

    },

    /** Sets the profile privacy. */
    async setProfilePrivacy() {

    },

    /** Sets the profile image */
    async setProfileImage() {

    },

    /** Deletes the profile */
    async deleteProfile() {

    },

    /** Sends friend request to USER */
    async sendFriendRequest() {

    },

    /** Accepts friend request from USER */
    async acceptFriendRequest() {

    },

    /** Blocks USER from viewing the profile or inviting to chat. */
    async blockUser() {

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
    fields = ``;
    insertFields = ``;
    values = [];

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
        length: counter - 1,
        notNull: counter > 1
    }
}

module.exports = Profile;