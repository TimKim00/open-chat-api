const axios = require('axios');
const { mongoose } = require('../src/config/db');
const jwt = require('jsonwebtoken');
const redis = require('../src/config/redis');

process.env.NODE_ENV === 'test' ? require('dotenv').config({ path: '.env.test' }) : require('dotenv').config();

const Utils = {
    async initializeTest() {
        await new Promise((resolve, reject) => {
            let mongoConnected = false;
            let redisConnected = false;

            // Wait for MongoDB connection
            mongoose.connection.once('connected', () => {
                console.log('MongoDB connected');
                mongoConnected = true;
                checkReady();
            });

            // Wait for Redis connection
            redis.on('ready', () => {
                console.log('Redis connected');
                redisConnected = true;
                checkReady();
            });

            // Check for errors  
            mongoose.connection.once('error', err => reject(err));
            redis.on('error', err => reject(err));
            
            function checkReady () {
                if (mongoConnected && redisConnected) {
                    resolve();
                }
            }
        });

        // Clear the mongoose models.
        for (let modelName in mongoose.models) {
            const model = mongoose.models[modelName];
            await model.deleteMany({});
        }

        // Clear the redis cache. 
        await redis.flushAll();

        // Clear the user database. 
        const resetToken = jwt.sign({ reset: true }, process.env.USER_RESET_SECRET);
        const response = await axios.put(`${process.env.USER_SERVER}`, { resetToken });

        return response.status === 201;
    },
}

module.exports = Utils;