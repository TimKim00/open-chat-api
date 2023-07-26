/**
 * Route to handle the User profile management.
 */
const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticator = require('../middlewares/auth.mw');
const router = express.Router();

/** Creating and retreiving profile information. */
router.post('/', authenticator, profileController.createProfile);
router.get('/', authenticator, profileController.getProfile);
router.get('/search', authenticator, profileController.searchProfile);
router.delete('/', authenticator, profileController.deleteProfile);

/** Updating profile infomration. */
router.patch('/', authenticator, profileController.updateProfile);
router.post('/upload-image', authenticator, profileController.setProfileImage);

module.exports = router;