const Vector = require('../lib/Vector');

function Entity() {
    this.position = Vector.zero();
    this.size = 16;
    this.destroyed = false;
    
    this.collided = function(other) {
        return (
            (this.position.y <= (other.position.y + other.size) &&
                (this.position.y + this.size) >= other.position.y) &&
            (this.position.x <= (other.position.x + other.size) &&
                (this.position.x + this.size) >= other.position.x)
        );
    };
}

module.exports = Entity;