const Vector = require('../lib/Vector');

function Interface(canvas, input) {
    this.canvas = canvas;
    this.input = input;

    this.items = [];
    this.fields = [];
}
Interface.prototype.setEntries = function(itemsData=[], fieldsData=[]) {
    const itemsList = [];
    const fieldsList = [];

    const letterWidth = 35;
    const letterHeight = 42;

    const fieldWidth = 100;
    const fieldHeight = 42;

    let i = 0;

    for (let item of itemsData) {
        itemsList.push(
            new MenuItem({
                title:      item.title,
                style:      item.style,
                position:   item.position  || new Vector(this.canvas.center.x - (letterWidth * item.title.length / 2), letterHeight * (++i)),
                width:      letterWidth * item.title.length,
                height:     letterHeight,
                action:     item.action
            }, this.input)
        );
    }

    for (let field of fieldsData) {
        fieldsList.push(
            new Field({
                value:      field.value,
                position:   field.position,
                width:      fieldWidth,
                height:     fieldHeight
            }, this.input)
        );
    }

    this.items = itemsList;
    this.fields = fieldsList;
};
Interface.prototype.update = function (lastUpdateTime) {
    this.items && this.items.forEach(item => { item.update(lastUpdateTime) });
    this.fields && this.fields.forEach(field => { field.update(lastUpdateTime) });
};

function Menu(canvas, drawing, input, socket) {
    const mainMenuEntries = {
        items: [
            {
                title: 'play',
                action: () => { socket.emit('newPlayer', [0, 0]) }
            },
            {
                title: 'settings',
                action: () => { this.openSettings() }
            },
            {
                title: 'help',
                action: () => { console.log('help') }
            }
        ],
        fields: []
    };

    const settingsMenuEntries = {
        items: [
            {
                title: 'settings'
            },
            {
                title: 'up',
                position: new Vector(180, 200),
                style: 'inverse'
            },
            {
                title: 'left',
                position: new Vector(180, 270),
                style: 'inverse'
            },
            {
                title: 'down',
                position: new Vector(600, 200),
                style: 'inverse'
            },
            {
                title: 'right',
                position: new Vector(600, 270),
                style: 'inverse'
            },
            {
                title: 'default',
                position: new Vector(270, 500),
                action: () => { console.log('default') }
            },
            {
                title: 'apply',
                position: new Vector(570, 500),
                action: () => { this.openMainMenu() }
            }
        ],
        fields: [
            {
                value: 'W',
                position: new Vector(340, 200)
            },
            {
                value: 'A',
                position: new Vector(340, 270)
            },
            {
                value: 'S',
                position: new Vector(795, 200)
            },
            {
                value: 'D',
                position: new Vector(795, 270)
            }
        ]
    };

    this.isOpen = true;
    
    this.menuAnimationFrameId = 0;
    this.deltaTime = 0;
    this.lastUpdateTime = 0;
    
    this.interface = new Interface(canvas, input);
    
    this.create = () => {
        this.openMainMenu();
        
        this.run();
        return this;
    };
    
    this.openMainMenu = () => {
        this.interface.setEntries(mainMenuEntries.items, mainMenuEntries.fields);
    };
    
    this.openSettings = () => {
        this.interface.setEntries(settingsMenuEntries.items, settingsMenuEntries.fields);
    };
    
    this.open = () => {
        this.isOpen = true;
        this.run();
    };
    
    this.close = () => {
        this.isOpen = false;
        drawing.clear();
        window.cancelAnimationFrame(this.menuAnimationFrameId);
    };

    this.run = () => {
        const currentTime = Date.now();
        this.deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        this.isOpen && this.draw();
        this.isOpen && this.update();
        this.menuAnimationFrameId = window.requestAnimationFrame(this.run.bind(this));  
    };
    
    this.draw = () => {
        drawing.clear();
        
        this.interface.items.forEach(item => { drawing.menuItem(item) });
        this.interface.fields && this.interface.fields.forEach(field => { drawing.menuField(field) });
        
    };
    
    this.update = () => {
        this.interface.update(this.lastUpdateTime);
    }
}

function MenuItem(params, input) {
    this.title = params.title;
    this.position = params.position;
    this.style = params.style;
    this.width = params.width;
    this.height = params.height;
    this.action = params.action;
    
    this.clickDelay = 0;
    
    this.update = function(lastUpdateTime) {
        if (typeof this.action === 'function' && 
            input.mouseCoords[0]  >= this.position.x && input.mouseCoords[0] <= this.position.x + this.width &&
            input.mouseCoords[1]  >= this.position.y && input.mouseCoords[1] <= this.position.y + this.height) {
            if (input.mouseDown && this.clickDelay < lastUpdateTime) {
                this.action();
                this.clickDelay = lastUpdateTime + 200;
            }
            
        }
    }
}

function Field(params, input) {
    this.position = params.position;
    this.width = params.width;
    this.height = params.height;
    this.value = params.value || '';
    
    this.focus = false;
    this.clickDelay = 0;
    
    this.update = function(lastUpdateTime) {
        if (input.mouseDown && this.clickDelay < lastUpdateTime) {
            if (input.mouseCoords[0]  >= this.position.x && input.mouseCoords[0] <= this.position.x + this.width &&
                input.mouseCoords[1]  >= this.position.y && input.mouseCoords[1] <= this.position.y + this.height) {     
                this.focus = true;
                this.clickDelay = lastUpdateTime + 200;
            } else {
                this.focus = false;
            }
            
        }
        
        if (this.focus && input.pressedKey != null) {
            this.value = String.fromCharCode(input.pressedKey);
            this.focus = false;
        }
    }
}

module.exports = Menu;