/**
 * Route to handle the User authentication management.
 */
const express = require('express');
const userController = require('../controllers/user.controller');
const authenticator = require('../middlewares/auth.mw');

const router = express.Router(); 

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/logout', authenticator, userController.logoutUser);
router.put('/change_password', authenticator, userController.changePassword);

module.exports = router;