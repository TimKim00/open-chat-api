const express = require('express');
const router = express.Router();
const userAuthenticate = require('../middlewares/auth.user');
const roomController = require('../controllers/roomController.js');

// Creates a room
router.post('/', userAuthenticate, roomController.createRoom);

// Get all the rooms with the given filters
router.get('/', userAuthenticate, roomController.getRooms);

// Get room information
router.get('/:roomId', userAuthenticate, roomController.getRoom);

// Join a room
router.post('/:roomId/join', userAuthenticate, roomController.joinRoom);

// Delete a room
router.delete('/:roomId', userAuthenticate, roomController.deleteRoom);

// Leave a room
router.put('/:roomId/leave', userAuthenticate, roomController.leaveRoom);

module.exports = router;