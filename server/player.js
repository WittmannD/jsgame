const Vector = require('../lib/vector');

const Entity = require('./entity');
const Bullet = require('./bullet');

/**
 *   ██████████████████████
 *   █─█─█▄─▄▄─█▄─▄▄▀█─▄▄─█
 *   █─▄─██─▄█▀██─▄─▄█─██─█
 *   ▀▄▀▄▀▄▄▄▄▄▀▄▄▀▄▄▀▄▄▄▄▀
 **/

function Player(socketID, color='#000', spawn, terrain) {
    Entity.call(this);
    this.socketID = socketID;
    this.color = color;
    this.position = new Vector(...spawn);
    this.terrain = terrain;

    this.previousPosition = new Vector(0, 0);
    this.lookAt = new Vector(0, 0);
    this.angle = 0;
    this.direction = [0,0,0,0];
    this.speed = 0.12;
    this.velocity = new Vector(0, 0);
    this.moving = false;

    this.health = 100;
    this.shootDelay = 0;
    this.lastUpdateTime = 0;

}
Player.prototype.handleActions = function(data) {
    let vector = new Vector(0, 0);
    
    data.up && vector.add(new Vector(0, -1));
    data.left && vector.add(new Vector(-1, 0));
    data.down && vector.add(new Vector(0, 1));
    data.right && vector.add(new Vector(1, 0));

    if (!data.up && !data.left && !data.down && !data.right) {
        vector = new Vector(0, 0);
        this.moving = false;
    } else {
        this.moving = true;
    }

    if (this.moving) {
        if (data.up) {
            this.direction[0] = 1;
        } else {
            this.direction[0] = 0;
        }
        
        if (data.left) {
            this.direction[3] = 1;
        } else {
            this.direction[3] = 0;
        }
        
        if (data.down) {
            this.direction[2] = 1;
        } else {
            this.direction[2] = 0;
        }
        
        if (data.right) {
            this.direction[1] = 1;
        } else {
            this.direction[1] = 0;
        }
    }


    this.velocity = vector.scale(this.speed);
    this.lookAt = new Vector(data.mouse.x, data.mouse.y);
};
Player.prototype.getAngle = function() {
    return Vector.sub(this.lookAt, this.position).angle
};
Player.prototype.getBulletFromShot = function() {
    const bullet = new Bullet(this, this.terrain);
    this.shootDelay = this.lastUpdateTime + 200;

    return bullet;
};
Player.prototype.update = function(lastUpdateTime, deltaTime) {
    this.lastUpdateTime = lastUpdateTime;

    const step = Vector.scale(this.velocity, deltaTime);

    const newPosition = Vector.add(this.position, step);

    if (this.terrain.checkObjectCollision(new Vector(newPosition.x, this.position.y), this.size)) {
        step.x = 0;
    }
    if (this.terrain.checkObjectCollision(new Vector(this.position.x, newPosition.y), this.size)) {
        step.y = 0;
    }

    this.position.add(step);

    this.angle = this.getAngle()
};

module.exports = Player;