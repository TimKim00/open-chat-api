const pool = require('../src/config/db');

const Utils = {

    // Initialize the database to default settings.
    async initializeDatabase() {
        await this.clearUserDataBase();
        //await User.createDummyUser();
    },

    // Clears everything related to users inside the database.
    // In this case, the information about leagues and teams will persist.
    async clearUserDatabase() {
        await this.clearUser();
        await this.clearUserProfile();
        return;
    },

    // Clear the users database.
    async clearUser() {
        await pool.query('DELETE FROM users');
        return;
    },

    // Clear the user profile database.
    async clearUserProfile() {
        await pool.query('DELETE FROM user_profiles');
        return;
    },

    // Validates that the access token is valid.
}

module.exports = Utils;
