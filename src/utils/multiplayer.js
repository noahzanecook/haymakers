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
 * - Animation state synchronization
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
                },
                animationState: 'idle'
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
        loader.load('/src/assets/meshes/RobotExpressive.glb', (gltf) => {
            // set up visual representation
            const mesh = gltf.scene;
            mesh.scale.set(.5, .5, .5);
            mesh.castShadow = true;
            this.scene.add(mesh);

            // Set up animations
            const mixer = new THREE.AnimationMixer(mesh);
            const actions = {};
            
            // Create actions for all animations
            for (let i = 0; i < gltf.animations.length; i++) {
                const clip = gltf.animations[i];
                const action = mixer.clipAction(clip);
                actions[clip.name] = action;
                
                // Set up one-time animations
                if (['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'].includes(clip.name)) {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }

            // Start with idle animation
            if (actions['Idle']) {
                actions['Idle'].play();
            }

            // set up physics representation
            const playerCollider = RAPIER.ColliderDesc.cuboid(.63, .63, .63);
            const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(playerData.position.x, playerData.position.y, playerData.position.z);
            const body = this.world.createRigidBody(playerBodyDesc);
            const collider = this.world.createCollider(playerCollider, body);

            // store references
            this.dynamicBodies.push([mesh, body]);
            this.otherPlayers.set(playerData.id, { 
                mesh, 
                body,
                mixer,
                actions,
                currentAnimation: 'Idle'
            });
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
            // Update position
            const position = playerData.position;
            player.body.setTranslation(new RAPIER.Vector3(position.x, position.y, position.z), true);

            // Update animation if changed
            if (playerData.animationState && playerData.animationState !== player.currentAnimation) {
                // Convert animation state to proper case (e.g., 'walking' to 'Walking')
                const animationName = playerData.animationState.charAt(0).toUpperCase() + playerData.animationState.slice(1);
                this.fadeToAction(player, animationName);
                player.currentAnimation = animationName;
            }

            // Update rotation if moving
            if (playerData.rotation !== undefined) {
                player.mesh.rotation.y = playerData.rotation;
            }
        }
    }

    fadeToAction(player, name, duration = 0.5) {
        if (!player.actions[name]) {
            console.warn(`Animation ${name} not found for remote player`);
            return;
        }

        const previousAction = player.actions[player.currentAnimation];
        if (previousAction) {
            previousAction.fadeOut(duration);
        }

        const newAction = player.actions[name];
        newAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

        // Handle one-time animations
        if (['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'].includes(name)) {
            const restoreState = () => {
                player.mixer.removeEventListener('finished', restoreState);
                if (previousAction) {
                    this.fadeToAction(player, previousAction._clip.name, duration);
                }
            };
            player.mixer.addEventListener('finished', restoreState);
        }
    }

    // Add update method to process animation frames
    update(delta) {
        // Update all remote players' animations
        this.otherPlayers.forEach(player => {
            if (player.mixer) {
                player.mixer.update(delta);
            }
        });
    }

    /**
     * Sends the current player's position to the server
     * 
     * @param {Object} position - Current position
     * @param {number} position.x - X coordinate
     * @param {number} position.y - Y coordinate
     * @param {number} position.z - Z coordinate
     */
    sendPlayerUpdate(position, animationState, rotation) {
        if (this.socket) {
            this.socket.emit('playerUpdate', {
                id: this.playerId,
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                },
                animationState,
                rotation
            });
        }
    }
}

export default MultiplayerManager; 