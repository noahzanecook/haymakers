import Player from './utils/player.js';
import { loadTest } from './assets/maps/test.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

class Game {
    constructor(scene, camera, renderer, world, debug) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.world = world;
        this.debug = debug;

        if (debug) {
            const controls = new OrbitControls(camera, renderer.domElement); // camera controls for debugging
        }

        this.dynamicBodies = [];

        this.player = new Player(scene, camera, renderer, world, this.dynamicBodies, this.debug);
    }

    loadMap() {
        loadTest(this.scene, this.world, this.dynamicBodies, this.debug);
    }

    update() {
        this.player.update();

        this.dynamicBodies.forEach(([mesh, body]) => {
            const position = body.translation();
            mesh.position.set(position.x, position.y, position.z);
        });
    }
}

export default Game;