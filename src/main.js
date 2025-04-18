import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat'
import Stats from 'three/addons/libs/stats.module.js'
import { summonSillyCube, updateSillyCube } from './utils/sillycube.js';
import { initControls } from './utils/controls.js';
import Game from './game.js';



// SET UP
await RAPIER.init(); // necessary for compat version

const world = new RAPIER.World(new THREE.Vector3(0, -9.81, 0)); // world init w/ gravity vector
const scene = new THREE.Scene(); // scene init
scene.background = new THREE.Color(0x2d1f4f); // sky color background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // camera init
camera.position.set(0, 5, 10); // camera position
camera.setRotationFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 6); // camera rotation


const renderer = new THREE.WebGLRenderer({ antialias: true }); // renderer init
renderer.setSize(window.innerWidth, window.innerHeight); // renderer size
renderer.shadowMap.enabled = true; // shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // shadows
document.body.appendChild(renderer.domElement); // append renderer to body

// window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})



// LOOP
summonSillyCube(scene); // use for testing and reference for external functions

const stats = new Stats() // fps counter
document.body.appendChild(stats.dom) // append fps counter to body

let game 
startGame();


initControls(); // controls.js
// const clock = new THREE.Clock()
// let delta

function animate() {

    // delta = clock.getDelta()
    // world.timestep = Math.min(delta, 0.1)
    world.step()

    // handleMovement(playerBody); // controls.js

    game.update(); // game.js

    updateSillyCube(); // cube spin

    renderer.render(scene, camera) // render scene
    stats.update() // update fps counter
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// WebGL Check. Older browsers may not support WebGL 2.0
import WebGL from 'three/addons/capabilities/WebGL.js';

if (WebGL.isWebGL2Available()) {
    renderer.setAnimationLoop(animate);
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById('container').appendChild(warning);
}
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function startGame() {
    game = new Game(scene, camera, renderer, world, false); // set 5th parameter to true for debug mode
    game.loadMap(); // loads /maps/test.js as of rn
    renderer.setAnimationLoop(() => {
        game.update(); // Update game logic
        updateSillyCube(); // Update the spinning cube
        renderer.render(scene, camera); // Render the scene
        stats.update(); // Update FPS counter
    });
    animate();
}