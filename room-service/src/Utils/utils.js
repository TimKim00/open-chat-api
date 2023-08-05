const axios = require('axios');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV === 'test' ? require('dotenv').config({path: '.env.test'}) : require('dotenv').config({path: '.env'});

const Utils = {
    /** Validates the user token by getting the user's information. */
    async validateUserToken(userToken) {
        try {
            const response = await axios.get(`${process.env.USER_SERVER}/user/token`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    generateRoomToken(roomId) {
        try {
            const payload = {roomId: roomId};
            return jwt.sign(payload, process.env.ROOM_SECRET, {expiresIn: '1h'});
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = Utils;