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

        this.dynamicBodies = dynamicBodies; // array for mapping three.js models to rapier physics bodies

        const loader = new GLTFLoader(); // three.js gltf model loader
        loader.load('/src/assets/meshes/test.glb', (gltf) => {
            // place the player model in the scene
            this.mesh = gltf.scene;
            this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            this.mesh.scale.set(1.2, 1.2, 1.5);
            this.mesh.castShadow = true;
            this.scene.add(this.mesh);

            // Create player physics body
            const playerCollider = RAPIER.ColliderDesc.cuboid(0.5, 1, 0.5); // if you move to much this falls over
            const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1, -2);
            this.body = this.world.createRigidBody(playerBodyDesc);
            const collider = this.world.createCollider(playerCollider, this.body);

            this.dynamicBodies.push([this.mesh, this.body]) // add to dynamic bodies array

            if (debug) {
                // wireframe of the mesh (white)
                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        const edges = new THREE.EdgesGeometry(child.geometry);
                        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
                        child.add(line);
                    }
                });

                // collider box outline (red)
                const geometry = new THREE.BoxGeometry(1, 2, 1); // Match the dimensions of the collider
                const wireframe = new THREE.WireframeGeometry(geometry);
                const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0xff0000 }));
                this.scene.add(line);
                this.bodyOutline = line;
            }
        });
    }

    update() {
        // controls
        if (this.awake) {
            handleMovement(this.body);
        }

        if (this.mesh) {
            this.mesh.position.y -= 1;

            // update the position of the collider box outline for debugging
            if (this.bodyOutline) {
                const position = this.body.translation();
                this.bodyOutline.position.set(position.x, position.y, position.z);
            }
        }
    }
}

export default Player;