const Room = require('../models/Room');
const schema = require('../Utils/validation');
const Utils = require('../Utils/utils');
const redis = require('../config/redis');

// Creates a room
exports.createRoom = async (req, res) => {
    const { roomInfo } = req.body;
    const userInfo = req.user;
    try {
        // Validate input  
        const { error } = schema.roomSchema.validate(roomInfo);
        if (error) return res.status(400).json({ error: 'Invalid input' });

        const room = await new Room({
            name: roomInfo.name,
            tags: roomInfo.tags,
            isPrivate: roomInfo.isPrivate,
            lastSeqNumber: 0,
            participants: [{
                userId: userInfo.userId,
                username: userInfo.username,
                admin: userInfo.admin
            }]
        }).save();

        const roomToken = Utils.generateRoomToken(room._id);

        return res.status(200).json({ name: room.name, roomId: room._id, roomToken: roomToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all the rooms with the given filters
exports.getRooms = (req, res) => {

}

// Get room information
exports.getRoom = (req, res) => {
    const roomId = req.params.roomId;
    try {
        Room.statics.findById(roomId, (err, room) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Server error' });
            }
            if (!room) return res.status(404).json({ error: 'Room not found' });
            return res.status(200).json({ name: room.name, roomId: room._id });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

// Join a room
exports.joinRoom = async (req, res) => {
    const { roomName } = req.body;
    const userInfo = req.uesr;
    try {
        // Extract the user's information to add to the list of participants.
        const { error } = schema.userSchema.validate(userInfo);
        if (error) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        // Retreive the room's information
        const room = await Room.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Append the user's information to the list of participants
        room.participants.push({
            userId: userInfo.userId,
            username: userInfo.username,
            admin: userInfo.adminStatus
        });

        // Save the room's information
        await room.save();

        // Generate the token based on the room's information
        const roomToken = Utils.generateRoomToken(room._id);

        // Asynchronously send the message `user USERNAME has joined the room`
        redis.publish(`room ${room._id}`, JSON.stringify({
            type: 'join',
            username: userInfo.username,
            userId: userInfo.userId,
        }));

        res.status(200).json({ roomToken: roomToken, })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

// Delete a room. The room should be deleted only if the user is an admin
// or if there is participants in the room. 
exports.deleteRoom = async (req, res) => {
    const { roomId } = req.body;
    const userInfo = req.user;
    try {
        const { error } = schema.userSchema.validate(userInfo);
        if (error) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        if (userInfo.adminStatus) {
            // Delete the room
            if (roomId) {
                await Room.deleteOne({ _id: roomId });
            } else {
                return res.status(400).json({ error: 'Invalid input' });
            }
        } else {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Destroy the room's channel
        const channel = `room ${room._id}`;
        redis.del(channel);

        return res.status(204).json({ msg: 'Room deleted' });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}

// user USER Leaves the room. 
exports.leaveRoom = async (req, res) => {
    const { roomName, roomId } = req.body;
    const userInfo = req.user;
    try {
        // Validate user credentials
        const { error } = schema.userSchema.validate(userInfo);
        if (error) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        // Identify the room. 
        let room;
        if (roomName) {
            room = await Room.findOne({ name: roomName });
        } else if (roomId) {
            room = await Room.findAll({ name: roomName, roomId: roomId });
        } else {
            return res.status(404).json({ error: 'Room not found' });
        }

        // remove the participant from the room. 
        const userIndex = room.participants.findIndex(p => p.userId === userInfo.userId);
        if (userIndex !== -1) {
            room.participants.splice(userIndex, 1);
        }

        await room.save();

        // Send a message to the channel notifying that the user has left the room.
        redis.publish(`room ${room._id}`, JSON.stringify({
            type: 'leave',
            username: userInfo.username,
            userId: userInfo.userId,
        }));

        return res.status(200).json({ msg: 'User left the room' });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}