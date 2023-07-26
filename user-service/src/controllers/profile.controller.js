const User = require('../models/user.model');
const Utils = require('../utils/utils');
const Profile = require('../models/profile.model');

/** Gets the user profile. */

/** Creates the user profile. */
exports.createProfile = async (req, res) => {
    const {username, displayname, birthdate, sex, bio} = req.body;
    try {
        if (username !== req.user.username && !req.user.adminStatus) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const profile = await Profile.createProfile(username,
             displayname, birthdate, sex, bio);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile creation failed.' });
        }

        return res.status(201).json({profileInfo: profile});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}