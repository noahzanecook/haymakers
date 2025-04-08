import { loadTest } from './assets/maps/test.js';
import { loadBarnyard } from './assets/maps/barnyard.js';

export function loadMap(map, scene, world, dynamicBodies, miscBodies, debug) {
    // this function should be expanded to load different maps based on a parameter
    let maps = ['test', 'barnyard']; // array of maps

    // randomly select a map from the array
    if (map === 'test') {
        loadTest(scene, world, dynamicBodies, debug);
    } else if (map === 'barnyard') {
        loadBarnyard(scene, world, dynamicBodies, miscBodies, debug); // loads barnyard map
    } else {
        console.log('Map not found');
    }
}