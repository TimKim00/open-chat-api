// redis.js

const redis = require('redis');
process.env.NODE_ENV === 'test' ? require('dotenv').config({path: '.env.test'}) : require('dotenv').config({path: '.env'});

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,  
});

client.on('error', err => console.log('Redis Error', err));

module.exports = client;