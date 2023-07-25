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
  config = {
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
    }
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
