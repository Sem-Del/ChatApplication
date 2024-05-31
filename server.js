const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    // Send the current list of users to the newly connected client
    socket.emit('update user list', Object.values(users));

    socket.on('user joined', (username) => {
        if (username.length <= 20) {
            users[socket.id] = username;
            io.emit('user joined', username);
            io.emit('update user list', Object.values(users));
        } else {
            socket.emit('username error', 'Username must be 20 characters or less');
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('user left', users[socket.id]);
            delete users[socket.id];
            io.emit('update user list', Object.values(users));
        }
        console.log('user disconnected');
    });

    socket.on('chat message', (data) => {
        if (data.message.length <= 3000) {
            io.emit('chat message', data);
        } else {
            socket.emit('message error', 'Message must be 3000 characters or less');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});