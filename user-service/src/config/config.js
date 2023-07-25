// config.js

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' }) 
} else {
  require('dotenv').config()
}

// get config values from process.env
let config = {
host: process.env.PG_HOST,
user: process.env.PG_USER,
password: process.env.PG_PASSWORD,
database: process.env.PG_DATABASE,
port: process.env.PG_PORT
}

if (process.env.NODE_ENV === 'test') {
  config.host = process.env.DB_HOST;
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASS;
} 

module.exports = {
  pg: config,
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  express: {
    port: process.env.PORT
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
}
