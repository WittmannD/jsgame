const Vector = require('../lib/Vector');
const Util = require('../lib/Util');

function Drawing(canvas, viewport) {
    this.canvas = canvas;
    this.viewport = viewport;

    this.images = new Map();

    const imageNamesList = ['warrior', 'wall0', 'wallFront', 'wallBack', 'font', 'fields', 'inverse', 'grass', 'wall', 'stoneFloor', 'tree', 'dirt'];
    const relativePath = '/static/res';

    this.init = () => {
        for (let key of imageNamesList) {
            this.images.set(key, new Image());
            this.images.get(key).src = `${relativePath}/${key}.png`;
        }

        return this;
    };

    this.draw = (props) => {
        const canvasType = props.drawToBuffer ? 'buffer' : 'layers';
        const ctx = (this.canvas[canvasType][props.layer]) || (this.canvas[canvasType]['main']);
        ctx.save();

        let coords = props.centred ?
            new Vector(props.position.x - props.width / 2, props.position.y - props.height / 2) :
            new Vector(props.position.x, props.position.y);

        if (props.drawToBackground) {
            ctx.globalCompositeOperation = 'destination-over';
        }

        if (!props.absoluteCoords) {
            coords = this.viewport.relativeCoords(coords);
        }

        if (props.sprite) {
            ctx.drawImage(this.images.get(props.sprite),
                props.dPosition.x,
                props.dPosition.y,
                props.width,
                props.height,
                coords.x,
                coords.y,
                props.width,
                props.height);
        }
        
        if (props.image) {
            ctx.drawImage(this.images.get(props.image), coords.x, coords.y, props.width, props.height);
        }

        if (props.backgroundColor) {
            ctx.fillStyle = props.backgroundColor;
            ctx.fillRect(coords.x, coords.y, props.width, props.height);
        }

        if (props.stroke) {
            ctx.strokeStyle = props.stroke;
            ctx.strokeRect(coords.x, coords.y, props.width, props.height);
            ctx.stroke();
        }

        ctx.restore();
    };

    this.clear = () => {
        this.canvas.layers.front.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.layers.main.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.layers.back.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    this.getTerrainData = (terrain) => {
        const map = terrain.map;
        const keys = ['1000', '0100', '0010', '0001', '1100', '0110', '0011', '1001', '1010', '0101', '1101', '1110', '0111', '1011', '0000', '1111'];
        const blocks = ['dirt', 'grass', 'wall', 'tree', 'stoneFloor'];
        
        const drawTile = {
            dirt: (key, x, y) => {
                this.draw({
                    sprite:     'dirt',
                    dPosition:  new Vector(0, 0),
                    sWidth:     64,
                    sHeight:    64,
                    position:   new Vector(x*16, y*16),
                    width:      16,
                    height:     16,
                    layer:      'back',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
            },
            grass: (key, x, y) => {
                this.draw({
                    sprite:     'grass',
                    dPosition:  new Vector(0, keys.indexOf(key) * 16),
                    sWidth:     16,
                    sHeight:    16,
                    position:   new Vector(x*16, y*16),
                    width:      16,
                    height:     16,
                    layer:      'back',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
            },
            wall: (key, x, y) => {
                this.draw({
                    sprite:     'wall',
                    dPosition:  new Vector(0, 0),
                    sWidth:     16,
                    sHeight:    16,
                    position:   new Vector(x*16, y*16 - 16),
                    width:      16,
                    height:     16,
                    layer:      'front',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
                this.draw({
                    sprite:     'wall',
                    dPosition:  new Vector(0, 16),
                    sWidth:     16,
                    sHeight:    16,
                    position:   new Vector(x*16, y*16),
                    width:      16,
                    height:     16,
                    layer:      'back',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
            },
            tree: (key, x, y) => {
                const type = Util.randomInt(0, 3);
                this.draw({
                    sprite:     'tree',
                    dPosition:  new Vector(0, type * 32),
                    sWidth:     16,
                    sHeight:    16,
                    position:   new Vector(x*16, y*16 - 16),
                    width:      16,
                    height:     16,
                    layer:      'front',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
                this.draw({
                    sprite:     'tree',
                    dPosition:  new Vector(0, type * 32 + 16),
                    sWidth:     16,
                    sHeight:    16,
                    position:   new Vector(x*16, y*16),
                    width:      16,
                    height:     16,
                    layer:      'back',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
            },
            stoneFloor: (key, x, y) => {
                this.draw({
                    sprite:     'stoneFloor',
                    dPosition:  new Vector(0, keys.indexOf(key) * 16),
                    sWidth:     16,
                    sHeight:    16,
                    position:   new Vector(x*16, y*16),
                    width:      16,
                    height:     16,
                    layer:      'back',
                    drawToBuffer: true,
                    absoluteCoords: true
                });
            }
        };
        
        // let yBorder = parseInt((this.viewport.position.y + this.canvas.height) / 16);
        let yBorder = terrain.height;
        for (let y = 0; y < yBorder; y++) {
            if (y <= terrain.height && y >= 0) {
                
                // let xBorder = parseInt((this.viewport.position.x + this.canvas.width) / 16);
                let xBorder = terrain.width;
                for (let x = 0; x < xBorder; x++) {
                    if (x <= terrain.width && x >= 0) {
                        
                        const i = Util.coordsToIndex(x, y, terrain.height);
                        let type = map[i];
                        
                        let key = '';

                        if (type !== undefined) {
                            if (map[Util.coordsToIndex(x-1, y, terrain.height)] === type) {
                                key = '1' + key;
                            } else {
                                key = '0' + key;
                            }

                            if (map[Util.coordsToIndex(x, y+1, terrain.height)] === type) {
                                key = '1' + key;
                            } else {
                                key = '0' + key;
                            }

                            if (map[Util.coordsToIndex(x+1, y, terrain.height)] === type) {
                                key = '1' + key;
                            } else {
                                key = '0' + key;
                            }

                            if (map[Util.coordsToIndex(x, y-1, terrain.height)] === type) {
                                key = '1' + key;
                            } else {
                                key = '0' + key;
                            }

                            if (key === '') {
                                key = '0000';
                            }
                            
                            this.draw({
                                sprite:     'dirt',
                                dPosition:  new Vector(0, 0),
                                sWidth:     64,
                                sHeight:    64,
                                position:   new Vector(x*16, y*16),
                                width:      16,
                                height:     16,
                                layer:      'back',
                                drawToBuffer: true,
                                absoluteCoords: true
                            });
                            
                            drawTile[blocks[type]](key, x, y);
                            
                        }
                    }
                }
            }
        }
        
        return ([
            this.canvas.buffer.front.getImageData(0, 0, terrain.width * 16, terrain.height * 16),
            this.canvas.buffer.back.getImageData(0, 0, terrain.width * 16, terrain.height * 16)
        ])
    };
    
    this.drawTerrainData = (terrainDataArr) => {
        const [front, back] = terrainDataArr;
        
        this.canvas.layers.front.putImageData(front, -this.viewport.position.x, -this.viewport.position.y);
        this.canvas.layers.back.putImageData(back, -this.viewport.position.x, -this.viewport.position.y);
    };
    
    this.menuField = (field) => {
        const fieldHeight = 42;
        const fieldWidth = 100;

        const dPosition = field.focus ? new Vector(fieldWidth*2, 0) : new Vector(0, 0);

        this.draw({
            sprite:         'fields',
            position:       new Vector(field.position.x, field.position.y),
            width:          fieldWidth,
            height:         fieldHeight,
            dPosition:      dPosition,
            absoluteCoords: true,
            layer:          'front'
        });

        this.canvas.layers.front.font = '28px Consolas';
        this.canvas.layers.front.fillText(field.value, field.position.x + fieldWidth / 2 - 10, field.position.y + fieldHeight / 2 + 10);
    };

    this.menuItem = (item) => {
        const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','y','v','w','x','u','z'];
        const letterHeight = 42;
        const letterWidth = 35;
        for (let i = 0; i < item.title.length; i++) {
            this.draw({
                sprite:         item.style || 'font',
                position:       new Vector(item.position.x + letterWidth * i, item.position.y),
                width:          letterWidth,
                height:         letterHeight,
                dPosition:      new Vector(alphabet.indexOf(item.title[i]) * letterWidth, 0),
                absoluteCoords: true,
                layer:          'front'
            });
        }

    };

    this.bullet = (bullet) => {
        this.draw({
            backgroundColor:    '#000000',
            position:           bullet.position,
            width:              bullet.size,
            height:             bullet.size,
            centred:            true,
            layer:              'main'
        });
    };

    this.hero = (hero, lastUpdateTime) => {
        let angle = Util.radiansToDegrees(hero.angle) + 22.5;
        const index = parseInt(angle / 45);
        // const keys = ['right', 'downRight', 'down', 'downLeft', 'left', 'topLeft', 'top', 'topRight'];
        const keys = ['0100', '0110', '0010', '0011', '0001', '1001', '1000', '1100', '0000'];
        

        this.draw({
            sprite:             'warrior',
            position:           new Vector(hero.position.x, hero.position.y - 16),
            width:              16,
            height:             32,
            /* dPosition:          new Vector(hero.moving ? ((Math.round(lastUpdateTime) % 2 + 1) * 16) : 0, index*32), */
            dPosition:          new Vector(hero.moving ? ((Math.round(lastUpdateTime) % 2 + 1) * 16) : 0, keys.indexOf(hero.direction.join(''))*32),
            layer:              'main'
        });
    }
}

module.exports = Drawing;