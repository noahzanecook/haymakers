import * as THREE from 'three';

const sillyCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
sillyCube.position.x = -6;
sillyCube.position.y = 2.5;

export function summonSillyCube(scene) {
    scene.add(sillyCube);
}

export function updateSillyCube() {
    sillyCube.rotation.x += 0.01;
    sillyCube.rotation.y += 0.01;
}