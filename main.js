import * as THREE from 'three';

// setup
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

// ambient lighting that lowk doesn';t work
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// concrete ground
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/images/concrete.jpg');
const ground = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 6), new THREE.MeshStandardMaterial({ map: texture }));
ground.position.y = -2;
ground.position.z = -2;
scene.add(ground);

// player
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshNormalMaterial()); // player cube
player.position.z = -2;
scene.add(player);

// movement for cube; not player (and not good implementation)
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            sillyCube.position.y += 0.1;
            break;
        case 's':
            sillyCube.position.y -= 0.1;
            break;
        case 'a':
            sillyCube.position.x -= 0.1;
            break;
        case 'd':
            sillyCube.position.x += 0.1;
            break;
    }
});

// animate
function animate() {
    sillyCube.rotation.x += 0.01;
    sillyCube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

// WebGL Check. Older browsers may not support WebGL 2.
import WebGL from 'three/addons/capabilities/WebGL.js';

if (WebGL.isWebGL2Available()) {
    renderer.setAnimationLoop(animate);
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById('container').appendChild(warning);
}
