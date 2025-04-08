import RAPIER from '@dimforge/rapier3d-compat';
import { velocityHandler, jumpCheck } from './movement.js';

const keyMap = {};

export const initControls = () => {
    document.addEventListener('keydown', onDocumentKey, false);
    document.addEventListener('keyup', onDocumentKey, false);
};

const onDocumentKey = (e) => {
    keyMap[e.code] = e.type === 'keydown';
};

export const handleMovement = (playerBody) => {
    if (keyMap['KeyW'] || keyMap['ArrowUp']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, -0.5), true);
        velocityHandler(playerBody); // limit speed to 3
    }
    if (keyMap['KeyS'] || keyMap['ArrowDown']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, 0.5), true);
        velocityHandler(playerBody); // limit speed to 3
    }
    if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
        playerBody.applyImpulse(new RAPIER.Vector3(-0.5, 0, 0), true);
        velocityHandler(playerBody); // limit speed to 3
    }
    if (keyMap['KeyD'] || keyMap['ArrowRight']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0.5, 0, 0), true);
        velocityHandler(playerBody); // limit speed to 3
    }
    if (keyMap['Space']) {
        // jump if player is on the ground
        if (jumpCheck(playerBody)) {
            playerBody.applyImpulse(new RAPIER.Vector3(0, 10, 0), true);
        }
    }
};