const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  host: config.pg.host,
  user: config.pg.user,
  password: config.pg.password,
  database: config.pg.database,
  port: config.pg.port
});

module.exports = pool;
