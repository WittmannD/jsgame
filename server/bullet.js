const Vector = require('../lib/Vector');

const Entity = require('./entity');

/**
 *   ██████████████████████████████████████
 *   █▄─▄─▀█▄─██─▄█▄─▄███▄─▄███▄─▄▄─█─▄─▄─█
 *   ██─▄─▀██─██─███─██▀██─██▀██─▄█▀███─███
 *   ▀▄▄▄▄▀▀▀▄▄▄▄▀▀▄▄▄▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▀▄▄▄▀▀
 **/

function Bullet(source, terrain) {
    Entity.call(this);
    this.terrain = terrain;

    this.position = Vector.add(source.position, new Vector(source.size / 2, source.size / 2));
    this.angle = Vector.sub(source.lookAt, this.position).angle;

    this.total = Vector.zero();
    this.size = 5;
    this.speed = 0.4;
    this.velocity = Vector.fromPolar(this.speed, this.angle);
}
Bullet.prototype.update = function(lastUpdateTime, deltaTime) {
    const step = Vector.scale(this.velocity, deltaTime);

    if (this.total.mag2 > 1024*768) {
        this.destroyed = true;
    }

    const newPosition = Vector.add(this.position, step);

    if (!this.terrain.checkObjectCollision(newPosition, this.size)) {
        this.position.add(step);
        this.total.add(step)
    } else {
        this.destroyed = true;
    }
};

module.exports = Bullet;