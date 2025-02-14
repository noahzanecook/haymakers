import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat'
import Stats from 'three/addons/libs/stats.module.js'

// physics setup
await RAPIER.init();
const gravity = new THREE.Vector3(0, -9.81, 0);
const world = new RAPIER.World(gravity);

// three-js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// integral to game functionality do not remove
const sillyCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
sillyCube.position.x = -6;
sillyCube.position.y = 2.5;
scene.add(sillyCube);

/* ambient lighting (so ground isn't pitch black)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight); */

// white spotlight shining from the side, modulated by a texture, casting a shadow
const light = new THREE.PointLight( 0xffffff, 15, 100, 1.8);
light.position.set(3, 5, 4);
scene.add( light );

// resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

// concrete ground
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/images/concrete.jpg');
const ground = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 6), new THREE.MeshStandardMaterial({ map: texture }));
ground.position.y = -2;
ground.position.z = -2;
scene.add(ground);

/* const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 100), new THREE.MeshPhongMaterial())
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh) */

const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -2, -2)) // translation to equal three.js pos
const floorShape = RAPIER.ColliderDesc.cuboid(5, 0.5, 3) // parameters of colliderdesc are 1/2 boxgeometry
world.createCollider(floorShape, floorBody)

// fps
const stats = new Stats()
document.body.appendChild(stats.dom)

// player
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshNormalMaterial()); // player cube
player.position.y = 1;
player.position.z = -2;
player.castShadow = true;
scene.add(player);

// Create player physics body
const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 1, 0.5);
const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1, -2);
const playerBody = world.createRigidBody(playerBodyDesc);
world.createCollider(playerColliderDesc, playerBody);

// Array to store dynamic bodies
const dynamicBodies = [];
dynamicBodies.push([player, playerBody]);

// movement
const keyMap = {};
const onDocumentKey = (e) => {
    keyMap[e.code] = e.type === 'keydown';
};
document.addEventListener('keydown', onDocumentKey, false)
document.addEventListener('keyup', onDocumentKey, false)

// stuff
const clock = new THREE.Clock()
let delta

// animate
function animate() {
    // requestAnimationFrame(animate)

    delta = clock.getDelta()
    // world.timestep = Math.min(delta, 0.1)
    world.step()

    if (keyMap['KeyW'] || keyMap['ArrowUp']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, -.5), true);
        // playerBody.applyImpulse(new RAPIER.Vector3(0, 0, -5 * delta), true);
        // delta barely moves it. i think there needs to be an offset https://rapier.rs/docs/user_guides/javascript/character_controller/
    }
    if (keyMap['KeyS'] || keyMap['ArrowDown']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, .5), true);
    }
    if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
        playerBody.applyImpulse(new RAPIER.Vector3(-.5, 0, 0), true);
    }
    if (keyMap['KeyD'] || keyMap['ArrowRight']) {
        playerBody.applyImpulse(new RAPIER.Vector3(.5, 0, 0), true);
    }
    if (keyMap['Space']) {
        if (playerBody.translation().y <= 1) { // doesn't prevent double jump, find a way to do that
            playerBody.applyImpulse(new RAPIER.Vector3(0, 5, 0), true);
        }
    }

    // Update dynamic bodies positions
    dynamicBodies.forEach(([mesh, body]) => {
        const position = body.translation();
        mesh.position.set(position.x, position.y, position.z);
    });

    sillyCube.rotation.x += 0.01;
    sillyCube.rotation.y += 0.01;

    // controls.update() 
    renderer.render(scene, camera)
    stats.update()
}

// WebGL Check. Older browsers may not support WebGL 2.
import WebGL from 'three/addons/capabilities/WebGL.js';

if (WebGL.isWebGL2Available()) {
    renderer.setAnimationLoop(animate);
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById('container').appendChild(warning);
}

animate();