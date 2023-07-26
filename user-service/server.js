const express = require('express');
const rateLimit = require('express-rate-limit');
const authRoute = require('./src/routes/auth.route');
const userRoute = require('./src/routes/user.route');
const profileRoute = require('./src/routes/profile.route');

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
app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/user/profile', profileRoute);

module.exports = app;

// Start the server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
