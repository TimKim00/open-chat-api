const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const Utils = require('../utils/utils');

const User = {
    /** Finds user with username */
    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        const result = await pool.query(query, values);
        return result.rowCount > 0 ? Utils.userInfoFilter(result.rows[0]) : null;
    },

    /** Finds user with user id. */
    async findById(id) {
        const query = 'SELECT * FROM users WHERE user_id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rowCount > 0 ? Utils.userInfoFilter(result.rows[0]) : null;
    },

    /** Creates the user with correct user.  */
    async createUser(username, password, email, adminStatus = false) {
        const query = `INSERT INTO users (username, encrypted_password, created_at,
             password_changed_at, admin_status, email)
              VALUES ($1, $2, $3, $3, $4, $5) RETURNING *`;
        const encryptedPassword = await encryptPassword(password);
        values = [username, encryptedPassword, new Date(), adminStatus, email];
        const result = await pool.query(query, values);
        return result.rowCount > 0 ? Utils.userInfoFilter(result.rows[0]) : null;
    },

    /** Logs in the user. */
    async loginUser(username, password) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        const result = await pool.query(query, values);
        if (result.rowCount > 0) {
            const userInfo = result.rows[0];
            const isPasswordValid = await validateUserCredentials(password, userInfo.encrypted_password);
            if (isPasswordValid) {
                return Utils.userInfoFilter(userInfo);
            }
        }
        return null;
    },

    /** Logs out the user */
    async logoutUser(username) {
        const query = 'UPDATE users SET logged_out_at = $1 WHERE username = $2';
        const values = [new Date(), username];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    },

    /** Delete a user account */
    async deleteUser(username) {
        try {
            /** Remove each components that are associated with the user that is being deleted. */
            let result;

            /** Start transaction */
            await pool.query('BEGIN');

            /** Retreive the user's id */
            result = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
            const userId = result.rows[0].user_id;

            /** Remove the user profile. */
            await pool.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);

            /* Remove the user from the users database. */
            const query = 'DELETE FROM users WHERE username = $1';
            const values = [username];
            result = await pool.query(query, values);
            return result.rowCount > 0;
        } catch (err) {
            console.error(err);
            // Rollback transaction if any queries failed
            await pool.query('ROLLBACK');
            return false;
        }
    },

    /** Update the properties of the user. */
    async updateUser(username, email, adminStatus = false) {
        const query = `UPDATE users SET email = $1,
         admin_status = $2 WHERE username = $3 RETURNING *`;
        const values = [email, adminStatus, username];

        const result = await pool.query(query, values);
        return result.rowCount > 0 ? Utils.userInfoFilter(result.rows[0]) : null;
    }, 

    /** Change the user's password. */
    async changePassword(username, newPassword, oldPassword) {
        if (!await this.loginUser(username, oldPassword)) {
            return false;
        }

        const newEncryptedPassword = await encryptPassword(newPassword);
        query = `UPDATE users SET encrypted_password = $1, password_changed_at = $2
                 WHERE username = $3 RETURNING *`;
        values = [newEncryptedPassword, new Date(), username];

        const result = await pool.query(query, values);
        return result.rowCount > 0;
    }
}

async function encryptPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function validateUserCredentials(password, storedPassword) {
    try {
        // Generate the hashed password using the provided username and password
        const isPasswordValid = await bcrypt.compare(password, storedPassword);

        return isPasswordValid;
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        throw new Error('User credential validation failed');
    }
}

module.exports = User;
