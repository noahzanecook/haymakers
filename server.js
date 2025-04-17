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
// Store lobbies
const lobbies = new Map();

/**
 * Socket.IO Connection Handler
 * 
 * Manages all socket events:
 * - New connections
 * - Player joins
 * - Position updates
 * - Disconnections
 * - Lobby creation and joining
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

    // Handle lobby creation
    socket.on('createLobby', (data) => {
        const { mapName = 'test' } = data;
        const lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
        lobbies.set(lobbyId, {
            host: socket.id,
            players: new Set([socket.id]),
            mapName: mapName
        });
        socket.emit('lobbyCreated', lobbyId);
        console.log(`Lobby ${lobbyId} created by ${socket.id} with map ${mapName}`);
        // Broadcast updated lobby list to all clients
        io.emit('lobbyList', Object.fromEntries(lobbies));
    });

    // Handle lobby joining
    socket.on('joinLobby', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby) {
            lobby.players.add(socket.id);
            console.log('lobby:', lobby);
            socket.emit('joinedLobby', {
                lobbyId,
                mapName: lobby.mapName,
                host: lobby.host,
                players: Array.from(lobby.players)
            });
            // Notify other players in the lobby
            lobby.players.forEach(playerId => {
                if (playerId !== socket.id) {
                    io.to(playerId).emit('playerJoined', {
                        id: socket.id,
                        position: { x: 0, y: 1, z: -2 },
                        animationState: 'idle'
                    });
                }
            });
            console.log(`Player ${socket.id} joined lobby ${lobbyId}`);
            // Broadcast updated lobby list to all clients
            io.emit('lobbyList', Object.fromEntries(lobbies));
        } else {
            socket.emit('lobbyError', 'Lobby not found');
        }
    });

    // Handle lobby leaving
    socket.on('leaveLobby', () => {
        lobbies.forEach((lobby, lobbyId) => {
            if (lobby.players.has(socket.id)) {
                lobby.players.delete(socket.id);
                if (lobby.players.size === 0) {
                    lobbies.delete(lobbyId);
                    console.log(`Lobby ${lobbyId} deleted due to no players`);
                } else if (lobby.host === socket.id) {
                    // If host disconnects, assign new host
                    const newHost = Array.from(lobby.players)[0];
                    lobby.host = newHost;
                    io.to(newHost).emit('hostChanged');
                    console.log(`New host assigned for lobby ${lobbyId}: ${newHost}`);
                }
                // Broadcast updated lobby list to all clients
                io.emit('lobbyList', Object.fromEntries(lobbies));
            }
        });
    });

    // Handle lobby list request
    socket.on('requestLobbyList', () => {
        socket.emit('lobbyList', Object.fromEntries(lobbies));
    });

    // When a player disconnects, remove them and notify other players
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        players.delete(socket.id);
        socket.broadcast.emit('playerLeft', socket.id);

        // Clean up lobbies
        lobbies.forEach((lobby, lobbyId) => {
            if (lobby.players.has(socket.id)) {
                lobby.players.delete(socket.id);
                if (lobby.players.size === 0) {
                    lobbies.delete(lobbyId);
                    console.log(`Lobby ${lobbyId} deleted due to no players`);
                } else if (lobby.host === socket.id) {
                    // If host disconnects, assign new host
                    const newHost = Array.from(lobby.players)[0];
                    lobby.host = newHost;
                    io.to(newHost).emit('hostChanged');
                    console.log(`New host assigned for lobby ${lobbyId}: ${newHost}`);
                }
                // Broadcast updated lobby list to all clients
                io.emit('lobbyList', Object.fromEntries(lobbies));
            }
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 