import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { handleMovement } from './controls';

class Player {
    constructor(scene, camera, renderer, world) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.world = world;

        // Create player mesh
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshNormalMaterial());
        this.mesh.position.y = 1;
        this.mesh.position.z = -2;
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Create player physics body
        const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 1, 0.5);
        const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1, -2);
        this.body = this.world.createRigidBody(playerBodyDesc);
        this.world.createCollider(playerColliderDesc, this.body);

        // Array to store dynamic bodies
        this.dynamicBodies = [];
        this.dynamicBodies.push([this.mesh, this.body]);
    }

    update() {
        // Update dynamic bodies positions
        handleMovement(this.body);

        this.dynamicBodies.forEach(([mesh, body]) => {
            const position = body.translation();
            mesh.position.set(position.x, position.y, position.z);
        });
    }
}

export default Player;