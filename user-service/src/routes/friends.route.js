/**
 * Route to handle the User friend management.
 */
const express = require('express');
const friendsController = require('../controllers/friends.controller');
const authenticator = require('../middlewares/auth.mw');
const router = express.Router();

router.post('/add', authenticator, friendsController.addFriend);