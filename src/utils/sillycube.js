import * as THREE from 'three';

const sillyCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
sillyCube.position.x = -6;
sillyCube.position.y = 2.5;

export function summonSillyCube(scene) {
    scene.add(sillyCube);
}

export function updateSillyCube(delta) {
    const rotationSpeed = 1.0; // rotations per second
    sillyCube.rotation.x += rotationSpeed * delta;
    sillyCube.rotation.y += rotationSpeed * delta;
}