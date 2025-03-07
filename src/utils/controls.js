import RAPIER from '@dimforge/rapier3d-compat';

const keyMap = {};

export const initControls = () => {
    document.addEventListener('keydown', onDocumentKey, false);
    document.addEventListener('keyup', onDocumentKey, false);
};

const onDocumentKey = (e) => {
    keyMap[e.code] = e.type === 'keydown';
};

const velocityHandler = (playerBody) => {
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
const jumpCheck = (playerBody) => {
    const velocity = playerBody.linvel();
    return (Math.abs(velocity.y) < 0.1)
}

export const handleMovement = (playerBody) => {
    if (keyMap['KeyW'] || keyMap['ArrowUp']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, -0.5), true);
        velocityHandler(playerBody);
    }
    if (keyMap['KeyS'] || keyMap['ArrowDown']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, 0.5), true);
        velocityHandler(playerBody);
    }
    if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
        playerBody.applyImpulse(new RAPIER.Vector3(-0.5, 0, 0), true);
        velocityHandler(playerBody);
    }
    if (keyMap['KeyD'] || keyMap['ArrowRight']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0.5, 0, 0), true);
        velocityHandler(playerBody);
    }
    if (keyMap['Space']) {
        if (jumpCheck(playerBody)) {
            playerBody.applyImpulse(new RAPIER.Vector3(0, 10, 0), true);
        }
    }
};