
(function(window) {
    MapGen = {
        TILE_SIZE: 31,
        TILE_HEIGHT: 11,

        type: null,
        size: null,

        init: function() {
            switch(this.type){
                case 'r':
                    this.initRectangle();
                    break;
                case 'rh':
                    this.initRhombus();
                    break;
                case 't':
                    this.initTriangle();
                    break;
                case 'h':
                    this.initHexagon();
                    break;
            }
        },
        initRectangle: function(){
            console.log('Initializing a ' + this.size[0] + 'x' + this.size[1] + ' Rectangle Map');
        },
        initRhombus: function(){
            console.log('Initializing a ' + this.size[0] + 'x' + this.size[1] + ' Rhombus Map');
        },
        initTriangle: function(){
            console.log('Initializing a ' + this.size + ' unit Triangle Map');
        },
        initHexagon: function(){
            console.log('Initializing a ' + this.size + ' unit Rhombus Map');
        },
        update: function(deltaTime){

        },


        getNewMap: function(){
            return {
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
