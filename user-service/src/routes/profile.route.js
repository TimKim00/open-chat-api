/**
 * Route to handle the User profile management.
 */
const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticator = require('../middlewares/auth.mw');
const router = express.Router();

router.post('/', authenticator, profileController.createProfile);

module.exports = router;