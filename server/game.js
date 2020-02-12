const Vector = require('../lib/Vector');

const Terrain = require("./terrain");
const Hero = require("./player");

/**
 *   █████▀█████████████████████
 *   █─▄▄▄▄██▀▄─██▄─▀█▀─▄█▄─▄▄─█
 *   █─██▄─██─▀─███─█▄█─███─▄█▀█
 *   ▀▄▄▄▄▄▀▄▄▀▄▄▀▄▄▄▀▄▄▄▀▄▄▄▄▄▀
 **/
 
class Game {
    constructor() {
        this.lastUpdateTime = 0;
        this.deltaTime = 0;

        this.clients = new Map();
        this.players = new Map();
        
        this.bullets = [];
        this.terrain = new Terrain().generate();
    }
    
    addPlayer(socket, color, spawn) {
        this.clients.set(socket.id, socket);
        this.players.set(socket.id, new Hero(socket.id, color, spawn, this.terrain));
        console.log(this.players);
    }
    
    start(socket, spawn) {
        this.addPlayer(socket, '#000', spawn);
        socket.emit('gameStart', this.terrain);
    }

    removePlayer(socketID) {
        if (this.clients.has(socketID)) {
            this.clients.delete(socketID);
        }
        if (this.players.has(socketID)) {
            this.players.delete(socketID);
        }
    }

    handlePlayerActions(socketID, actions) {
        const player = this.players.get(socketID);
        if (player) {
            player.handleActions(actions);
            if (actions.attack && player.lastUpdateTime > player.shootDelay) {
                const bullet = player.getBulletFromShot();
                this.bullets.push(bullet);
            }
        }
    }

    update() {
        const currentTime = Date.now();
        this.deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        const entities = [
            ...this.players.values(),
            ...this.bullets
        ];

        entities.forEach(entity => {
            entity.update(this.lastUpdateTime, this.deltaTime);
        });

        // for (let i = 0; i < entities.length; ++i) {
            // for (let j = i + 1; j < entities.length; ++j) {
                // let e1 = entities[i];
                // let e2 = entities[j];
                
                // if (!e1.collided(e2)) {
                    // continue;
                // }
            // }
        // }
        
        this.bullets = this.bullets.filter(bullet => {return !bullet.destroyed});
    }

    sendState() {
        const players = [...this.players.values()];
        const bullets = this.bullets;

        this.clients.forEach((client, socketID) => {
            const currentPlayer = this.players.get(socketID);
            this.clients.get(socketID).emit('state', {
                self: currentPlayer,
                players: players,
                bullets: bullets
            })
        })
    }
}

module.exports = Game;
