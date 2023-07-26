// config.js
require('dotenv').config();

module.exports = {
  pg: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  express: {
    port: process.env.PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
