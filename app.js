const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);

const Game = require("./server/game.js");

app.set('port', 5000);
app.use('/static', express.static(path.join(__dirname, '/static')));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/index.html'));
});

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
const game = new Game();

io.sockets.on('connection', function(socket) {

    socket.on('newPlayer', spawn => {
        
        game.start(socket, spawn);
        console.log('new player');
        
    });

    socket.on('move', actions => {
        game.handlePlayerActions(socket.id, actions);
    });

    socket.on('disconnect', () => {
        game.removePlayer(socket.id);
    });
});

setInterval(function() {
    game.update();
    game.sendState();
}, 1000 / 60);


//////////////////////////////////////////////////////////////////
server.listen(5000, function() {
    console.log('listening on *:5000');
});