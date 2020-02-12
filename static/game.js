const Util = require('../lib/Util');
const Vector = require('../lib/Vector');

const Input = require('./Input');
const Menu = require('./Menu');
const Drawing = require('./Drawing');

const _c = {
    dom: document.getElementById('console'),
    log: [],
    logLimit: 20,
    print: function(...messages) {
        this.log.push(...messages);
        
        while (this.log.length > this.logLimit) {
            this.log.shift();
        }
        
        this.dom.innerText = this.log.join('\n');
    }
};
        
const dpi = 64;


class Canvas {
    //this.width = parseInt(window.innerWidth / dpi) * dpi;
    constructor() {
        this.width = 1024;
        this.height = 640;
        this.center = new Vector(this.width / 2, this.height / 2);

        this.layers = {};
        this.buffer = {};
    }

    init() {
        const wrapper = document.getElementById('game');
        const keys = ['back', 'main', 'front'];
        
        for (let key of keys) {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', this.width);
            canvas.setAttribute('height', this.height);
            canvas.setAttribute('id', key);
            
            const buffer = document.createElement('canvas');
            buffer.setAttribute('width', 1280);
            buffer.setAttribute('height', 1280);
            
            this.layers[key] = canvas.getContext('2d');
            this.buffer[key] = buffer.getContext('2d');
            
            wrapper.appendChild(canvas);
        }
        
        this.dom = wrapper;
        
        return this;
    }
}

class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        
        this.playerPosition = Vector.zero();
        this.center = canvas.center;
        
        this.rectCoords = [
            Vector.zero(),
            Vector.zero()
        ];
        
        this.width = 324;
        this.height = 200;
        
        this.offsetX = this.center.x - this.width / 2;
        this.offsetY = this.center.y - this.height / 2;
        
        this.position = this.center.neg;
        this.velocity = Vector.zero();
    }
    
    updateTrackingPosition(player) {
        this.playerPosition = this.position;
        
        if (player.position.x >= this.position.x + this.canvas.width - this.offsetX) {
            this.playerPosition.x = player.position.x - (this.canvas.width - this.offsetX); 
        }

        if (player.position.y >= this.position.y + this.canvas.height - this.offsetY) {
            this.playerPosition.y = player.position.y - (this.canvas.height - this.offsetY); 
        }

        if (player.position.x <= this.position.x + this.offsetX) {
            this.playerPosition.x = player.position.x - this.offsetX;
        }

        if (player.position.y <= this.position.y + this.offsetY) {
            this.playerPosition.y = player.position.y - this.offsetY;
        }
        
        this.rectCoords[0] = new Vector(this.position.x + this.offsetX, this.position.y + this.offsetY);
        this.rectCoords[1] = new Vector(this.position.x + this.canvas.width - this.offsetX, this.position.y + this.canvas.height - this.offsetY);
        
    }
    
    relativeCoords(position) {
        return Vector.sub(position, this.position);
    }
    
    relativeMouseCoords(position) {
        return new Vector(position[0], position[1]).add(this.position);
    }
    
    update() {
        this.velocity = Vector.sub(this.playerPosition, this.position).scale(0.2);
        
        this.position.add(this.velocity);
    }
}

// function Hero(player) {
    // this.position = player.position;
    // this.width = 16;
    // this.height = 32;
    // this.angle = Util.radiansToDegrees(player.angle + 22.5 * Math.PI / 180);
    
    // const index = parseInt(angle / 45);
    
    // this.update = (lastUpdateTime) => {
        
    // };
    // this.draw({
        // sprite:             'warrior',
        // position:           new Vector(hero.position.x, hero.position.y - 16),
        // width:              16,
        // height:             32,
        // dPosition:          new Vector(hero.moving ? ((Math.round(hero.lastUpdateTime) % 2 + 1) * 16) : 0, index*32)
    // });
// }

class Game {
    constructor(socket) {
        this.socket = socket;

        this.canvas = new Canvas().init();
        this.viewport = new Viewport(this.canvas);
        this.drawing = new Drawing(this.canvas, this.viewport).init();
        this.input = new Input(this.canvas.dom).init();
        
        this.menu = new Menu(this.canvas, this.drawing, this.input, this.socket).create();
        
        this.gameAnimationFrameId = 0;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;

        this.terrain = [];
        this.players = 0;
        this.self = 0;
        this.bullets = 0;
        
        this.terrainWasDrawn = false;
    }

    init() {
        this.socket.on('state', this.setState.bind(this));
        this.socket.on('gameStart', (terrain) => {
            this.setTerrainData(terrain);
            this.start();
            this.menu.close();
        })
    }

    setState(state) {
        this.self = state.self;
        this.players = state.players;
        this.bullets = state.bullets;

        this.viewport.updateTrackingPosition(state.self);
    }
    
    setTerrainData(terrain) {
        this.terrain = this.drawing.getTerrainData(terrain);
    }

    start() {
        this.run();
    }

    run() {
        const currentTime = Date.now();
        this.deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        this.update();
        this.draw();
        this.gameAnimationFrameId = window.requestAnimationFrame(this.run.bind(this));
    }

    update() {
        
        
        if (this.self) {
            this.viewport.update();
            
            this.socket.emit('move', {
                up: this.input.up,
                down: this.input.down,
                left: this.input.left,
                right: this.input.right,
                attack: this.input.mouseDown,
                mouse: this.viewport.relativeMouseCoords(this.input.mouseCoords)
            });
        }
        
    }

    draw() {
        this.drawing.clear();
        
        this.players && this.players.forEach(hero => this.drawing.hero(hero, this.lastUpdateTime));
        this.bullets && this.bullets.forEach(bullet => this.drawing.bullet(bullet));
        
        this.terrain && this.drawing.drawTerrainData(this.terrain);
        
        // this.drawing.draw({
            // stroke: 'red',
            // position: this.viewport.rectCoords[0],
            // width: this.viewport.rectCoords[1].x - this.viewport.rectCoords[0].x,
            // height: this.viewport.rectCoords[1].y - this.viewport.rectCoords[0].y
        // });
    }
}

module.exports = Game;
