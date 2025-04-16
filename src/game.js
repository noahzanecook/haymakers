import Player from './utils/player.js';
import { loadTest } from './assets/maps/test.js';
import { loadBarnyard } from './assets/maps/barnyard.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { loadMap } from './mapLoader.js'; // import map loader function

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

        // this.miscBodies = []; // misc objects (e.g. moving platforms)

        this.player = new Player(scene, camera, renderer, world, this.dynamicBodies, this.debug); // player object. later should be able to have multiple players
    }

    loadMap() {
        // this function should be expanded to load different maps based on a parameter
        let maps = ['test', 'barnyard']; // array of maps

        // for now just randomly select map
        let map = maps[Math.floor(Math.random() * maps.length)];

        console.log('Loading map: ', map); // log selected map

        loadMap(map, this.scene, this.world, this.dynamicBodies, this.debug); // loads map mapLoader.js
    }

    update(delta) {
        // update dynamic bodies
        this.dynamicBodies.forEach(([mesh, body]) => {
            const position = body.translation();
            mesh.position.set(position.x, position.y, position.z);
        });

        this.player.update(delta); // update player with delta time
    }
}

export default Game;