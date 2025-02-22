import Player from './utils/player.js';

class Game {
    constructor(scene, camera, renderer, world) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.world = world;
        this.player = new Player(scene, camera, renderer, world);
    }

    update() {
        this.player.update();
    }
}

export default Game;