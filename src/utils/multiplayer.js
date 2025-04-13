import { io } from 'socket.io-client';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import RAPIER from '@dimforge/rapier3d-compat';

/**
 * MultiplayerManager Class
 * 
 * Handles all multiplayer functionality including:
 * - Socket.io connection management
 * - Player synchronization
 * - Remote player creation and updates
 * 
 * @class MultiplayerManager
 */
class MultiplayerManager {
    /**
     * Creates a new MultiplayerManager instance
     * 
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {RAPIER.World} world - The Rapier physics world
     * @param {Array} dynamicBodies - Array to store physics bodies
     */
    constructor(scene, world, dynamicBodies) {
        this.scene = scene;
        this.world = world;
        this.dynamicBodies = dynamicBodies;
        this.otherPlayers = new Map(); // Map of socket IDs to player objects
        this.socket = null;
        this.playerId = null;
    }

    /**
     * Establishes connection with the game server
     * Sets up event listeners for multiplayer events
     * 
     * @param {string} serverUrl - URL of the game server
     */
    connect(serverUrl) {
        this.socket = io(serverUrl);

        // connection established
        this.socket.on('connect', () => {
            this.playerId = this.socket.id;
            console.log('Connected to server with ID:', this.playerId);
            
            // Send initial player data
            this.socket.emit('playerJoined', {
                id: this.playerId,
                position: {
                    x: 0,
                    y: 1,
                    z: -2
                }
            });
        });

        // new player joined
        this.socket.on('playerJoined', (playerData) => {
            console.log('Player joined:', playerData.id);
            this.createOtherPlayer(playerData);
        });

        // player left
        this.socket.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId);
            this.removeOtherPlayer(playerId);
        });

        // player position update received
        this.socket.on('playerUpdate', (playerData) => {
            this.updateOtherPlayer(playerData);
        });
    }

    /**
     * Creates a visual and physical representation of another player
     * 
     * @param {Object} playerData - Data about the player to create
     * @param {string} playerData.id - Unique player identifier
     * @param {Object} playerData.position - Player's position
     */
    createOtherPlayer(playerData) {
        if (playerData.id === this.playerId) return;

        console.log('Creating other player:', playerData.id);
        const loader = new GLTFLoader();
        loader.load('/src/assets/meshes/test.glb', (gltf) => {
            // set up visual representation
            const mesh = gltf.scene;
            mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            mesh.scale.set(1.2, 1.2, 1.5);
            mesh.castShadow = true;
            this.scene.add(mesh);

            // set up physics representation
            const playerCollider = RAPIER.ColliderDesc.cuboid(0.5, 1, 0.5);
            const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(playerData.position.x, playerData.position.y, playerData.position.z);
            const body = this.world.createRigidBody(playerBodyDesc);
            const collider = this.world.createCollider(playerCollider, body);

            // store references
            this.dynamicBodies.push([mesh, body]);
            this.otherPlayers.set(playerData.id, { mesh, body });
            console.log('Other player created successfully:', playerData.id);
        }, undefined, (error) => {
            console.error('Error loading player model:', error);
        });
    }

    /**
     * Removes a player from the game
     * 
     * @param {string} playerId - ID of the player to remove
     */
    removeOtherPlayer(playerId) {
        const player = this.otherPlayers.get(playerId);
        if (player) {
            this.scene.remove(player.mesh);
            this.world.removeRigidBody(player.body);
            this.otherPlayers.delete(playerId);
            console.log('Removed other player:', playerId);
        }
    }

    /**
     * Updates the position of another player
     * 
     * @param {Object} playerData - Updated player data
     * @param {string} playerData.id - Player identifier
     * @param {Object} playerData.position - New position
     */
    updateOtherPlayer(playerData) {
        const player = this.otherPlayers.get(playerData.id);
        if (player) {
            const position = playerData.position;
            player.body.setTranslation(new RAPIER.Vector3(position.x, position.y, position.z), true);
        }
    }

    /**
     * Sends the current player's position to the server
     * 
     * @param {Object} position - Current position
     * @param {number} position.x - X coordinate
     * @param {number} position.y - Y coordinate
     * @param {number} position.z - Z coordinate
     */
    sendPlayerUpdate(position) {
        if (this.socket) {
            this.socket.emit('playerUpdate', {
                id: this.playerId,
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                }
            });
        }
    }
}

export default MultiplayerManager; 