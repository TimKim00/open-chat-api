const express = require('express');
const { connectDB } = require('./src/configs/db')
const { Server } = require('socket.io');
const socketHandler = require('./src/sockets/socketHandler');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


io.on('connection', socketHandler);

connectDB()
    .then(() => {
        // Start the server.
        const port = process.env.PORT || 3000;
        const serverAdd = server.listen(port, () => {
            const { address, port } = serverAdd.address();
            console.log(`Chat server listening at http://${address}:${port}`);
        });
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })


