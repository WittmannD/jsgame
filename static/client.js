const io = require('socket.io-client');
const Game = require('./game.js');

document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    const game = new Game(socket);
    game.init();

});
