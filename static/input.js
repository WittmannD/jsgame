function Input(element) {
    this.element = element;
    
    this.pressedKey = null;
    
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    
    this.mouseDown = false;
    this.mouseCoords = [];
    
    this.keyCodes = {
        left: 65,
        up: 87,
        right: 68,
        down: 83
    }
}
Input.prototype.onKeyDown = function(e) {
    this.pressedKey = e.keyCode;
    switch (e.keyCode) {
        case this.keyCodes.up:
            this.up = true;
            break;
        case this.keyCodes.down:
            this.down = true;
            break;
        case this.keyCodes.left:
            this.left = true;
            break;
        case this.keyCodes.right:
            this.right = true;
            break;
    }
};
Input.prototype.onKeyUp = function(e) {
    this.pressedKey = null;
    switch (e.keyCode) {
        case this.keyCodes.up:
            this.up = false;
            break;
        case this.keyCodes.down:
            this.down = false;
            break;
        case this.keyCodes.left:
            this.left = false;
            break;
        case this.keyCodes.right:
            this.right = false;
            break;
    }
};
Input.prototype.onMouseDown = function() {
    this.mouseDown = true;
};
Input.prototype.onMouseUp = function() {
    this.mouseDown = false;
};
Input.prototype.onMouseMove = function(e) {
    this.mouseCoords = [e.offsetX || e.layerX, e.offsetY || e.layerY];
};
Input.prototype.setEventHandlers = function() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
};
Input.prototype.init = function() {
    this.setEventHandlers();
    return this;
};

module.exports = Input;