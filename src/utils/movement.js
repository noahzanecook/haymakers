import * as RAPIER from '@dimforge/rapier3d-compat';

export const velocityHandler = (playerBody) => {
    const velocity = playerBody.linvel(); // get velocity

    // limit speed to 3
    if (velocity.x > 3) {
        playerBody.setLinvel(new RAPIER.Vector3(3, velocity.y, velocity.z));
    }
    if (velocity.x < -3) {
        playerBody.setLinvel(new RAPIER.Vector3(-3, velocity.y, velocity.z));
    }
    if (velocity.z > 3) {
        playerBody.setLinvel(new RAPIER.Vector3(velocity.x, velocity.y, 3));
    }
    if (velocity.z < -3) {
        playerBody.setLinvel(new RAPIER.Vector3(velocity.x, velocity.y, -3));
    }

    // if player is moving in two directions, limit speed to 3
    if (velocity.x > 2.12132 && velocity.z > 2.12132) {
        playerBody.setLinvel(new RAPIER.Vector3(2.12132, velocity.y, 2.12132));
    }
    if (velocity.x < -2.12132 && velocity.z > 2.12132) {
        playerBody.setLinvel(new RAPIER.Vector3(-2.12132, velocity.y, 2.12132));
    }
    if (velocity.x > 2.12132 && velocity.z < -2.12132) {
        playerBody.setLinvel(new RAPIER.Vector3(2.12132, velocity.y, -2.12132));
    }
    if (velocity.x < -2.12132 && velocity.z < -2.12132) {
        playerBody.setLinvel(new RAPIER.Vector3(-2.12132, velocity.y, -2.12132));
    }
}

// rewrite to check if player is on the ground
export const jumpCheck = (playerBody) => {
    const velocity = playerBody.linvel();
    return (Math.abs(velocity.y) < 0.1)
}