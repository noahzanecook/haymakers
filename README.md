# Haymakers
Multiplayer ragdoll-fighting game using Threejs.org and Rapier.rs
## Set-up
*Make sure you have Node.js installed https://nodejs.org/*
*Clone this repository to your system*
### For singleplayer testing
- Make your terminal working directory the folder containing the project files (\file\location\haymakers)
- Install the node modules with `npm install`
- Provided there are no errors, you should now be able to run a localhost using `npm run dev`

**You will get recurring CORS request errors since you didn't do npm start, but this can be used when you don't need multiple players**

### For multiplayer testing
- Make your terminal working directory the folder containing the project files (\file\location\haymakers)
- Install the node modules with `npm install`
- Provided there are no errors, you should start the node server with `npm start`
- Provided there are no errors, you should now be able to run a localhost using `npm run dev`

**Now when you open multiple localhost tabs you will be seeing multiple players across the clients**

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
│   │   ├── multiplayer.js          -- multiplayer synchronization
│   │   ├── player.js               -- player class
│   │   └── sillycube.js            -- testing file
│   ├── game.js                     -- game class (round)
│   ├── main.js                     -- main file
│   └── mapLoader.js                -- map loading
├── index.html                      *
├── package.json                    *
├── README.md                       -- what you are reading*
└── server.js                       -- manages socket.io connections
</pre>
