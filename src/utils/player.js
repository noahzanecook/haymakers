import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { handleMovement } from './controls';

class Player {
    constructor(scene, camera, renderer, world, dynamicBodies, debug) {
        this.scene = scene; // three.js scene
        this.camera = camera; // three.js camera
        this.renderer = renderer; // three.js renderer
        this.world = world; // rapier physics world
        this.awake = true // state of whether player can act
        this.mixer = null; // animation mixer
        this.actions = {}; // animation actions
        this.activeAction = null; // current animation action
        this.previousAction = null; // previous animation action
        this.clock = new THREE.Clock(); // animation clock
        this.body = null; // physics body
        this.mesh = null; // 3D model
        this.currentAnimationState = 'idle'; // track current animation state

        this.dynamicBodies = dynamicBodies; // array for mapping three.js models to rapier physics bodies

        const loader = new GLTFLoader(); // three.js gltf model loader
        loader.load('/src/assets/meshes/RobotExpressive.glb', (gltf) => {
            // place the player model in the scene
            this.mesh = gltf.scene;
            this.mesh.scale.set(.5,.5,.5);
            this.mesh.castShadow = true;
            this.scene.add(this.mesh);

            // Set up animations
            this.mixer = new THREE.AnimationMixer(this.mesh);
            
            // Create actions for all animations
            for (let i = 0; i < gltf.animations.length; i++) {
                const clip = gltf.animations[i];
                const action = this.mixer.clipAction(clip);
                this.actions[clip.name] = action;
                
                // Set up one-time animations
                if (['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'].includes(clip.name)) {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }

            // Start with idle animation
            if (this.actions['Idle']) {
                this.activeAction = this.actions['Idle'];
                this.activeAction.play();
                this.currentAnimationState = 'idle';
            }

            // Create player physics body
            const playerCollider = RAPIER.ColliderDesc.cuboid(.63, .63, .63);
            const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1, -2);
            this.body = this.world.createRigidBody(playerBodyDesc);
            const collider = this.world.createCollider(playerCollider, this.body);

            this.dynamicBodies.push([this.mesh, this.body]);
        });
    }

    update() {
        // controls
        if (this.awake && this.body) {
            const movementState = handleMovement(this.body);
            
            // Handle animations based on movement state
            if (this.mesh && this.mixer) {
                let targetAnimation = 'Idle';
                
                if (movementState.isPunching) {
                    targetAnimation = 'Punch';
                } else if (movementState.isJumping) {
                    targetAnimation = 'Jump';
                } else if (movementState.isMoving) {
                    targetAnimation = 'Walking';
                }

                // Only change animation if the state has changed
                if (targetAnimation.toLowerCase() !== this.currentAnimationState) {
                    this.currentAnimationState = targetAnimation.toLowerCase();
                    if (targetAnimation === 'Jump' || targetAnimation === 'Punch') {
                        this.playEmote(targetAnimation);
                    } else {
                        this.fadeToAction(targetAnimation);
                    }
                }

                // Rotate the character to face movement direction
                if (movementState.isMoving) {
                    const angle = Math.atan2(movementState.direction.x, movementState.direction.z);
                    this.mesh.rotation.y = angle;
                }
            }
        }

        if (this.mesh && this.mixer) {
            // Update animations
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }
    }

    // Helper method to change animations
    fadeToAction(name, duration = 0.5) {
        if (!this.actions[name]) return;

        if (this.activeAction) {
            this.previousAction = this.activeAction;
            this.previousAction.fadeOut(duration);
        }

        this.activeAction = this.actions[name];
        this.activeAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();
    }

    // Helper method to play one-time animations
    playEmote(name, duration = 0.2) {
        if (!this.actions[name]) return;

        this.fadeToAction(name, duration);
        
        // Restore previous action when emote finishes
        const restoreState = () => {
            this.mixer.removeEventListener('finished', restoreState);
            if (this.previousAction) {
                this.fadeToAction(this.previousAction._clip.name, duration);
            }
        };
        
        this.mixer.addEventListener('finished', restoreState);
    }
}

export default Player;