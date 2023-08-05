const express = require('express');
const rateLimit = require('express-rate-limit');
const route = require('./src/routes/route');

const app = express();

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
})


// Use express middlewares (applied to all requests).
app.use(express.json());
app.use(apiLimiter);


// Import routes
app.use('/', route);

module.exports = app;

// Start the server.
const port = process.env.PORT || 3004;
const server = app.listen(port, () => {
    const { address, port } = server.address();
    console.log(`Room server listening at http://${address}:${port}`);
});
