import RAPIER from '@dimforge/rapier3d-compat';

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
    }
    if (keyMap['KeyS'] || keyMap['ArrowDown']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0, 0, 0.5), true);
    }
    if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
        playerBody.applyImpulse(new RAPIER.Vector3(-0.5, 0, 0), true);
    }
    if (keyMap['KeyD'] || keyMap['ArrowRight']) {
        playerBody.applyImpulse(new RAPIER.Vector3(0.5, 0, 0), true);
    }
    if (keyMap['Space']) {
        if (playerBody.translation().y <= 1) {
            playerBody.applyImpulse(new RAPIER.Vector3(0, 5, 0), true);
        }
    }
};