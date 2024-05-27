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

/*
This is where we set all the events that our server will listen to. It will react like this:

- Is a new user connected? Notify it to the rest of the players to generate it as a new Enemy.

- Is a player disconnected? Notify the rest of the players to destroy this enemy.

Has the player moved? Notify it to the rest of the players so they can update the position of the enemy.

For debugging purposes, we left some logs on these events.
*/
let playerCount = 0;
let lastInputs = {};
let isStarted = false;
const players = {};

// predefined game info
// this will be set when gameserver is assigned
// but for now, we will use this as a default value
let gameInfo = {
  type: "ONLINE_PVP",
  name: "default game",
  playerStartingInfos: [
    {
      playerId: "player1",
      name: "player1",
      x: 600,
      y: 500,
      angle: 0,
    },
    {
      playerId: "player2",
      name: "player2",
      x: 700,
      y: 600,
      angle: 0,
    },
  ],
};

io.on("connection", function (socket) {
  socket.on("join", function (info) {
    console.log("New player joined with state:", info);
    const [name, key] = info.name.split(":");
    let oldPlayerId = gameInfo.playerStartingInfos[playerCount].playerId;
    gameInfo.playerStartingInfos[playerCount].playerId = key;
    players[key] = true;
    playerCount++;

    socket.key = key;

    socket.emit("initGame", gameInfo);
    socket.broadcast.emit("newPlayer", {
      oldPlayerId: oldPlayerId,
      newPlayerId: key,
    });

    if (playerCount == 2) {
      // every players are connected
      io.sockets.emit("allJoin");
      setTimeout(() => {
        io.sockets.emit("startGame");
        isStarted = true;    
      }, 3000);
    }
  });

  socket.on("input", function (input_data) {
    const key = input_data?.id;
    if (!players[key]) return;
    lastInputs[key] = input_data;
  });  

  socket.on("disconnect", function (reason) {
    console.log("Player disconnected:", socket.key);
    delete players[socket.key];
    delete lastInputs[socket.key];
    io.sockets.emit("removePlayer", socket.key);
  });
});

let frameNumber = 0;
let lastTime = Date.now();

setInterval(function () {
  if (!isStarted) return;
  let now = Date.now();
  let frameData = {};
  frameData.duration = now - lastTime;
  frameData.frameNumber = frameNumber++;
  frameData.inputDatas = [];

  for (let key in lastInputs) {
    let input_data = lastInputs[key];
    if (!players[key]) continue;    
    frameData.inputDatas.push(input_data);
  }

  lastTime = now;
  io.sockets.emit("frameData", frameData);
}, 1000 / 20);
