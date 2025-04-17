import { io } from 'socket.io-client';
import Lobby from './lobby.js';

class LobbyManager {
    constructor(scene, camera, renderer, world, debug) {
        console.log('Initializing LobbyManager');
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.world = world;
        this.debug = debug;
        
        console.log('Connecting to socket server...');
        this.socket = io('http://localhost:3000', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Add connection event listeners
        this.socket.on('connect', () => {
            console.log('Socket connected successfully with ID:', this.socket.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.activeLobby = null;
        this.availableLobbies = new Map();
        this.pendingMapName = null;
        
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        console.log('Setting up socket listeners');
        
        // Listen for available lobbies
        this.socket.on('lobbyList', (lobbies) => {
            console.log('Received lobby list:', lobbies);
            this.availableLobbies = new Map(Object.entries(lobbies));
        });

        // Listen for lobby creation confirmation
        this.socket.on('lobbyCreated', (lobbyId) => {
            console.log('Lobby created with ID:', lobbyId);
            console.log('Pending map name:', this.pendingMapName);
            
            // Create a new lobby instance when we get confirmation
            this.activeLobby = new Lobby(
                this.scene,
                this.camera,
                this.renderer,
                this.world,
                this.debug,
                lobbyId,
                this.pendingMapName
            );
            if (this._resolveLobbyPromise) {
                this._resolveLobbyPromise({ success: true, lobbyId, isHost: true });
                this._resolveLobbyPromise = null;
            }
            this.pendingMapName = null;
        });

        // Listen for lobby join confirmation
        this.socket.on('joinedLobby', (lobbyData) => {
            console.log('Joined lobby with data:', lobbyData);
            
            // Create a new lobby instance when we join
            this.activeLobby = new Lobby(
                this.scene,
                this.camera,
                this.renderer,
                this.world,
                this.debug,
                lobbyData.lobbyId,
                lobbyData.mapName
            );
            if (this._resolveLobbyPromise) {
                this._resolveLobbyPromise({ success: true, lobbyId: lobbyData.lobbyId, isHost: false });
                this._resolveLobbyPromise = null;
            }
        });

        // Listen for lobby errors
        this.socket.on('lobbyError', (error) => {
            console.error('Lobby error:', error);
            if (this._resolveLobbyPromise) {
                this._resolveLobbyPromise({ success: false, error });
                this._resolveLobbyPromise = null;
            }
            this.pendingMapName = null;
        });
    }

    // Create a new lobby with a specific map
    createLobby(mapName) {
        console.log('Creating lobby with map:', mapName);
        return new Promise((resolve) => {
            this._resolveLobbyPromise = resolve;
            this.pendingMapName = mapName;
            this.socket.emit('createLobby', { mapName });
        });
    }

    // Join an existing lobby
    joinLobby(lobbyId) {
        console.log('Joining lobby:', lobbyId);
        return new Promise((resolve) => {
            this._resolveLobbyPromise = resolve;
            this.socket.emit('joinLobby', lobbyId);
        });
    }

    // List available lobbies
    listLobbies() {
        console.log('Listing lobbies');
        return new Promise((resolve) => {
            this.socket.emit('requestLobbyList');
            this.socket.once('lobbyList', (lobbies) => {
                const lobbyList = Object.entries(lobbies).map(([id, data]) => ({
                    id,
                    host: data.host,
                    playerCount: data.players.size,
                    mapName: data.mapName
                }));
                console.log('Available lobbies:', lobbyList);
                resolve(lobbyList);
            });
        });
    }

    // Leave current lobby
    leaveLobby() {
        if (this.activeLobby) {
            console.log('Leaving lobby:', this.activeLobby.lobbyId);
            this.socket.emit('leaveLobby');
            const oldLobbyId = this.activeLobby.lobbyId;
            this.activeLobby = null;
            return { success: true, message: `Left lobby: ${oldLobbyId}` };
        } else {
            console.log('Not in any lobby');
            return { success: false, message: 'Not in any lobby' };
        }
    }
}

export default LobbyManager;