/**
 * Game Server
 * 
 * Handles multiplayer synchronization using Socket.IO
 * Manages player connections, disconnections, and position updates
 */

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: "*", // allow connection from any origin
        methods: ["GET", "POST"]
    }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Store connected players
const players = new Map();

/**
 * Socket.IO Connection Handler
 * 
 * Manages all socket events:
 * - New connections
 * - Player joins
 * - Position updates
 * - Disconnections
 */
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Send existing players to the new connection
    players.forEach((playerData, id) => {
        if (id !== socket.id) {
            socket.emit('playerJoined', { ...playerData, id });
        }
    });

    // When a new player joins, send their data to all other players
    socket.on('playerJoined', (playerData) => {
        console.log('Player joined with data:', playerData);
        players.set(socket.id, playerData);
        socket.broadcast.emit('playerJoined', { ...playerData, id: socket.id });
    });

    // When a player updates their position, broadcast it to all other players
    socket.on('playerUpdate', (playerData) => {
        players.set(socket.id, playerData);
        socket.broadcast.emit('playerUpdate', { ...playerData, id: socket.id });
    });

    // When a player disconnects, remove them and notify other players
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        players.delete(socket.id);
        socket.broadcast.emit('playerLeft', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 