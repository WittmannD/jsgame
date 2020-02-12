const Vector = require('../lib/vector');

class HeroClass {
    constructor() {
        this.spells = null;
        this.movementSpeed = null;
        this.nativeDamage = null;
    }
    
    attack() {
        
    }
}


class Warrior extends HeroClass {
    constructor() {
        super();
        this.spells = [];
        this.movementSpeed = 0.12;
        this.nativeDamage = 10;
    }
}

class Rogue extends HeroClass {
    constructor() {
        super();
        this.spells = [];
        this.movementSpeed = 0.12;
        this.nativeDamage = 10;
    }
}

const HeroClasses = {
    warrior: Warrior,
    rogue: Rogue
};

module.exports = HeroClasses;