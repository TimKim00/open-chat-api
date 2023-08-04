/**
 * Route to handle the User authentication management.
 */
const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router(); 

router.put('/reset-database', userController.resetDatabase);

module.exports = router;