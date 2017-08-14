
(function(window) {
    MapGen = {
        getNewMap: function(){
            return {
                TILE_SIZE: 128,
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
                init: function(data) {
                    this.height = data.height;
                    this.width = data.width;
                    this.startAt = data.startAt;
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
                    var container = new PIXI.Container();
                    for (var i = 0; i < this.height;i++){
                        var a = [];
                        for (var j = 0;j < this.width;j++){
                            a.push({h: Math.floor(Math.random()*4),sprites: []});
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
                                sprite.position.x = this.startAt + j*(this.tileSizeActual*0.875) - (this.tileSizeActual*0.4375*(i%2));
                                sprite.position.y = this.startAt + i*(this.tileSizeActual*0.75) - (25*k);
                                sprite.anchor.x = .5;
                                sprite.anchor.y = .5;
                                sprite.scale.x = this.tileScale;
                                sprite.scale.y = this.tileScale;
                                sprite.loc = {x: i,y: j,z: k};
                                node.sprites.push(sprite);
                                container.addChild(sprite);
                            } 
                        }
                    }
                    container._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(container.width+128+this.startAt,container.height+128+this.startAt);
                    Graphics.app.renderer.render(container,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray[this.height-1][this.width-1].sprites[0].position.x - this.mapArray[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray[this.height-1][this.width-1].sprites[0].position.y - this.mapArray[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    this.mapTextures.push(mapSprite);
                    Graphics.worldContainer.addChild(mapSprite);

                    //1
                    var container2 = new PIXI.Container();
                    for (var i = this.width-1;i>=0;i--){
                        this.mapArray2[''+(this.width-1-i)] = {};
                        for (var j = 0; j <= this.height;j+=2){
                            try{
                                var node = this.mapArray[j][i];
                                this.mapArray2[''+(this.width-1-i)][j] = {h: node.h,sprites: []};
                                for (var k = 0;k <=node.h;k++){
                                    var sprite = node.sprites[k];
                                    sprite.texture = Graphics.getResource('base_tile2');
                                    sprite.position.x = this.startAt + j*(this.tileSizeActual*0.74);
                                    sprite.position.y = this.startAt + (this.width-1-i)*(this.tileSizeActual*0.875) + (this.tileSizeActual*0.4375*(j%2)) - (25*k);
                                    this.mapArray2[''+(this.width-1-i)][j].sprites.push(sprite);
                                    container2.addChild(sprite);
                                }
                            }catch(e){}
                            try{
                                if (j!=0){
                                    var node = this.mapArray[j-1][i];
                                    this.mapArray2[''+(this.width-1-i)][j-1] = {h: node.h,sprites: []};
                                    for (var k = 0;k <=node.h;k++){
                                        var sprite = node.sprites[k];
                                        sprite.texture = Graphics.getResource('base_tile2');
                                        sprite.position.x = this.startAt + (j-1)*(this.tileSizeActual*0.74);
                                        sprite.position.y = this.startAt + (this.width-1-i)*(this.tileSizeActual*0.875) + (this.tileSizeActual*0.4375*((j-1)%2)) - (25*k);
                                        this.mapArray2[''+(this.width-1-i)][j-1].sprites.push(sprite);
                                        container2.addChild(sprite);
                                    }
                                }
                            }catch(e){}
                        }
                    }
                    container2._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(container2.width+128+this.startAt,container2.height+128+this.startAt);
                    Graphics.app.renderer.render(container2,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray2[this.width-1][this.height-1].sprites[0].position.x - this.mapArray2[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray2[this.width-1][this.height-1].sprites[0].position.y - this.mapArray2[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    mapSprite.visible = false;
                    this.mapTextures.push(mapSprite);
                    Graphics.worldContainer.addChild(mapSprite);
                    container2.removeChildren();

                    //2
                    var container3 = new PIXI.Container();
                    for (var i = this.height-1;i>=0;i--){
                        this.mapArray3[''+(this.height-1-i)] = {};
                        for (var j = this.width-1; j >= 0;j--){
                            var node = this.mapArray[i][j];
                            this.mapArray3[''+(this.height-1-i)][''+(this.width-1-j)] = {h: node.h,sprites: []};
                            for (var k = 0;k <=node.h;k++){
                                var sprite = node.sprites[k];
                                sprite.texture = Graphics.getResource('base_tile1');
                                sprite.position.x = this.startAt + (this.width-1-j)*(this.tileSizeActual*0.875) + (this.tileSizeActual*0.4375*(i%2));
                                sprite.position.y = this.startAt + (this.height-1-i)*(this.tileSizeActual*0.75) - (25*k);
                                this.mapArray3[''+(this.height-1-i)][''+(this.width-1-j)].sprites.push(sprite);
                                container3.addChild(sprite);
                            } 
                        }
                    }
                    container3._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(container3.width+128+this.startAt,container3.height+128+this.startAt);
                    Graphics.app.renderer.render(container3,texture);
                    var mapSprite = new PIXI.Sprite(texture);
                    //get the anchor point
                    mapSprite.anchor.x = (this.startAt + (this.mapArray3[this.height-1][this.width-1].sprites[0].position.x - this.mapArray3[0][0].sprites[0].position.x)/2)/mapSprite.width;
                    mapSprite.anchor.y = (this.startAt + (this.mapArray3[this.height-1][this.width-1].sprites[0].position.y - this.mapArray3[0][0].sprites[0].position.y)/2)/mapSprite.height;
                    mapSprite.visible = false;
                    this.mapTextures.push(mapSprite);
                    Graphics.worldContainer.addChild(mapSprite);

                    //3
                    var container4 = new PIXI.Container();
                    for (var i = 0;i<this.width;i++){
                        this.mapArray4[i] = {};
                        for (var j = this.height-1; j>=-1 ;j-=2){
                            try{
                                var node = this.mapArray[j][i];
                                this.mapArray4[i][''+(this.height-1-j)] = {h: node.h,sprites: []};
                                for (var k = 0;k <=node.h;k++){
                                    var sprite = node.sprites[k];
                                    sprite.texture = Graphics.getResource('base_tile2');
                                    sprite.position.x = this.startAt + (this.height-1-j)*(this.tileSizeActual*0.74);
                                    sprite.position.y = this.startAt + i*(this.tileSizeActual*0.875) - (this.tileSizeActual*0.4375*((this.height-1-j)%2)) - (25*k);
                                    container4.addChild(sprite);
                                    this.mapArray4[i][''+(this.height-1-j)].sprites.push(sprite);
                                }
                            }catch(e){};
                            
                        }
                        for (var j = this.height-1; j>=-1 ;j-=2){
                            try{
                                if (j != this.height-1){
                                    var node = this.mapArray[j+1][i];
                                    this.mapArray4[i][''+(this.height-2-j)] = {h: node.h,sprites: []};
                                    for (var k = 0;k <=node.h;k++){
                                        var sprite = node.sprites[k];
                                        sprite.texture = Graphics.getResource('base_tile2');
                                        sprite.position.x = this.startAt + (this.height-2-j)*(this.tileSizeActual*0.74);
                                        sprite.position.y = this.startAt + i*(this.tileSizeActual*0.875) + (this.tileSizeActual*0.4375*((this.height-2-j)%2)) - (25*k);
                                        container4.addChild(sprite);
                                        this.mapArray4[i][''+(this.height-2-j)].sprites.push(sprite);
                                    }
                                }
                            }catch(e){
                                console.log(e);
                            };
                        }
                    }
                    container4._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(container4.width+128+this.startAt,container4.height+128+this.startAt);
                    Graphics.app.renderer.render(container4,texture);
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
                },

                update: function(dt) {
                    if (this.rotateData){
                        this.rotateData.t += dt;
                        Graphics.world.filters = [this.blurFilter];
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
                        if (this.rotateData.dir == 'right'){
                            Graphics.world.rotation = (1.5708*(this.rotateData.t/this.rotateData.time)-(this.rotateData.extraRot*1.5708));
                        }if (this.rotateData.dir == 'left'){
                            Graphics.world.rotation = (-1.5708*(this.rotateData.t/this.rotateData.time)+(this.rotateData.extraRot*1.5708));
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
