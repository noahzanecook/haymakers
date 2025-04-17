import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import Game from '../game.js';
import { io } from 'socket.io-client';
import { loadMap } from '../mapLoader.js';

class Lobby {
    constructor(scene, camera, renderer, world, debug, lobbyId, mapName) {
        console.log('Creating new Lobby instance:', { lobbyId, mapName });
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.world = world;
        this.debug = debug;
        this.lobbyId = lobbyId;
        this.game = null;
        this.players = new Map();
        this.dynamicBodies = []; // Initialize dynamicBodies array
        
        this.socket = io('http://localhost:3000');
        this.setupSocketListeners();
        this.startGame(mapName);
    }

    setupSocketListeners() {
        // Listen for player joined
        this.socket.on('playerJoined', (playerData) => {
            console.log('Player joined:', playerData.id);
            this.players.set(playerData.id, playerData);
        });

        // Listen for player left
        this.socket.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId);
            this.players.delete(playerId);
        });
    }

    startGame(mapName) {
        if (this.game) {
            console.log('Game already started, skipping initialization');
            return;
        }

        console.log('Starting game with map:', mapName);
        this.game = new Game(this.scene, this.camera, this.renderer, this.world, this.debug);
        loadMap(mapName, this.scene, this.world, this.dynamicBodies, this.debug);
    }

    update(delta) {
        if (this.game) {
            this.game.update(delta);
        }
    }
}

export default Lobby; 