import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export function loadTest(scene, world, dynamicBodies, miscBodies, debug) {

    // light
    const light = new THREE.PointLight(0xffffff, 150, 100, 1.8);
    light.position.set(3, 5, 4);
    scene.add(light);

    // concrete ground
    const ground = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 12), new THREE.MeshStandardMaterial({ color: 0x808080 }));
    ground.position.set(0, -2, -2);
    scene.add(ground);

    // collision for ground
    const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -2, -2)) // .fixed() is not affected by gravity
    const floorShape = RAPIER.ColliderDesc.cuboid(10, 0.5, 6) // parameters of colliderdesc are 1/2 boxgeometry
    world.createCollider(floorShape, floorBody)

    if (debug) {
        // on click block falls
        document.addEventListener('click', () => {
            const block = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
            block.position.set(0, 5, -2);
            const blockBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, -2))
            const blockShape = RAPIER.ColliderDesc.cuboid(5, 0.5, 5)
            world.createCollider(blockShape, blockBody)
            dynamicBodies.push([block, blockBody]) // add to dynamic bodies array
            scene.add(block);
        });
    };
}