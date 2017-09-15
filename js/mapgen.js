
(function(window) {
    MapGen = {
        getNewMap: function(){
            return {
                TILE_SIZE: 32,
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
                    //this.startAt = data.startAt;
                    this.startAt = Math.max(this.TILE_SIZE*this.height, this.TILE_SIZE*this.width);
                    this.bounds = [this.TILE_SIZE*(this.width-1.5) + this.startAt, this.TILE_SIZE * (this.height*.75 - 1.5) + this.startAt];
                    this.tileScale = 1;
                    this.tileSizeActual = this.TILE_SIZE/this.tileScale;
                    this.mapArray = [];
                    this.mapArray2 = {};
                    this.mapArray3 = {};
                    this.mapArray4 = {};
                    this.mapTextures = [];
                    this.blurFilter = new PIXI.filters.BlurFilter();
                    this.blurFilter.blur = 10;
                    this.container = new PIXI.Container();
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
                        for (var j = 0;j < map[i].length;j++){
                            a.push({h: map[i][j],sprites: []});
                        }
                        this.mapArray.push(a);
                    }

                    //create the 4 map images
                    //0
                    for (var i = 0; i < this.height;i++){
                        for (var j = 0;j < this.width;j++){
                            var node = this.mapArray[i][j];
                            for (var k = 0;k <=node.h;k++){
                                var sprite = Graphics.getSprite('base_tile1');
                                if (data.iso){
                                    sprite.position.x = this.startAt + j*(this.tileSizeActual/2) - i*(this.tileSizeActual/2);
                                    sprite.position.y = this.startAt + i*(this.tileSizeActual*0.75) + j*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k)
                                }else{
                                    sprite.position.x = this.startAt + j*(this.tileSizeActual) - (this.tileSizeActual*0.5*(i%2));
                                    sprite.position.y = this.startAt + i*(this.tileSizeActual*0.75) - (this.TILE_HEIGHT*k);
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
                    this.container._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(this.container.width+this.TILE_SIZE+this.startAt,this.container.height+this.TILE_SIZE+this.startAt);
                    Graphics.app.renderer.render(this.container,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray[this.height-1][this.width-1].sprites[0].position.x - this.mapArray[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray[this.height-1][this.width-1].sprites[0].position.y - this.mapArray[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    this.mapTextures.push(mapSprite);
                    Graphics.worldContainer.addChild(mapSprite);

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
                    Graphics.worldContainer.addChild(mapSprite);

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
                    Graphics.worldContainer.addChild(mapSprite);

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
                    Graphics.worldContainer.addChild(mapSprite);

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
