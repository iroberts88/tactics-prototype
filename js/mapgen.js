
(function(window) {
    MapGen = {

        init: function() {
            Graphics.clear();
            var colors= [
                'aqua', 'black', 'blue', 'fuchsia', 'green', 
                'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                'silver', 'teal', 'white', 'yellow'
            ];
            Graphics.drawBG(colors[Math.floor(Math.random()*colors.length)], colors[Math.floor(Math.random()*colors.length)]);
            var style = {
                font: '100px Orbitron', 
                fill: 'white', 
                align: 'left', 
                dropShadow: true,
                dropShadowColor: '#000000',
                stroke: '#000000',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6
            };
            this.select = new PIXI.Text('Select Map Type' , style);
            this.select.position.x = (Graphics.width / 2);
            this.select.position.y = (Graphics.height / 8);
            this.select.anchor.x = 0.5;
            this.select.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.select);

            this.typeSelected = 'r';
            this.size = 10;
            //rectangle
            this.rectangle = new PIXI.Text('Rectangle' , style);
            this.rectangle.style.fontSize = 64;
            this.rectangle.style.fill = 'gray';
            this.rectangle.position.x = Graphics.width/3;
            this.rectangle.position.y = Graphics.height/4;
            this.rectangle.anchor.x = 0.5;
            this.rectangle.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.rectangle);
            this.rectangle.interactive = true;
            this.rectangle.buttonMode = true;
            this.rectangle.on('click', function onClick(){
                MapGen.typeSelected = 'r';
                MapGen.rectangle.style.fill = 'gray';
                MapGen.hexagon.style.fill = 'white';
                MapGen.triangle.style.fill = 'white';
                MapGen.rhombus.style.fill = 'white';
            });
            this.rectangle.on('tap', function onClick(){
                MapGen.typeSelected = 'r';
                MapGen.rectangle.style.fill = 'gray';
                MapGen.hexagon.style.fill = 'white';
                MapGen.triangle.style.fill = 'white';
                MapGen.rhombus.style.fill = 'white';
            });
            //triangle
            this.triangle = new PIXI.Text('Triangle' , style);
            this.triangle.style.fontSize = 64;
            this.triangle.position.x = Graphics.width*.66;
            this.triangle.position.y = Graphics.height/4;
            this.triangle.anchor.x = 0.5;
            this.triangle.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.triangle);
            this.triangle.interactive = true;
            this.triangle.buttonMode = true;
            this.triangle.on('click', function onClick(){
                MapGen.typeSelected = 't';
                MapGen.rectangle.style.fill = 'white';
                MapGen.hexagon.style.fill = 'white';
                MapGen.triangle.style.fill = 'gray';
                MapGen.rhombus.style.fill = 'white';
            });
            this.triangle.on('tap', function onClick(){
                MapGen.typeSelected = 'r';
                MapGen.rectangle.style.fill = 'white';
                MapGen.hexagon.style.fill = 'white';
                MapGen.triangle.style.fill = 'gray';
                MapGen.rhombus.style.fill = 'white';
            });
            //hexagon
            this.hexagon = new PIXI.Text('Hexagon' , style);
            this.hexagon.style.fontSize = 64;
            this.hexagon.position.x = Graphics.width/3;
            this.hexagon.position.y = Graphics.height/3;
            this.hexagon.anchor.x = 0.5;
            this.hexagon.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.hexagon);
            this.hexagon.interactive = true;
            this.hexagon.buttonMode = true;
            this.hexagon.on('click', function onClick(){
                MapGen.typeSelected = 'h';
                MapGen.rectangle.style.fill = 'white';
                MapGen.hexagon.style.fill = 'gray';
                MapGen.triangle.style.fill = 'white';
                MapGen.rhombus.style.fill = 'white';
            });
            this.hexagon.on('tap', function onClick(){
                MapGen.typeSelected = 'h';
                MapGen.rectangle.style.fill = 'white';
                MapGen.hexagon.style.fill = 'gray';
                MapGen.triangle.style.fill = 'white';
                MapGen.rhombus.style.fill = 'white';
            });
            //rhombus
            this.rhombus = new PIXI.Text('Rhombus' , style);
            this.rhombus.style.fontSize = 64;
            this.rhombus.position.x = Graphics.width*.66;
            this.rhombus.position.y = Graphics.height/3;
            this.rhombus.anchor.x = 0.5;
            this.rhombus.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.rhombus);
            this.rhombus.interactive = true;
            this.rhombus.buttonMode = true;
            this.rhombus.on('click', function onClick(){
                MapGen.typeSelected = 'rh';
                MapGen.rectangle.style.fill = 'white';
                MapGen.hexagon.style.fill = 'white';
                MapGen.triangle.style.fill = 'white';
                MapGen.rhombus.style.fill = 'gray';
            });
            this.rhombus.on('tap', function onClick(){
                MapGen.typeSelected = 'rh';
                MapGen.rectangle.style.fill = 'white';
                MapGen.hexagon.style.fill = 'white';
                MapGen.triangle.style.fill = 'white';
                MapGen.rhombus.style.fill = 'gray';
            });

            this.sizePercent = 0;
            this.sizeBar = new PIXI.Text('____________________' , {font: '50px Verdana', fill: 'hsla(93, 100%, 50%, 0)', align: 'left'});
            this.sizeBar.position.x = (Graphics.width / 2);
            this.sizeBar.position.y = (Graphics.height / 2);
            this.sizeBar.anchor.x = 0.5;
            this.sizeBar.anchor.y = 0.5;
            this.sizeBar.interactive = true;
            this.sizeBar.buttonMode = true;
            this.sizeBar.clicked = false;
            this.sizeBar.percent = Settings.sizeVolume;
            Graphics.uiContainer.addChild(this.sizeBar);
            Graphics.setSlideBar(this.sizeBar, function setPercent(p){MapGen.sizePercent = p;});
            this.sizeBar.on('mousemove', function onClick(e){
                if (MapGen.sizeBar.clicked){
                    var position = e.data.global.x - Graphics.width/2;
                    var start =  -1 * MapGen.sizeBar.width/2;
                    var percent = (position - start) / MapGen.sizeBar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    MapGen.sizePercent = percent;
                }
            });
            this.sizeBar.on('touchmove', function onClick(e){
                if (MapGen.sizeBar.clicked){
                    var position = e.data.global.x - MapGen.sizeBar.position.x;
                    var start =  -1 * MapGen.sizeBar.width/2;
                    var percent = (position - start) / MapGen.sizeBar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    MapGen.sizePercent = percent;
                }
            });

            this.size = new PIXI.Text('Size :' , style);
            this.size.style.fontSize = 48;
            this.size.position.x = (Graphics.width / 2) - this.sizeBar.width/2 - this.size.width;
            this.size.position.y = (Graphics.height / 2);
            this.size.anchor.x = 0.5;
            this.size.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.size);

            this.sizeText = new PIXI.Text('0' , style);
            this.sizeText.style.fontSize = 48;
            this.sizeText.position.x = (Graphics.width / 2) + this.sizeBar.width/2 + 15;
            this.sizeText.position.y = (Graphics.height / 2);
            this.sizeText.anchor.x = 0.0;
            this.sizeText.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.sizeText);

            this.sizePercent2 = 0;
            this.sizeBar2 = new PIXI.Text('____________________' , {font: '50px Verdana', fill: 'hsla(93, 100%, 50%, 0)', align: 'left'});
            this.sizeBar2.position.x = (Graphics.width / 2);
            this.sizeBar2.position.y = (Graphics.height / 2) + 75;
            this.sizeBar2.anchor.x = 0.5;
            this.sizeBar2.anchor.y = 0.5;
            this.sizeBar2.interactive = true;
            this.sizeBar2.buttonMode = true;
            this.sizeBar2.clicked = false;
            this.sizeBar2.percent = Settings.sizeVolume;
            Graphics.uiContainer.addChild(this.sizeBar2);
            Graphics.setSlideBar(this.sizeBar2, function setPercent(p){MapGen.sizePercent2 = p;});
            this.sizeBar2.on('mousemove', function onClick(e){
                if (MapGen.sizeBar2.clicked){
                    var position = e.data.global.x - Graphics.width/2;
                    var start =  -1 * MapGen.sizeBar2.width/2;
                    var percent = (position - start) / MapGen.sizeBar2.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    MapGen.sizePercent2 = percent;
                }
            });
            this.sizeBar2.on('touchmove', function onClick(e){
                if (MapGen.sizeBar2.clicked){
                    var position = e.data.global.x - MapGen.sizeBar2.position.x;
                    var start =  -1 * MapGen.sizeBar2.width/2;
                    var percent = (position - start) / MapGen.sizeBar2.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    MapGen.sizePercent2 = percent;
                }
            });

            //create map button
            this.createButton = new PIXI.Text('Create' , style);
            this.createButton.style.fontSize = 48;
            this.createButton.position.x = Graphics.width/2;
            this.createButton.position.y = Graphics.height - 150;
            this.createButton.anchor.x = 0.5;
            this.createButton.anchor.y = 0.5;
            Graphics.uiContainer.addChild(this.createButton);
            this.createButton.interactive = true;
            this.createButton.buttonMode = true;
            this.createButton.on('click', function onClick(){
            });
            this.createButton.on('tap', function onClick(){

            });

            this.mapSizes = {
                'r': {min: 5, max: 50},
                'rh': {min: 5, max: 50},
                'h': {min: 3, max: 25},
                't': {min: 10, max: 100}
            }
        },
 
        update: function(deltaTime){
            Graphics.worldPrimitives.clear();
            if (this.typeSelected == 'r' || this.typeSelected == 'rh'){
                this.sizeBar2.visible = true;
                Graphics.worldPrimitives.beginFill(0xFFFFFF,0.6);
                Graphics.worldPrimitives.drawRect(this.sizeBar2.position.x - this.sizeBar2.width/2,
                                          this.sizeBar2.position.y - this.sizeBar2.height/2,
                                          this.sizePercent2*this.sizeBar2.width,
                                          this.sizeBar2.height);
                Graphics.worldPrimitives.endFill();
                Graphics.drawBoxAround(this.sizeBar2,Graphics.worldPrimitives,'0xFFFFFF',2);
                Graphics.drawBoxAround(this.sizeBar2,Graphics.worldPrimitives,'0x000000',2,-2,-2);
                var min = this.mapSizes[this.typeSelected].min;
                var max = this.mapSizes[this.typeSelected].max;
                this.sizeText.text = Math.round(min + this.sizePercent*(max-min)) + ' x ' + Math.round(min + this.sizePercent2*(max-min));
            }else{
                this.sizeBar2.visible = false;
                var min = this.mapSizes[this.typeSelected].min;
                var max = this.mapSizes[this.typeSelected].max;
                this.sizeText.text = '' + Math.round(min + this.sizePercent*(max-min));
            }
            Graphics.worldPrimitives.lineStyle(1,0xFFFFFF,0.6);
            Graphics.worldPrimitives.beginFill(0xFFFFFF,0.6);
            Graphics.worldPrimitives.drawRect(this.sizeBar.position.x - this.sizeBar.width/2,
                                      this.sizeBar.position.y - this.sizeBar.height/2,
                                      this.sizePercent*this.sizeBar.width,
                                      this.sizeBar.height);
            Graphics.worldPrimitives.endFill();
            Graphics.drawBoxAround(this.sizeBar,Graphics.worldPrimitives,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.sizeBar,Graphics.worldPrimitives,'0x000000',2,-2,-2);
        },
        getNewMap: function(){
            return {
                TILE_SIZE: 31,
                TILE_HEIGHT: 11,
                startAt: null, //TODO this should be to compensate for max tile height
                bounds: null,
                mapArray: null,
                mapTextures: null,
                spriteArray: null,
                height: null,
                width: null,
                tileScale: null,
                tileSizeActual: null,
                rotateData: null,
                blurFilter: null,
                iso: null,
                init: function(data) {
                    this.height = data.height;
                    this.width = data.width;
                    this.iso = data.iso;
                    this.size = data.size;
                    this._axialMap = {};
                    for (var i = data.size*-1; i <=data.size;i++){
                        var row = {};
                        for (var j = data.size*-1; j <=data.size;j++){
                            if (Math.sqrt((i+j)*(i+j)) <= data.size){
                                var node = {
                                    q: i,
                                    r: j,
                                    h: Math.ceil(Math.random()*5),
                                    sprites: []
                                }
                                row[j] = node;
                            }
                        }
                        this._axialMap[i] = row;
                    }
                    this._cubeMap = {}
                    for (var i = data.size*-1; i <=data.size;i++){
                        var row1 = {};
                        for (var j = data.size*-1; j <=data.size;j++){
                            var row2 = {};
                            for (var k = data.size*-1; k <=data.size;k++){
                                if (i + j + k == 0){
                                    var node = {
                                        x: i,
                                        y: j,
                                        z: k
                                    }
                                    row2[k] = node;
                                }
                            }
                            row1[j] = row2; 
                        }
                        this._cubeMap[i] = row1;
                    }
                    //this.startAt = data.startAt;
                    this.startAt = Math.max(this.TILE_SIZE*this.height, this.TILE_SIZE*this.width);
                    this.bounds = [this.TILE_SIZE*(this.width-1.5) + this.startAt, this.TILE_SIZE * (this.height*.75 - 1.5) + this.startAt];
                    this.tileScale = 1;
                    this.tileSizeActual = this.TILE_SIZE/this.tileScale;
                    this.mapArray = [];
                    this.mapArray1 = {};
                    this.mapArray2 = {};
                    this.mapArray3 = {};
                    this.mapArray4 = {};
                    this.mapTextures = [];
                    this.blurFilter = new PIXI.filters.BlurFilter();
                    this.blurFilter.blur = 10;
                    this.container = new PIXI.particles.ParticleContainer(10000, {
                        scale: true,
                        position: true,
                        rotation: true,
                        uvs: true,
                        alpha: true
                    });
                    var map = [
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [1,1,2,2,2,3,3,1,1,1,1,1,5,1,1,5,1,1,1,5,1,6,1,1,1],
                        [1,1,2,2,2,3,3,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,7,1,1],
                        [1,1,1,1,1,3,3,3,3,2,2,1,1,1,8,1,1,1,1,1,6,1,1,1,5],
                        [1,1,1,1,1,4,4,3,3,2,2,1,1,1,1,8,1,1,8,1,1,1,1,1,1],
                        [1,1,1,1,1,4,4,3,3,1,1,1,1,1,1,1,1,8,1,1,8,1,1,8,1],
                        [1,1,1,1,1,4,4,4,4,1,1,1,1,1,1,7,1,1,1,1,1,1,5,1,1],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,20,20,20,20,20,20,14,13,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,20,20,20,20,20,20,15,12,3,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,20,20,20,20,20,20,16,11,4,0,0,0,0,2,2,2,2,2,2,2,2,0,0],
                        [0,0,20,20,20,20,20,20,17,10,5,0,0,0,0,3,3,3,4,4,5,3,2,0,0],
                        [0,0,20,20,20,20,20,20,18,9,6,0,0,0,0,2,3,3,4,4,5,3,2,0,0],
                        [0,0,20,20,20,20,20,20,19,8,7,0,0,0,0,2,3,3,5,5,5,3,2,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,2,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0],
                        [4,4,4,4,3,3,3,3,2,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0],
                        [4,4,4,4,3,3,3,3,2,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0],
                        [4,4,4,4,3,3,3,3,2,2,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0],
                        [5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,11,12,13],
                        [5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,11,12,13],
                        [5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,11,12,13]
                    ];
                    for (var i = 0; i < map.length;i++){
                        var a = [];
                        var b = {};
                        for (var j = 0;j < map[i].length;j++){
                            a.push({h: map[i][j],sprites: []});
                            b[j] = {h: map[i][j],sprites: []};
                        }
                        this.mapArray.push(a);
                        this.mapArray1[i] = b;
                    }

                    
                    //create the 4 map images
                    //0
                    for (var i = 0; i < this.height;i++){
                        for (var j = 0;j < this.width;j++){
                            var node = this.mapArray1[i][j];
                            for (var k = 0;k <=node.h;k++){
                                var sprite = Graphics.getSprite('base_tile1');
                                if (data.iso){
                                    sprite.position.x = j*(this.tileSizeActual/2) - i*(this.tileSizeActual/2);
                                    sprite.position.y = i*(this.tileSizeActual*0.75) + j*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k)
                                }else{
                                    sprite.position.x = j*(this.tileSizeActual) - (this.tileSizeActual*0.5*(i%2));
                                    sprite.position.y = i*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k);
                                }
                                sprite.anchor.x = .5;
                                sprite.anchor.y = .5;
                                sprite.scale.x = this.tileScale;
                                sprite.scale.y = this.tileScale;
                                sprite.loc = {x: i,y: j,z: k};
                                node.sprites.push(sprite);
                                this.container.addChild(sprite);
                            } 
                        }
                    }
                    /*var st = 0;
                    for (var i = -1*this.size; i <= 0;i++){
                        for (var j = st;j <= this.size;j++){
                            var node = this._axialMap[j][i];
                            for (var k = 0;k <=node.h;k++){
                                var sprite = Graphics.getSprite('base_tile1');
                                sprite.position.x = this.startAt + j*(this.tileSizeActual) - (this.tileSizeActual*0.5*st);
                                sprite.position.y = this.startAt + i*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k);
                                sprite.anchor.x = .5;
                                sprite.anchor.y = .5;
                                sprite.scale.x = this.tileScale;
                                sprite.scale.y = this.tileScale;
                                sprite.loc = {x: i,y: j,z: k};
                                node.sprites.push(sprite);
                                this.container.addChild(sprite);
                            } 
                        }
                        st -= 1;
                    }
                    var newStart = [this._axialMap[this.size*-1][0].sprites[0].position.x + this.tileSizeActual*0.5,this._axialMap[this.size*-1][0].sprites[0].position.y + this.tileSizeActual*0.75];
                    var stop = this.size-1;
                    var st = 1;
                    for (var i = 1; i <= this.size;i++){
                        for (var j = this.size*-1;j <= stop;j++){
                            var node = this._axialMap[j][i];
                            for (var k = 0;k <=node.h;k++){
                                var sprite = Graphics.getSprite('base_tile1');
                                sprite.position.x = this.startAt + j*(this.tileSizeActual) + (this.tileSizeActual*0.5*st) + this.tileSizeActual*0.5*this.size;
                                sprite.position.y = this.startAt + (this.tileSizeActual*0.75*(this.size)) + i*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k) - this.tileSizeActual*0.75*this.size;
                                sprite.anchor.x = .5;
                                sprite.anchor.y = .5;
                                sprite.scale.x = this.tileScale;
                                sprite.scale.y = this.tileScale;
                                sprite.loc = {x: i,y: j,z: k};
                                node.sprites.push(sprite);
                                this.container.addChild(sprite);
                            } 
                        }
                        stop -= 1;
                        st += 1;
                    }*/
                    console.log(this.container.children.length)
                    this.container._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(this.container.width+this.TILE_SIZE+this.startAt,this.container.height+this.TILE_SIZE+this.startAt);
                    Graphics.app.renderer.render(this.container,texture);
                    var mapSprite = new PIXI.Sprite();
                    //get the anchor point
                    this.container.pivot.x = (this.startAt + (this.mapArray1[this.height-1][this.width-1].sprites[0].position.x - this.mapArray1[0][0].sprites[0].position.x)/2)/this.container.width;
                    this.container.pivot.y = (this.startAt + (this.mapArray1[this.height-1][this.width-1].sprites[0].position.y - this.mapArray1[0][0].sprites[0].position.y)/2)/this.container.height;
                    this.mapTextures.push(mapSprite);
                    Graphics.world.addChild(this.container);

                    //1
                    this.container2 = new PIXI.Container();
                    if (data.iso){
                        for (var i = this.width-1;i>=0;i--){
                            this.mapArray2[''+(this.width-1-i)] = {};
                            for (var j = 0; j < this.height;j+=1){
                                var node = this.mapArray[j][i];
                                this.mapArray2[''+(this.width-1-i)][j] = {h: node.h,sprites: []};
                                for (var k = 0;k <=node.h;k++){
                                    var sprite = node.sprites[k];
                                    sprite.texture = Graphics.getResource('base_tile2');
                                    sprite.position.x = this.startAt + j*(this.tileSizeActual*0.75) - (this.width-1-i)*(this.tileSizeActual*0.75);
                                    sprite.position.y = this.startAt + (this.width-1-i)*(this.tileSizeActual/2) + j*(this.tileSizeActual/2) - (this.TILE_HEIGHT*k);
                                    this.mapArray2[''+(this.width-1-i)][j].sprites.push(sprite);
                                    this.container2.addChild(sprite);
                                }
                            }
                        }
                    }else{
                        for (var i = this.width-1;i>=0;i--){
                            this.mapArray2[''+(this.width-1-i)] = {};
                            for (var j = 0; j <= this.height;j+=2){
                                try{
                                    var node = this.mapArray[j][i];
                                    this.mapArray2[''+(this.width-1-i)][j] = {h: node.h,sprites: []};
                                    for (var k = 0;k <=node.h;k++){
                                        var sprite = node.sprites[k];
                                        sprite.texture = Graphics.getResource('base_tile2');
                                        sprite.position.x = this.startAt + j*(this.tileSizeActual*0.75);
                                        sprite.position.y = this.startAt + (this.width-1-i)*(this.tileSizeActual) + (this.tileSizeActual*0.5*(j%2)) - (this.TILE_HEIGHT*k);
                                        this.mapArray2[''+(this.width-1-i)][j].sprites.push(sprite);
                                        this.container2.addChild(sprite);
                                    }
                                }catch(e){}
                                try{
                                    if (j!=0){
                                        var node = this.mapArray[j-1][i];
                                        this.mapArray2[''+(this.width-1-i)][j-1] = {h: node.h,sprites: []};
                                        for (var k = 0;k <=node.h;k++){
                                            var sprite = node.sprites[k];
                                            sprite.texture = Graphics.getResource('base_tile2');
                                            sprite.position.x = this.startAt + (j-1)*(this.tileSizeActual*0.75);
                                            sprite.position.y = this.startAt + (this.width-1-i)*(this.tileSizeActual) + (this.tileSizeActual*0.5*((j-1)%2)) - (this.TILE_HEIGHT*k);
                                            this.mapArray2[''+(this.width-1-i)][j-1].sprites.push(sprite);
                                            this.container2.addChild(sprite);
                                        }
                                    }
                                }catch(e){}
                            }
                        }
                    }
                    this.container2._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(this.container2.width+this.TILE_SIZE+this.startAt,this.container2.height+this.TILE_SIZE+this.startAt);
                    Graphics.app.renderer.render(this.container2,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray2[this.width-1][this.height-1].sprites[0].position.x - this.mapArray2[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray2[this.width-1][this.height-1].sprites[0].position.y - this.mapArray2[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    mapSprite.visible = false;
                    this.mapTextures.push(mapSprite);
                    //Graphics.worldContainer.addChild(mapSprite);

                    //2
                    this.container3 = new PIXI.Container();
                    for (var i = this.height-1;i>=0;i--){
                        this.mapArray3[''+(this.height-1-i)] = {};
                        for (var j = this.width-1; j >= 0;j--){
                            var node = this.mapArray[i][j];
                            this.mapArray3[''+(this.height-1-i)][''+(this.width-1-j)] = {h: node.h,sprites: []};
                            for (var k = 0;k <=node.h;k++){
                                var sprite = node.sprites[k];
                                sprite.texture = Graphics.getResource('base_tile1');
                                if (data.iso){
                                    sprite.position.x = this.startAt + (this.width-1-j)*(this.tileSizeActual/2) - (this.height-1-i)*(this.tileSizeActual/2);
                                    sprite.position.y = this.startAt + (this.height-1-i)*(this.tileSizeActual*0.75) + (this.width-1-j)*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k);
                                }else{
                                    sprite.position.x = this.startAt + (this.width-1-j)*(this.tileSizeActual) + (this.tileSizeActual*0.5*(i%2));
                                    sprite.position.y = this.startAt + (this.height-1-i)*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k);
                                }
                                this.mapArray3[''+(this.height-1-i)][''+(this.width-1-j)].sprites.push(sprite);
                                this.container3.addChild(sprite);
                            } 
                        }
                    }
                    this.container3._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(this.container3.width+this.TILE_SIZE+this.startAt,this.container3.height+this.TILE_SIZE+this.startAt);
                    Graphics.app.renderer.render(this.container3,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray3[this.height-1][this.width-1].sprites[0].position.x - this.mapArray3[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray3[this.height-1][this.width-1].sprites[0].position.y - this.mapArray3[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    mapSprite.visible = false;
                    this.mapTextures.push(mapSprite);
                    //Graphics.worldContainer.addChild(mapSprite);

                    //3
                    this.container4 = new PIXI.Container();
                    
                    if (data.iso){
                        for (var i = 0;i<this.width;i++){
                            this.mapArray4[i] = {};
                            for (var j = this.height-1; j>=0 ;j--){
                                var node = this.mapArray[j][i];
                                this.mapArray4[i][''+(this.height-1-j)] = {h: node.h,sprites: []};
                                for (var k = 0;k <=node.h;k++){
                                    var sprite = node.sprites[k];
                                    sprite.texture = Graphics.getResource('base_tile2');
                                    sprite.position.x = this.startAt + (this.height-1-j)*(this.tileSizeActual*0.75) - i*(this.tileSizeActual*0.75);
                                    sprite.position.y = this.startAt + i*(this.tileSizeActual/2) + (this.height-1-j)*(this.tileSizeActual/2) - (this.TILE_HEIGHT*k);
                                    this.mapArray4[i][''+(this.height-1-j)].sprites.push(sprite);
                                    this.container4.addChild(sprite);
                                }
                            }
                        }
                    }else{
                        for (var i = 0;i<this.width;i++){
                            this.mapArray4[i] = {};
                            for (var j = this.height-1; j>=-1 ;j-=2){
                                try{
                                    if (j != this.height-1){
                                        var node = this.mapArray[j+1][i];
                                        this.mapArray4[i][''+(this.height-2-j)] = {h: node.h,sprites: []};
                                        for (var k = 0;k <=node.h;k++){
                                            var sprite = node.sprites[k];
                                            sprite.texture = Graphics.getResource('base_tile2');
                                            sprite.position.x = this.startAt + (this.height-2-j)*(this.tileSizeActual*0.75);
                                            sprite.position.y = this.startAt + i*(this.tileSizeActual) - (this.tileSizeActual*0.5*((this.height-2-j)%2)) - (this.TILE_HEIGHT*k);
                                            this.container4.addChild(sprite);
                                            this.mapArray4[i][''+(this.height-2-j)].sprites.push(sprite);
                                        }
                                    }
                                }catch(e){
                                    console.log(e);
                                };
                            }
                            for (var j = this.height-1; j>=-1 ;j-=2){
                                try{
                                    var node = this.mapArray[j][i];
                                    this.mapArray4[i][''+(this.height-1-j)] = {h: node.h,sprites: []};
                                    for (var k = 0;k <=node.h;k++){
                                        var sprite = node.sprites[k];
                                        sprite.texture = Graphics.getResource('base_tile2');
                                        sprite.position.x = this.startAt + (this.height-1-j)*(this.tileSizeActual*0.75);
                                        sprite.position.y = this.startAt + i*(this.tileSizeActual) - (this.tileSizeActual*0.5*((this.height-1-j)%2)) - (this.TILE_HEIGHT*k);
                                        this.container4.addChild(sprite);
                                        this.mapArray4[i][''+(this.height-1-j)].sprites.push(sprite);
                                    }
                                }catch(e){};
                                
                            } 
                        }
                    }
                    this.container4._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(this.container4.width+this.TILE_SIZE+this.startAt,this.container4.height+this.TILE_SIZE+this.startAt);
                    Graphics.app.renderer.render(this.container4,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray4[this.width-1][this.height-1].sprites[0].position.x - this.mapArray4[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray4[this.width-1][this.height-1].sprites[0].position.y - this.mapArray4[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    mapSprite.visible = false;
                    this.mapTextures.push(mapSprite);
                    //Graphics.worldContainer.addChild(mapSprite);

                    Graphics.world.pivot.x = Graphics.world.width/2;
                    Graphics.world.pivot.y = Graphics.world.height/2;
                    for (var s = 0;s < this.mapTextures.length;s++){
                        this.mapTextures[s].position.x = Graphics.world.width/2;
                        this.mapTextures[s].position.y = Graphics.world.height/2;
                    }
                    Graphics.world.position.x = Graphics.width/2;
                    Graphics.world.position.y = Graphics.height/2;
                },

                update: function(dt) {
                    if (this.rotateData){
                        this.rotateData.t += dt;
                        //Graphics.world.filters = [this.blurFilter];
                        if(this.rotateData.t >= this.rotateData.time/2){
                            for (var i = 0; i < Map.mapTextures.length;i++){
                                if (i == this.rotateData.rot2){
                                    Map.mapTextures[i].visible = true;
                                }else{
                                    Map.mapTextures[i].visible = false;
                                }
                            }
                            this.rotateData.extraRot = 1;
                        }
                        var r = 1.5708;
                        if (this.rotateData.dir == 'right'){
                            Graphics.world.rotation = (r*(this.rotateData.t/this.rotateData.time)-(this.rotateData.extraRot*r));
                        }if (this.rotateData.dir == 'left'){
                            Graphics.world.rotation = (-r*(this.rotateData.t/this.rotateData.time)+(this.rotateData.extraRot*r));
                        }
                        if (this.rotateData.t >= this.rotateData.time){
                            Graphics.world.filters = [];
                            Graphics.world.rotation = 0;
                            this.rotateData.dir = 'none';
                        }
                        if (this.rotateData.t >= this.rotateData.time*1.25){
                            this.rotateData = null;
                        }
                    }
                },

                draw: function(){
                    
                },

                updateLoc: function(x,y){
                    
                },

                setScale: function(s){
                   
                },
                getScale: function(){
                   
                }
            }
        }
    }
    window.MapGen = MapGen;
})(window);
