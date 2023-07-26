const { Pool } = require('pg');
const config = require('./config');

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}

const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV !== "test") {
  module.exports = new Pool({
    host: config.pg.host,
    user: config.pg.user,
    password: config.pg.password,
    database: config.pg.database,
    port: config.pg.port
  });
} else {
  module.exports = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.PORT
  })
}
