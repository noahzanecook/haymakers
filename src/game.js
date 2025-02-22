import Player from './utils/player.js';
import { loadTest } from './assets/maps/test.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

class Game {
    constructor(scene, camera, renderer, world, debug) {
        this.scene = scene; // three.js scene
        this.camera = camera; // three.js camera
        this.renderer = renderer; // three.js renderer
        this.world = world; // rapier physics world
        this.debug = debug; // boolean - debug mode

        if (debug) {
            const debugCamera = new OrbitControls(camera, renderer.domElement); // camera controls for debugging
        }

        this.dynamicBodies = []; // array for mapping three.js models to rapier physics bodies

        this.player = new Player(scene, camera, renderer, world, this.dynamicBodies, this.debug); // player object. later should be able to have multiple players
    }

    loadMap() {
        loadTest(this.scene, this.world, this.dynamicBodies, this.debug);
        // loads test map (/maps/test.js) for time being
        // this function should be expanded to load different maps based on a parameter
    }

    update() {
        this.player.update(); // update player

        // update dynamic bodies
        this.dynamicBodies.forEach(([mesh, body]) => {
            const position = body.translation();
            mesh.position.set(position.x, position.y, position.z);
        });
    }
}

export default Game;