// redis.js

const redis = require('redis');
process.env.NODE_ENV === 'test' ? require('dotenv').config({path: '.env.test'}) : require('dotenv').config({path: '.env'});

const client = redis.createClient();

client.on('error', err => console.log('Redis Error', err));
client.on('ready', () => {
  console.log('Connected to Redis!');
});

async function connect() {
  await client.connect();
}

let connected = false;
connect()
.then(connected = true)
.catch(err => console.log('Redis Error', err));

module.exports = {
  redis: client,
  connected
}
