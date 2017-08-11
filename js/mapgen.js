
(function(window) {
    MapGen = {
        getNewMap: function(){
            return {
                TILE_SIZE: 128,
                startAt: null, //TODO this should be to compensate for max tile height
                bounds: null,
                mapArray: null,
                mapTexture: null,
                spriteArray: null,
                height: null,
                width: null,
                tileScale: null,
                tileSizeActual: null,
                init: function(data) {
                    this.height = data.height;
                    this.width = data.width;
                    this.startAt = data.startAt;
                    this.bounds = [this.TILE_SIZE*(this.width-1.5) + this.startAt, this.TILE_SIZE * (this.height*.75 - 1.5) + this.startAt];
                    this.tileScale = 1;
                    this.tileSizeActual = this.TILE_SIZE/this.tileScale;
                    this.mapArray = [];
                    var container = new PIXI.Container();
                    for (var i = 0; i < this.height;i++){
                        var a = [];
                        for (var j = 0;j < this.width;j++){
                            a.push({h: Math.floor(Math.random()*10),sprites: []});
                        }
                        this.mapArray.push(a);
                    }
                    for (var i = 0; i < this.height;i++){
                        var a = [];
                        for (var j = 0;j < this.width;j++){
                            var node = this.mapArray[i][j];
                            for (var k = 0;k <=node.h;k++){
                                var sprite = Graphics.getSprite('tile');
                                sprite.position.x = this.startAt + j*(this.tileSizeActual) - (this.tileSizeActual/2*(i%2));
                                sprite.position.y = this.startAt + i*(this.tileSizeActual*0.75) - (25*k);
                                sprite.anchor.x = .5;
                                sprite.anchor.y = .5;
                                sprite.scale.x = this.tileScale;
                                sprite.scale.y = this.tileScale;
                                sprite.loc = {x: i,y: j,z: k};
                                /*sprite.on('pointerover', function onMouseOver(e){
                                    e.target.tint = 0x797979;
                                });
                                sprite.on('pointerout', function onMouseOver(e){
                                    //e.target.tint = 0xFFFFFF;
                                });*/
                                container.addChild(sprite);
                                //this.mapArray[i][j].sprites.push(sprite);
                            } 
                        }
                    }
                    console.log(container);
                    container._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(container.width,container.height);
                    console.log(texture);
                    Graphics.app.renderer.render(container,texture);
                    this.mapTexture = new PIXI.Sprite(texture);
                    Graphics.worldContainer.addChild(this.mapTexture);
                },

                update: function(dt) {

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
