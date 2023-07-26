/**
 * Route to handle the User profile management.
 */
const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticator = require('../middlewares/auth.mw');
const router = express.Router();

router.post('/', authenticator, profileController.createProfile);
router.put('/', authenticator, profileController.updateProfile);
router.get('/', authenticator, profileController.getProfile);
router.get('/search', authenticator, profileController.searchProfile);
router.delete('/', authenticator, profileController.deleteProfile);

module.exports = router;