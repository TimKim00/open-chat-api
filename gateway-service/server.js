// gateway.js
const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const proxy = httpProxy.createProxyServer();

process.env.NODE_ENV === 'test' ? require('dotenv').config({ path: '.env.test' }) : require('dotenv').config();

// User service
app.all("/api/users/*", (req, res) => {
    req.url = req.url.replace('/api/users', ''); // remove prefix
    proxy.web(req, res, {
        target: `http://${process.env.USER_SERVER}:${process.env.USER_PORT}`,
    });
});

// Chat service
app.all("/api/chats/*", (req, res) => {
    req.url = req.url.replace('/api/chats', '');
    proxy.web(req, res, {
        target: `http://${process.env.CHAT_SERVER}:${process.env.CHAT_PORT}`,
    });
});

// Notification service
app.all("/api/notifications/*", (req, res) => {
    req.url = req.url.replace('/api/notifications', '');
    proxy.web(req, res, {
        target: `http://${process.env.NOTIFICATION_SERVER}:${process.env.NOTIFICATION_PORT}`,
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Gateway Service is listening on port ${port}`));
