const User = require('../models/user.model');
const Utils = require('../utils/utils');
const Profile = require('../models/profile.model');
const { registerUser } = require('./user.controller');

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

/** Update the user profile */
exports.updateProfile = async (req, res) => {
    const {username, displayname, birthdate, sex, bio} = req.body;
    try {
        if (username !== req.user.username && !req.user.adminStatus) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const profile = await Profile.updateProfile(username,displayname, birthdate, sex, bio);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile update failed.' });
        }

        return res.status(200).json({profileInfo: profile});

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

/** Retreives the user profile, if they exist. */
exports.getProfile = async (req, res) => {
    const userInfo = req.user;
    try {
        /** For now, let anyone be able to get the user profile
         *  In the future, there should be a complex freinds system
         *  that would enable users to see each other's profiles.
         */

        const profile = await Profile.searchProfile(userInfo.username, userInfo.userId);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile does not exist.' });
        }

        return res.status(200).json({profileInfo: profile});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

/** Retreives the user profile, if they exist. */
exports.searchProfile = async (req, res) => {
    const {username, userId} = req.body;
    try {
        /** For now, let anyone be able to get the user profile
         *  In the future, there should be a complex freinds system
         *  that would enable users to see each other's profiles.
         */

        const profile = await Profile.searchProfile(username, userId);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile does not exist.' });
        }

        return res.status(200).json({profileInfo: profile});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

/** Deletes the user's profile */
exports.deleteProfile = async (req, res) => {
    const {username, userId} = req.body;
    try {
        if (username !== req.user.username && !req.user.adminStatus) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        if (!await Profile.deleteProfile(username, userId)) {
            return res.status(400).json({ msg: 'Profile deletion failed.' });
        }
        return res.status(204).json({ msg: 'Profile deleted.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

/** Updates the profile image */
exports.setProfileImage = async (req, res) => {
    const {username, userId, profilePictureUrl} = req.body;
    try {
        if (username !== req.user.username && !req.user.adminStatus) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const imageURL = await Profile.setProfileImage(username, userId, profilePictureUrl);
        
        if (!imageURL) {
            return res.status(400).json({ msg: 'Profile Image set failed.' });
        }

        return res.status(200).json({pictureURL: imageURL});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}