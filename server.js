const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

/*
We set up a very basic express server. By default, we will serve the index.html page built by our Webpack build on the front end. Anything below dist will be served automatically, so the game JavaScript and assets will be served statically as well.
*/
app.get("/", function(request, response) {
  response.sendFile(__dirname + '/dist/index.html');
});

app.use("/", express.static("dist"));

http.listen(5001, function() {
  console.log('Server ready, listening on *:5001');
})

const players = {};

/*
This is where we set all the events that our server will listen to. It will react like this:

- Is a new user connected? Notify it to the rest of the players to generate it as a new Enemy.

- Is a player disconnected? Notify the rest of the players to destroy this enemy.

Has the player moved? Notify it to the rest of the players so they can update the position of the enemy.

For debugging purposes, we left some logs on these events.
*/
const PLAYER_START_POSITION_X = 600;
const PLAYER_START_POSITION_Y = 500;
let playerCount = 0;
let lastInputs = {};

io.on("connection", function (socket) {
  socket.on("join", function (info) {
    console.log("New player joined with state:", info);
    playerInfo = {};        
    playerInfo.x = PLAYER_START_POSITION_X + playerCount * 100;
    playerInfo.y = PLAYER_START_POSITION_X + playerCount * 100;
    playerInfo.angle = 0;
    playerCount++;
    
    const [name, key] = info.name.split(":");
    playerInfo.id = key;
    players[key] = playerInfo;

    socket.key = key;

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", playerInfo);
  });

  socket.on("input", function (input_data) {
    const key = input_data?.id;
    if (players[key] == undefined) return;
    lastInputs[key] = input_data;

    //socket.broadcast.emit("playerMoved", players[key]);
  });  
});

let frameNumber = 0;
let lastTime = Date.now();

setInterval(function () {
  let now = Date.now();
  let frameData = {};
  frameData.duration = now - lastTime;
  frameData.frameNumber = frameNumber++;
  frameData.inputDatas = [];

  for (let key in lastInputs) {
    let input_data = lastInputs[key];
    let player = players[key];
    if (player == undefined) continue;    
    frameData.inputDatas.push(input_data);
  }

  lastTime = now;
  io.sockets.emit("frameData", frameData);
}, 1000 / 20);
