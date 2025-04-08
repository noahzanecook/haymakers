import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export function loadBarnyard(scene, world, dynamicBodies, miscBodies, debug) {

    scene.background = new THREE.Color(0x4488FF); // barnyard color

    // light
    const light = new THREE.PointLight(0xffffff, 10000, 100, 1.8);
    light.position.set(3, 50, 40);
    scene.add(light);

    // concrete ground
    const ground = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 12), new THREE.MeshStandardMaterial({ color: 0x11FF11 }));
    ground.position.set(0, -2, -2);
    scene.add(ground);

    // collision for ground
    const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -2, -2)) // .fixed() is not affected by gravity
    const floorShape = RAPIER.ColliderDesc.cuboid(10, 0.5, 6) // parameters of colliderdesc are 1/2 boxgeometry
    world.createCollider(floorShape, floorBody)

    // barnyard fence
    const fenceGeometry1 = new THREE.BoxGeometry(0.2, 1, 10);
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const fence1 = new THREE.Mesh(fenceGeometry1, fenceMaterial);
    fence1.position.set(-9, -1, -2);
    scene.add(fence1);

    const fenceGeometry2 = new THREE.BoxGeometry(10, 1, .2);
    const fence2 = new THREE.Mesh(fenceGeometry2, fenceMaterial);
    fence2.position.set(-4, -1, -7);
    scene.add(fence2);

    // collision for fence
    const fenceBody1 = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(-9, -1, -2)) // .fixed() is not affected by gravity
    const fenceShape1 = RAPIER.ColliderDesc.cuboid(0.1, 0.5, 5) // parameters of colliderdesc are 1/2 boxgeometry
    world.createCollider(fenceShape1, fenceBody1)

    const fenceBody2 = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(-4, -1, -7)) // .fixed() is not affected by gravity
    const fenceShape2 = RAPIER.ColliderDesc.cuboid(5, 0.5, 0.1) // parameters of colliderdesc are 1/2 boxgeometry
    world.createCollider(fenceShape2, fenceBody2)

    // tried to make moving platform will revisit if time
    /* moving platform (put it in the miscBodies array)
    const platformGeometry = new THREE.BoxGeometry(5, .2, 5);
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(5, 0, 0);
    scene.add(platform);

    const platformBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(5, 0, 0)) // .fixed() is not affected by gravity
    const platformShape = RAPIER.ColliderDesc.cuboid(2.5, 0.1, 2.5) // parameters of colliderdesc are 1/2 boxgeometry
    world.createCollider(platformShape, platformBody)

    miscBodies.push((platform, platformBody, 2, platform.position, 2, 2, 0)); // add platform to miscBodies array */
}