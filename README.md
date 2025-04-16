# Haymakers
Multiplayer ragdoll-fighting game using Threejs.org and Rapier.rs
## Set-up
*Make sure you have Node.js installed https://nodejs.org/*
- Clone this repository to your system
- Make your terminal working directory the folder containing the project files
- Install the node modules with `npm install`
- Provided there are no errors, you should now be able to run a localhost using `npx vite`
## Project Structure
<pre>
Project
├── public/                         -- public folder
├── src/                            -- source code
│   ├── assets/                     *
│   │   ├── audio/                  *
│   │   ├── images/                 *
│   │   ├── maps/                   -- map files
│   │   └── meshes/                 *
│   ├── utils/                      -- code stuff
│   │   ├── controls.js             -- input handling
│   │   ├── movement.js             -- movement handling
│   │   ├── player.js               -- player class
│   │   └── sillycube.js            -- testing file
│   ├── game.js                     -- game class (round)
│   ├── main.js                     -- main file
│   └── mapLoader.js                -- map loading
├── index.html                      *
├── package.json                    *
└── README.md                       -- what you are reading
</pre>
