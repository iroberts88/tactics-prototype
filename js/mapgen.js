
(function(window) {
    MapGen = {
        TILE_SIZE: 17,
        TILE_HEIGHT: 11,
        MAX_TOOL_SIZE: 10,
        MIN_SENSITIVITY: 1,
        MAX_SENSITIVITY: 15,
        MAX_NODE_HEIGHT: 20,
        CHAR_HEIGHT: 1, //the height of LOS 'characters'

        ZOOM_SETTINGS: [0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0],
        currentZoomSetting: 5,

        YSCALE_SETTINGS: [0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0],
        currentYScaleSetting: 7,

        type: null,
        size: null,
        maxSize: null,
        // axial and cube maps
        axialMap: null,
        cubeMap: null,

        currentMap: 0,
        totalRotations: null,

        container: null, //container for all sprites
        container2: null,

        cAverages: null, //the average of all sprite locations (used for correct rotations)

        rotateData: null,
        currentRotation: 0,

        currentTool: 'height',
        toolSize: 1,
        sensitivity: 4,

        currentTileType: 'base',

        selectedSprite: null,
        setNewSelectedNode: 0,
        dragStart: null,

        removeDescText: 0,

        tileCount: 0,//the total number of tiles on the map

        currentlyMousedOver: null,
        pathToolData: null,
        losToolData: null,
        currentLOS: 5,
        losDrawn: false,

        init: function() {
            this.drawBG();
            //create all of the tile textures!
            if (this.type == 't'){
                this.maxSize = Math.round(this.size*1.5)
            }else if (this.type == 'h'){
                this.maxSize = Math.round(this.size*2)
            }else {
                this.maxSize = this.size[0] + this.size[1];
            }
            this.tileTextures = {}
            this.tileTypes = ['base','grass','dirt','ice','snow','sand'];
            for (var i = 0; i < this.tileTypes.length;i++){
                var t = this.tileTypes[i];
                this.tileTextures[this.tileTypes[i]] = {1: [],2:[]};
                for (var h = 0;h <= this.MAX_NODE_HEIGHT;h++){
                    //create new texture
                    var c = new PIXI.Container();
                    var startingLoc = 32 + h*MapGen.TILE_HEIGHT;
                    for (var j = 0; j <= h;j++){
                        var s = Graphics.getSprite(t + '_tile1');
                        s.anchor.x = 0.0;
                        s.anchor.y = 0.5;
                        s.position.x = 0;
                        s.position.y = startingLoc + j*-MapGen.TILE_HEIGHT;
                        c.addChild(s)
                    }
                    c._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(c.width,c.height);
                    Graphics.app.renderer.render(c,texture);
                    this.tileTextures[this.tileTypes[i]][1].push(texture);
                    c.removeChildren();
                    for (var j = 0; j <= h;j++){
                        var s = Graphics.getSprite(t + '_tile2');
                        s.anchor.x = 0.0;
                        s.anchor.y = 0.5;
                        s.position.x = 0;
                        s.position.y = startingLoc + j*-MapGen.TILE_HEIGHT;
                        c.addChild(s)
                    }
                    c._calculateBounds();
                    var texture = new PIXI.RenderTexture.create(c.width,c.height);
                    Graphics.app.renderer.render(c,texture);
                    this.tileTextures[this.tileTypes[i]][2].push(texture);
                }
            }

            //create tool buttons
            var style = {
                font: '32px Orbitron', 
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

            //Select Tool Text
            this.toolText = AcornSetup.makeButton({
                text: 'Tool Selector',
                style: style,
            });
            this.toolText.position.x = 25 + this.toolText.width/2;
            this.toolText.position.y = 25 + this.toolText.height/2;
            Graphics.uiContainer.addChild(this.toolText);

            
            this.heightTool = AcornSetup.makeButton({
                text: 'Height',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'height';
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Select a tile and drag vertically to change height';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.heightTool.position.x = 25 + this.heightTool.width/2;
            this.heightTool.position.y = this.toolText.position.y + 50 + this.toolText.height/2 + 10;
            Graphics.uiContainer.addChild(this.heightTool);

            this.landscapeTool = AcornSetup.makeButton({
                text: 'Landscape',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'landscape';
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Select a tile and drag vertically to create mountains and valleys';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.landscapeTool.position.x =  25 + this.heightTool.width/2 + 80 + this.landscapeTool.width/2;;
            this.landscapeTool.position.y = this.toolText.position.y + 50 + this.toolText.height/2 + 10;
            Graphics.uiContainer.addChild(this.landscapeTool);

            this.noiseTool = AcornSetup.makeButton({
                text: 'Noise',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'noise';
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Select and hold to add random height to an area';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.noiseTool.position.x = 25 + this.noiseTool.width/2;
            this.noiseTool.position.y = this.landscapeTool.position.y + this.landscapeTool.height/2 + this.noiseTool.height/2 + 10;
            Graphics.uiContainer.addChild(this.noiseTool);

            this.tilesTool = AcornSetup.makeButton({
                text: 'Tiles',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'tiles';
                    MapGen.sandTile.visible = true;
                    MapGen.baseTile.visible = true;
                    MapGen.grassTile.visible = true;
                    MapGen.iceTile.visible = true;
                    MapGen.snowTile.visible = true;
                    MapGen.dirtTile.visible = true;
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Paint land with selected tile type';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.tilesTool.position.x = 25 + this.noiseTool.width/2 + 75 + this.tilesTool.width/2;
            this.tilesTool.position.y = this.landscapeTool.position.y + this.landscapeTool.height/2 + this.noiseTool.height/2 + 10;
            Graphics.uiContainer.addChild(this.tilesTool);

            this.pathTool = AcornSetup.makeButton({
                text: 'Path',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'path';
                    MapGen.pathToolData = {
                        currentPath: null,
                        startTile: null,
                        jumpHeight: 3,
                        endTile: null
                    };
                    MapGen.toolSize = 1;
                    MapGen.jumpHeight.visible = true;
                    MapGen.jumpHeightNum.visible = true;
                    MapGen.jumpHeightPlus.visible = true;
                    MapGen.jumpHeightMinus.visible = true;
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Simulate unit movement. Click a tile and drag to view the paths to other tiles';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.pathTool.position.x = 25 + this.noiseTool.width/2 + 75 + this.tilesTool.width/2 + 75 + this.pathTool.width/2;
            this.pathTool.position.y = this.landscapeTool.position.y + this.landscapeTool.height/2 + this.pathTool.height/2 + 10;
            Graphics.uiContainer.addChild(this.pathTool);

            this.deleteTool = AcornSetup.makeButton({
                text: 'Delete',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'delete';
                    MapGen.toolSize = 1;
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Click a tile to delete it from the map. Cannot delete a tile that would create 2 seperate unreachable areas';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.deleteTool.position.x = 25 + this.deleteTool.width/2;
            this.deleteTool.position.y = this.tilesTool.position.y + this.tilesTool.height/2 + this.deleteTool.height/2 + 10;
            Graphics.uiContainer.addChild(this.deleteTool);

            this.addTool = AcornSetup.makeButton({
                text: 'Add',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'add';
                    MapGen.toolSize = 1;
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = "Click a tile to add tiles in all deleted spaces around it. Can't add tiles that weren't in the base map.";
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.addTool.position.x = 25 + this.addTool.width/2 + 70 + this.deleteTool.width/2;
            this.addTool.position.y = this.tilesTool.position.y + this.tilesTool.height/2 + this.deleteTool.height/2 + 10;
            Graphics.uiContainer.addChild(this.addTool);

            this.losTool = AcornSetup.makeButton({
                text: 'LOS',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'los';
                    MapGen.losToolData = {
                        spritesAltered: [],
                        losShown: false
                    };
                    //MapGen.losDistance.visible = true;
                    //MapGen.losDistanceNum.visible = true;
                    //MapGen.losDistancePlus.visible = true;
                    //MapGen.losDistanceMinus.visible = true;
                    MapGen.toolSize = 1;
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Simulate line of sight. Click a tile to view LOS. Red = no LOS.                   Yellow = Partial LOS.           Green = Full LOS';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.losTool.position.x = this.addTool.position.x + this.addTool.width/2 + 50 + this.losTool.width/2;
            this.losTool.position.y = this.tilesTool.position.y + this.tilesTool.height/2 + this.deleteTool.height/2 + 10;
            Graphics.uiContainer.addChild(this.losTool);

            //Select Tool Text
            this.toolDescriptionText = AcornSetup.makeButton({
                text: '',
                style: style,
            });
            this.toolDescriptionText.style.fontSize = 14;
            this.toolDescriptionText.style.wordWrap = true;
            this.toolDescriptionText.style.wordWrapWidth = 200;
            this.toolDescriptionText.position.x = 100 + this.toolDescriptionText.width;
            this.toolDescriptionText.position.y = this.addTool.position.y + 100 + this.toolDescriptionText.height;
            this.toolDescriptionText.visible = false;
            Graphics.uiContainer.addChild(this.toolDescriptionText);

            //create tiles tool options
            this.toolOptionsText = AcornSetup.makeButton({
                text: 'Tool Options',
                style: style,
            });
            this.toolOptionsText.position.x = Graphics.width-25 - this.toolText.width/2;
            this.toolOptionsText.position.y = 25 + this.toolText.height/2;
            Graphics.uiContainer.addChild(this.toolOptionsText);

            this.losDistance = AcornSetup.makeButton({
                text: 'LOS Distance: ',
                interactive: true,
                buttonMode: true,
            });
            this.losDistance.style.fontSize = 24;
            this.losDistance.position.x = this.toolOptionsText.position.x - this.losDistance.width/2;
            this.losDistance.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.losDistance);
            this.losDistancePlus = AcornSetup.makeButton({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.currentLOS < 50){
                        MapGen.currentLOS += 1;
                    }
                }
            });
            this.losDistancePlus.style.fontSize = 40;
            this.losDistancePlus.position.x = this.losDistance.position.x + this.losDistance.width/2 + 50;
            this.losDistancePlus.position.y = this.losDistance.position.y - this.losDistancePlus.height/2;
            Graphics.uiContainer.addChild(this.losDistancePlus);
            this.losDistanceMinus = AcornSetup.makeButton({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.currentLOS > 1){
                        MapGen.currentLOS -= 1;
                    }
                }
            });
            this.losDistanceMinus.style.fontSize = 40;
            this.losDistanceMinus.position.x = this.losDistance.position.x + this.losDistance.width/2 + 50;
            this.losDistanceMinus.position.y = this.losDistance.position.y + this.losDistanceMinus.height/2;
            Graphics.uiContainer.addChild(this.losDistanceMinus);

            this.losDistanceNum = AcornSetup.makeButton({
                text: '0',
                interactive: true,
                buttonMode: true,
            });
            this.losDistanceNum.style.fontSize = 24;
            this.losDistanceNum.position.x = this.losDistance.position.x;
            this.losDistanceNum.position.y = this.losDistance.position.y + this.losDistance.height/2 + this.losDistanceNum.height/2;
            Graphics.uiContainer.addChild(this.losDistanceNum);

            this.jumpHeight = AcornSetup.makeButton({
                text: 'Max Jump Height: ',
                interactive: true,
                buttonMode: true,
            });
            this.jumpHeight.style.fontSize = 24;
            this.jumpHeight.position.x = this.toolOptionsText.position.x - this.jumpHeight.width/2;
            this.jumpHeight.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.jumpHeight);
            this.jumpHeightPlus = AcornSetup.makeButton({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.pathToolData.jumpHeight < 20){
                        MapGen.pathToolData.jumpHeight += 1;
                    }
                }
            });
            this.jumpHeightPlus.style.fontSize = 40;
            this.jumpHeightPlus.position.x = this.jumpHeight.position.x + this.jumpHeight.width/2 + 50;
            this.jumpHeightPlus.position.y = this.jumpHeight.position.y - this.jumpHeightPlus.height/2;
            Graphics.uiContainer.addChild(this.jumpHeightPlus);
            this.jumpHeightMinus = AcornSetup.makeButton({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.pathToolData.jumpHeight > 0){
                        MapGen.pathToolData.jumpHeight -= 1;
                    }
                }
            });
            this.jumpHeightMinus.style.fontSize = 40;
            this.jumpHeightMinus.position.x = this.jumpHeight.position.x + this.jumpHeight.width/2 + 50;
            this.jumpHeightMinus.position.y = this.jumpHeight.position.y + this.jumpHeightMinus.height/2;
            Graphics.uiContainer.addChild(this.jumpHeightMinus);

            this.jumpHeightNum = AcornSetup.makeButton({
                text: '0',
                interactive: true,
                buttonMode: true,
            });
            this.jumpHeightNum.style.fontSize = 24;
            this.jumpHeightNum.position.x = this.jumpHeight.position.x;
            this.jumpHeightNum.position.y = this.jumpHeight.position.y + this.jumpHeight.height/2 + this.jumpHeightNum.height/2;
            Graphics.uiContainer.addChild(this.jumpHeightNum);

            this.baseTile = AcornSetup.makeButton({
                sprite: 'base_tile2',
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTileType = 'base';
                }
            });
            this.baseTile.position.x = this.toolOptionsText.position.x - this.baseTile.width/2;
            this.baseTile.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.baseTile);
            this.dirtTile = AcornSetup.makeButton({
                sprite: 'dirt_tile2',
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTileType = 'dirt';
                }
            });
            this.dirtTile.position.x = this.toolOptionsText.position.x + this.dirtTile.width/2;
            this.dirtTile.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.dirtTile);
            this.grassTile = AcornSetup.makeButton({
                sprite: 'grass_tile2',
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTileType = 'grass';
                }
            });
            this.grassTile.position.x = this.toolOptionsText.position.x - this.grassTile.width/2;
            this.grassTile.position.y = this.dirtTile.position.y + this.dirtTile.height;
            Graphics.uiContainer.addChild(this.grassTile);
            this.snowTile = AcornSetup.makeButton({
                sprite: 'snow_tile2',
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTileType = 'snow';
                }
            });
            this.snowTile.position.x = this.toolOptionsText.position.x + this.snowTile.width/2;
            this.snowTile.position.y = this.dirtTile.position.y + this.dirtTile.height;
            Graphics.uiContainer.addChild(this.snowTile);
            this.iceTile = AcornSetup.makeButton({
                sprite: 'ice_tile2',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTileType = 'ice';
                }
            });
            this.iceTile.position.x = this.toolOptionsText.position.x - this.iceTile.width/2;
            this.iceTile.position.y = this.snowTile.position.y + this.snowTile.height;
            Graphics.uiContainer.addChild(this.iceTile);
            this.sandTile = AcornSetup.makeButton({
                sprite: 'sand_tile2',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTileType = 'sand';
                }
            });
            this.sandTile.position.x = this.toolOptionsText.position.x + this.sandTile.width/2;
            this.sandTile.position.y = this.snowTile.position.y + this.snowTile.height;
            Graphics.uiContainer.addChild(this.sandTile);


            //create size buttons
            this.sizeText = AcornSetup.makeButton({
                text: 'Tool Size: 1',
                style: style,
            });
            this.sizeText.style.fontSize = 32;
            this.sizeText.position.x = 25 + this.sizeText.width/2;
            this.sizeText.position.y = Graphics.height - 200 - this.sizeText.height/2;
            Graphics.uiContainer.addChild(this.sizeText);

            this.sizePlus = AcornSetup.makeButton({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.toolSize < MapGen.MAX_TOOL_SIZE && MapGen.currentTool != 'add' && MapGen.currentTool != 'delete' && MapGen.currentTool != 'path' && MapGen.currentTool != 'los'){
                        MapGen.toolSize += 1;
                    }
                }
            });
            this.sizePlus.style.fontSize = 40;
            this.sizePlus.position.x = this.sizeText.position.x + this.sizeText.width/2 + 50;
            this.sizePlus.position.y = this.sizeText.position.y - this.sizePlus.height/2;
            Graphics.uiContainer.addChild(this.sizePlus);
            this.sizeMinus = AcornSetup.makeButton({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.toolSize > 1 && MapGen.currentTool != 'add' && MapGen.currentTool != 'delete' && MapGen.currentTool != 'path' && MapGen.currentTool != 'los'){
                        MapGen.toolSize -= 1;
                    }
                }
            });
            this.sizeMinus.style.fontSize = 40;
            this.sizeMinus.position.x = this.sizeText.position.x + this.sizeText.width/2 + 50;
            this.sizeMinus.position.y = this.sizeText.position.y + this.sizeMinus.height/2;
            Graphics.uiContainer.addChild(this.sizeMinus);

            this.rotateText = AcornSetup.makeButton({
                text: 'Rotate (A,D)',
                style: style,
            });
            this.rotateText.style.fontSize = 20;
            this.rotateText.position.x = Graphics.width/2;
            this.rotateText.position.y = this.rotateText.height/2;
            Graphics.uiContainer.addChild(this.rotateText);

            this.rotateLeft = AcornSetup.makeButton({
                text: '◄',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.ROTATE1, true);
                }
            });
            this.rotateLeft.style.fontSize = 40;
            this.rotateLeft.position.x = Graphics.width/2 - this.rotateLeft.width/2;
            this.rotateLeft.position.y = this.rotateLeft.height/2 + this.rotateText.height/2+5;
            Graphics.uiContainer.addChild(this.rotateLeft);
            this.rotateRight = AcornSetup.makeButton({
                text: '►',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.ROTATE2, true);
                }
            });
            this.rotateRight.style.fontSize = 40;
            this.rotateRight.position.x = Graphics.width/2 + this.rotateRight.width/2;
            this.rotateRight.position.y = this.rotateRight.height/2 + this.rotateText.height/2+5;
            Graphics.uiContainer.addChild(this.rotateRight);

            this.yScaleText = AcornSetup.makeButton({
                text: 'Vert Shift (W,S)',
                style: style,
            });
            this.yScaleText.style.fontSize = 20;
            this.yScaleText.position.x = Graphics.width/3;
            this.yScaleText.position.y = this.yScaleText.height/2;
            Graphics.uiContainer.addChild(this.yScaleText);

            this.yScaleLeft = AcornSetup.makeButton({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.YSCALE1, true);
                }
            });
            this.yScaleLeft.style.fontSize = 40;
            this.yScaleLeft.position.x = Graphics.width/3 - this.yScaleLeft.width/2;
            this.yScaleLeft.position.y = this.yScaleLeft.height/2 + this.yScaleText.height/2+5;
            Graphics.uiContainer.addChild(this.yScaleLeft);
            this.yScaleRight = AcornSetup.makeButton({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.YSCALE2, true);
                }
            });
            this.yScaleRight.style.fontSize = 40;
            this.yScaleRight.position.x = Graphics.width/3 + this.yScaleRight.width/2;
            this.yScaleRight.position.y = this.yScaleRight.height/2 + this.yScaleText.height/2+5;
            Graphics.uiContainer.addChild(this.yScaleRight);

            this.zoomText = AcornSetup.makeButton({
                text: 'Zoom (mwheel)',
                style: style,
            });
            this.zoomText.style.fontSize = 20;
            this.zoomText.position.x = Graphics.width/1.5;
            this.zoomText.position.y = this.zoomText.height/2;
            Graphics.uiContainer.addChild(this.zoomText);

            this.zoomUp = AcornSetup.makeButton({
                text: '+',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Settings.zoom('in');
                }
            });
            this.zoomUp.style.fontSize = 40;
            this.zoomUp.position.x = Graphics.width/1.5 - this.zoomUp.width/2 - 20;
            this.zoomUp.position.y = this.zoomUp.height/2 + this.zoomText.height/2+5;
            Graphics.uiContainer.addChild(this.zoomUp);
            this.zoomDown = AcornSetup.makeButton({
                text: '-',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Settings.zoom('out');
                }
            });
            this.zoomDown.style.fontSize = 40;
            this.zoomDown.position.x = Graphics.width/1.5 + this.zoomDown.width/2 + 20;
            this.zoomDown.position.y = this.zoomDown.height/2 + this.zoomText.height/2+5;
            Graphics.uiContainer.addChild(this.zoomDown);

            this.sensitivityText = AcornSetup.makeButton({
                text: 'Sensitivity: 4',
                style: style,
            });
            this.sensitivityText.style.fontSize = 32;
            this.sensitivityText.position.x = 25 + this.sensitivityText.width/2;
            this.sensitivityText.position.y = Graphics.height - 75 - this.sensitivityText.height/2;
            Graphics.uiContainer.addChild(this.sensitivityText);

            this.sensitivityPlus = AcornSetup.makeButton({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.sensitivity < MapGen.MAX_SENSITIVITY){
                        MapGen.sensitivity += 1;
                    }
                }
            });
            this.sensitivityPlus.style.fontSize = 40;
            this.sensitivityPlus.position.x = this.sensitivityText.position.x + this.sensitivityText.width/2 + 50;
            this.sensitivityPlus.position.y = this.sensitivityText.position.y - this.sensitivityPlus.height/2;
            Graphics.uiContainer.addChild(this.sensitivityPlus);
            this.sensitivityMinus = AcornSetup.makeButton({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.sensitivity > MapGen.MIN_SENSITIVITY){
                        MapGen.sensitivity -= 1;
                    }
                }
            });
            this.sensitivityMinus.style.fontSize = 40;
            this.sensitivityMinus.position.x = this.sensitivityText.position.x + this.sensitivityText.width/2 + 50;
            this.sensitivityMinus.position.y = this.sensitivityText.position.y + this.sensitivityMinus.height/2;
            Graphics.uiContainer.addChild(this.sensitivityMinus);

            this.axialMap = {};
            this.axialDirections = [
                [1,0],[1,-1],[0,-1],
                [-1,0],[-1,1],[0,1]
            ];
            this.cubeMap = {};
            this.cubeDirections = [
                [1,-1,0],[1,0,-1],[0,1,-1],
                [-1,1,0],[-1,0,1],[0,-1,1]
            ];
            this.cubeDiagonals = [
                [+2, -1, -1], [+1, +1, -2], [-1, +2, -1], 
                [-2, +1, +1], [-1, -1, +2], [+1, -2, +1]
            ];
            this.allMaps = [];

            switch(this.type){
                case 'r':
                    this.totalRotations = 12;
                    this.initRectangle();
                    break;
                case 'rh':
                    this.totalRotations = 12;
                    this.initRhombus();
                    break;
                case 't':
                    this.totalRotations = 12;
                    this.initTriangle();
                    break;
                case 'h':
                    this.totalRotations = 12;
                    this.initHexagon();
                    break;
            }
        },
        //returns a cube node when given an axial node
        getCube: function(axialNode){
            return MapGen.cubeMap[axialNode.q][-axialNode.q-axialNode.r][axialNode.r];
        },
        //returns an axial node when given a cube node
        getAxial: function(cubeNode){
            return MapGen.axialMap[cubeNode.x][cubeNode.z];
        },
        //finds the neighbor of a cube node in <dir> direction
        getCubeNeighbor: function(cubeNode,direction){
            var d = this.cubeDirections[direction];
            try{
                return MapGen.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.z+d[2]];
            }catch(e){}
            return null;
        },
        //finds the diagonal neighbor of a cube node in <dir> direction
        getCubeDiagonalNeighbor: function(cubeNode,direction){
            var d = this.cubeDiagonals[direction];
            return MapGen.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.z+d[2]];
        },
        //finds the neighbor of an axial node in <dir> direction
        getAxialNeighbor: function(axialNode,direction){
            var d = this.axialDirections[direction];
            return MapGen.axialMap[axialNode.x+d[0]][axialNode.y+d[1]];
        },
        cubeRing: function(center,radius){
            //return a list of all nodes in a ring around a center node
            if (!radius){return [[center.x,center.y,center.z]];}
            var results = [];
            var cubeNode = [center.x+this.cubeDirections[4][0]*radius,center.y+this.cubeDirections[4][1]*radius,center.z+this.cubeDirections[4][2]*radius];
            for (var i = 0; i < 6;i++){
                for (var j = 0; j < radius;j++){
                    results.push(cubeNode);
                    var d = this.cubeDirections[i];
                    cubeNode = [cubeNode[0]+d[0],cubeNode[1]+d[1],cubeNode[2]+d[2]];
                }
            }
            return results;
        },
        cubeSpiral: function(center,radius){
            var results = [];
            for (var k = 0; k <= radius;k++){
                var arr = MapGen.cubeRing(center,k);
                for (var i = 0; i < arr.length;i++){
                    try{
                        var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                        results.push(arr[i]);
                    }catch(e){}
                }
            }
            return results;
        },
        cubeDistance: function(a,b){
            return Math.round(Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z)));
        },
        cubeRound: function(cube){
            var rx = Math.trunc(Math.round(cube.x));
            var ry = Math.trunc(Math.round(cube.y));
            var rz = Math.trunc(Math.round(cube.z));
            var x_diff = Math.abs(rx - cube.x);
            var y_diff = Math.abs(ry - cube.y);
            var z_diff = Math.abs(rz - cube.z);
            if (x_diff > y_diff && x_diff > z_diff){
                rx = parseInt(-ry-rz);
            }else if (y_diff > z_diff){
                ry = parseInt(-rx-rz);
            }else{
                rz = parseInt(-rx-ry);
            }
            return {
                x:rx,
                y: ry,
                z: rz
            }
        },
        lerp: function(a,b,t){
            return a + (b-a) * t;
        },
        cubeLerp: function(a,b,t){
            return {
                x: this.lerp(a.x,b.x,t),
                y: this.lerp(a.y,b.y,t),
                z: this.lerp(a.z,b.z,t)
            }
        },
        cubeLineDraw: function(a,b){
            var N = Math.max(1,this.cubeDistance(a,b));
            var results = [];
            for (var i = 0; i <=N;i++){
                var cube = this.cubeRound(this.cubeLerp(a,b,1.0/N*i));
                try{
                    var c = this.cubeMap[cube.x][cube.y][cube.z];
                    results.push(c);
                }catch(e){}
            }
            return results;
        },

        initCubeMap: function(){
            //Take an axial map and create its cube map counterpart
            for (var i in this.axialMap){
                for (var j in this.axialMap[i]){
                    if (typeof this.cubeMap[i] == 'undefined'){
                        this.cubeMap[i] = {}
                    }
                    var y = -i-j;
                    if (typeof this.cubeMap[i][y] == 'undefined'){
                        this.cubeMap[i][y] = {}
                    }
                    var node = {
                        x: parseInt(i),
                        y: parseInt(-i-j),
                        z: parseInt(j),
                        ghost:false
                    }
                    this.cubeMap[node.x][node.y][node.z] = node;
                }
            }
        },
        findPath: function(startNode,endNode,skip,maxJump){

            //A* search
            //map = map object
            //start = starting axial node;
            //end = ending axial node
            //returns empty array if no path exists
            //returns path array if path exists [node,node,node,...]

            startNode.f = 0;
            startNode.g = 0;
            startNode.h = 0;
            startNode.parent = null;
            endNode.f = 0;
            endNode.g = 0;
            endNode.h = 0;
            endNode.parent = null;

            if (typeof maxJump == 'undefined'){
                maxJump = 99;
            }

            var openList   = [];
            var closedList = [];
            openList.push(startNode);

            while(openList.length > 0) {
                // Grab the lowest f(x) to process next
                var lowInd = 0;
                for(var i=0; i<openList.length; i++) {
                    if(openList[i].f < openList[lowInd].f) { lowInd = i; }
                }
                var currentNode = openList[lowInd];

                if(currentNode.x == endNode.x && currentNode.y == endNode.y && currentNode.z == endNode.z) {
                    var curr = currentNode;
                    var ret = [];
                    while(curr.parent) {
                        ret.push(curr);
                        curr = curr.parent;
                    }
                    var arr = ret.reverse();
                    arr.unshift(startNode)
                    return arr;
                }

                // Normal case -- move currentNode from open to closed, process each of its neighbors
                this.removeGraphNode(openList,currentNode);
                closedList.push(currentNode);
                var currentAxial = this.getAxial(currentNode);

                //process neighbors
                for (var i = 0;i < 6;i++){
                    var node = this.getCubeNeighbor(currentNode,i);
                    //first check if the node exists
                    if (node){
                        var axial = this.getAxial(node);
                        if(this.findGraphNode(closedList,node) || node == skip || node.deleted || axial.h - currentAxial.h > maxJump) { //TODO check Height here as well
                            // not a valid node to process, skip to next neighbor
                            continue;
                        }
                        var newNode = false;
                        if(!this.findGraphNode(openList,node)) {
                            //new node, initialize
                            newNode = true;
                            node.g = 0;
                            node.h = 0;
                            node.f = 0;
                            node.parent = null;
                        }

                        // g score is the shortest distance from start to current node, check if the path we have arrived
                        //at this neighbor is the shortest one we have seen yet
                        var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
                        var gScoreIsBest = false;

                        if(newNode) {
                            // This the the first time we have arrived at this node, it must be the best
                            gScoreIsBest = true;
                            //take heuristic score
                            node.h = Math.max(Math.abs(endNode.x-node.x),Math.abs(endNode.y-node.y),Math.abs(endNode.z-node.z));
                            openList.push(node);
                        }else if(gScore < node.g) {
                            // We have already seen the node, but last time it had a worse g (distance from start)
                            gScoreIsBest = true;
                        }

                        if(gScoreIsBest) {
                            // Found an optimal (so far) path to this node.  Store info on how we got here and how good it is
                            node.parent = currentNode;
                            node.g = gScore;
                            node.f = node.g + node.h;
                        }
                    }
                }
            }

            // No result was found -- empty array signifies failure to find path
            return [];
        }, 
        removeGraphNode:  function(arr,node){
            //for use in astar
            //removes node 'node' from array 'arr'
            for (var i = 0;i < arr.length;i++){
                if (arr[i] == node){
                    arr.splice(i,1);
                }
            }
        },
        findGraphNode:  function(arr,node){
            //for use in astar
            //searches array 'arr' for node 'node'
            //returns true if array contains node
            //returns false if array doesnt contain node
            for (var i = 0;i < arr.length;i++){
                if (arr[i] == node){
                    return true;
                }
            }
            return false;
        },
        //sort a list of sprites to be added to a container
        mergeSort: function(arr){
            if (arr.length <= 1){
                return arr;
            }
            var middle = parseInt(arr.length/2);
            var left = arr.slice(0,middle);
            var right = arr.slice(middle,arr.length);
            return MapGen.merge(MapGen.mergeSort(left),MapGen.mergeSort(right));
        },
        merge: function(left,right){
            var result = [];
            while (left.length && right.length) {
                if (left[0].position.y < right[0].position.y) {
                    result.push(left.shift());
                } else if (left[0].position.y == right[0].position.y) {
                    //if they are the same height, sort by z direction
                    var leftNode = this.axialMap[left[0].axialCoords.q][left[0].axialCoords.r];
                    var rightNode = this.axialMap[right[0].axialCoords.q][right[0].axialCoords.r];
                    if (leftNode.h <= rightNode.h){
                        result.push(left.shift());
                    }else{
                        result.push(right.shift());
                    }
                }else{
                    result.push(right.shift());
                }
            }

            while (left.length)
                result.push(left.shift());

            while (right.length)
                result.push(right.shift());

            return result;
        },

        initRectangle: function(){
            console.log('Generating a ' + this.size[0] + 'x' + this.size[1] + ' Rectangle Map');
            //Generate the cube and axial coordinate systems
            for (var j = 0; j < this.size[1];j++){
                for (var i = 0+(Math.ceil(-j/2)); i < this.size[0]+(Math.ceil(-j/2));i++){
                    if (typeof this.axialMap[i] == 'undefined'){
                        this.axialMap[i] = {}
                    }
                    var node = this.getAxialNode(i,j);
                    this.axialMap[i][j] = node;
                    this.tileCount += 1;
                }
            }
            this.initCubeMap();
            //set up the sprites for all 12 rotations
            this.getHexContainer();
            Graphics.worldContainer.addChild(this.container2);
        },
        initRhombus: function(){
            console.log('Generating a ' + this.size[0] + 'x' + this.size[1] + ' Rhombus Map');
            //Generate the cube and axial coordinate systems
            for (var i = 0; i < this.size[0];i++){
                var row = {};
                for (var j = 0; j < this.size[1];j++){
                    var node = this.getAxialNode(i,j);
                    row[j] = node;
                    this.tileCount += 1;
                }
                this.axialMap[i] = row;
            }
            this.initCubeMap();
            //set up the sprites for all 12 rotations
            this.getHexContainer();
            Graphics.worldContainer.addChild(this.container2);
        },
        initTriangle: function(){
            console.log('Generating a ' + this.size + ' unit Triangle Map');
            //Generate the cube and axial coordinate systems
            for (var i = 0; i < this.size;i++){
                if (typeof this.axialMap[i] == 'undefined'){
                    this.axialMap[i] = {};
                    this.tileCount += 1;
                }
                for (var j = 0; j < this.size;j++){
                    if (Math.sqrt((i+j)*(i+j)) < this.size){
                        var node = this.getAxialNode(i,j);
                        this.axialMap[i][j] = node;
                    }
                }
            }
            this.initCubeMap();
            //set up the sprites for all 12 rotations
            this.getHexContainer();
            Graphics.worldContainer.addChild(this.container2);
        },
        initHexagon: function(){
            console.log('Generating a ' + this.size + ' unit Hexagon Map');
            //Generate the cube and axial coordinate systems
            for (var i = this.size*-1; i <=this.size;i++){
                var row = {};
                for (var j = this.size*-1; j <=this.size;j++){
                    if (Math.sqrt((i+j)*(i+j)) <= this.size){
                        var node = this.getAxialNode(i,j);
                        row[j] = node;
                        this.tileCount += 1;
                    }
                }
                this.axialMap[i] = row;
            }
            this.initCubeMap();
            //set up the sprites for all 12 rotations
            this.getHexContainer();
            Graphics.worldContainer.addChild(this.container2);
            
        },
        getHexContainer: function(){
            this.container1 = new PIXI.Container();
            this.container1.interactive = true;
            this.container2 = new PIXI.Container();
            this.container2.interactive = true;
            var cAverages ={};

            for (var i = 0; i <12;i++){
                cAverages[i] = {};
                for (var j = 0; j <this.ZOOM_SETTINGS.length;j++){
                    cAverages[i][j] = {};
                    for (var k = 0; k < this.YSCALE_SETTINGS.length;k++){
                        cAverages[i][j][k] = {
                            x: 0,
                            y: 0
                        }
                    }
                }
            }
            var totalNodes = 0;
            for (var x in this.axialMap){
                for (var y in this.axialMap[x]){
                    totalNodes += 1;
                    var node = this.axialMap[x][y];
                    var yScale = this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting];
                    var xScale = this.ZOOM_SETTINGS[this.currentZoomSetting];
                    node.sprite2= Graphics.getSprite('base_tile2');
                    node.sprite1= Graphics.getSprite('base_tile1');
                    node.sprite1.scale.y = yScale;
                    node.sprite2.scale.y = yScale;
                    node.sprite1.scale.x = xScale;
                    node.sprite2.scale.x = xScale;
                    var cube = MapGen.getCube(node);
                    //get all of the rotated positions!!
                    node.sprite2.rotatedPositions = {};
                    node.sprite2.position.x = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting] * 1.5 * cube.x;
                    node.sprite2.position.y = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting] * Math.sqrt(3) * (cube.y+cube.x/2);
                    node.sprite2.rotatedPositions[0] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[0][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[0][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * cube.x,
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (cube.y+cube.x/2)
                            };
                            cAverages[0][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * cube.x;
                            cAverages[0][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (cube.y+cube.x/2);
                        }
                    }
                    var newCube = [-cube.z,-cube.x,-cube.y];
                    node.sprite2.rotatedPositions[2] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[2][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[2][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube[0],
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube[1]+newCube[0]/2)
                            };
                            cAverages[2][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube[0];
                            cAverages[2][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube[1]+newCube[0]/2);
                        }
                    }
                    var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                    node.sprite2.rotatedPositions[4] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[4][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[4][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube2[0],
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube2[1]+newCube2[0]/2)
                            };
                            cAverages[4][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube2[0];
                            cAverages[4][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube2[1]+newCube2[0]/2);
                        }
                    }
                    var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                    node.sprite2.rotatedPositions[6] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[6][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[6][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube3[0],
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube3[1]+newCube3[0]/2)
                            };
                            cAverages[6][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube3[0];
                            cAverages[6][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube3[1]+newCube3[0]/2);
                        }
                    }
                    var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                    node.sprite2.rotatedPositions[8] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[8][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[8][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube4[0],
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube4[1]+newCube4[0]/2)
                            };
                            cAverages[8][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube4[0];
                            cAverages[8][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube4[1]+newCube4[0]/2);
                        }
                    }
                    var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                    node.sprite2.rotatedPositions[10] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[10][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[10][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube5[0],
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube5[1]+newCube5[0]/2)
                            };
                            cAverages[10][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube5[0];
                            cAverages[10][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube5[1]+newCube5[0]/2);
                        }
                    }
                    node.sprite1.rotatedPositions = {};
                    node.sprite1.position.y = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting] * 1.5 * cube.y;
                    node.sprite1.position.x = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting] * Math.sqrt(3) * (cube.x+cube.y/2);
                    node.sprite1.rotatedPositions[1] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[1][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[1][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (cube.x+(cube.y/2)),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * this.YSCALE_SETTINGS[j] * 1.5 * cube.y
                            };
                            cAverages[1][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (cube.x+cube.y/2);
                            cAverages[1][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * cube.y;
                        }
                    }
                    var newCube = [-cube.z,-cube.x,-cube.y];
                    node.sprite1.rotatedPositions[3] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[3][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[3][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube[0]+newCube[1]/2),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube[1]
                            };
                            cAverages[3][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube[0]+newCube[1]/2);
                            cAverages[3][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube[1];
                        }
                    }
                    var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                    node.sprite1.rotatedPositions[5] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[5][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[5][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube2[0]+newCube2[1]/2),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube2[1]
                            };
                            cAverages[5][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube2[0]+newCube2[1]/2);
                            cAverages[5][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube2[1];
                        }
                    }
                    var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                    node.sprite1.rotatedPositions[7]= {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[7][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[7][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube3[0]+newCube3[1]/2),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube3[1]
                            };
                            cAverages[7][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube3[0]+newCube3[1]/2);
                            cAverages[7][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube3[1];
                        }
                    }
                    var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                    node.sprite1.rotatedPositions[9] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[9][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[9][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube4[0]+newCube4[1]/2),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube4[1]
                            };
                            cAverages[9][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube4[0]+newCube4[1]/2);
                            cAverages[9][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube4[1];
                        }
                    }
                    var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                    node.sprite1.rotatedPositions[11] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[11][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[11][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube5[0]+newCube5[1]/2),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube5[1]
                            };
                            cAverages[11][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube5[0]+newCube5[1]/2);
                            cAverages[11][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube5[1];
                        }
                    }

                    node.sprite1.anchor.x = .5;
                    node.sprite1.anchor.y = .5;
                    node.sprite1.axialCoords = {q:x,r:y};
                    node.sprite1.cubeCoords = {x:x,y:-x-y,z:y};
                    node.sprite1.interactive = true;
                    node.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT,32,32+this.TILE_HEIGHT);
                    MapGen.setupEvents(node.sprite1);
                    this.container1.addChild(node.sprite1);

                    node.sprite2.anchor.x = .5;
                    node.sprite2.anchor.y = .5;
                    node.sprite2.axialCoords = {q:x,r:y};
                    node.sprite2.cubeCoords = {x:x,y:-x-y,z:y};
                    node.sprite2.interactive = true;
                    node.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT,32,32+this.TILE_HEIGHT);
                    MapGen.setupEvents(node.sprite2);
                    this.container2.addChild(node.sprite2);
                }
            }
            for (var i in cAverages){
                for (var j in cAverages[i]){
                    for (var k in cAverages[i][j]){
                        cAverages[i][j][k].x = cAverages[i][j][k].x/totalNodes;
                        cAverages[i][j][k].y = cAverages[i][j][k].y/totalNodes;
                    }
                }
            }
            for (var x in this.axialMap){
                for (var y in this.axialMap[x]){
                    var node = this.axialMap[x][y];
                    for (var i = 0;i < 12;i+=2){
                        for(var j in node.sprite2.rotatedPositions[i]){
                            for (var k in node.sprite2.rotatedPositions[i][j]){
                                node.sprite2.rotatedPositions[i][j][k].x -= cAverages[i][j][k].x;
                                node.sprite2.rotatedPositions[i][j][k].y -= cAverages[i][j][k].y;
                            }
                        }
                    }
                    for (var i = 1;i < 12;i+=2){
                        for(var j in node.sprite1.rotatedPositions[i]){
                            for (var k in node.sprite1.rotatedPositions[i][j]){
                                node.sprite1.rotatedPositions[i][j][k].x -= cAverages[i][j][k].x;
                                node.sprite1.rotatedPositions[i][j][k].y -= cAverages[i][j][k].y;
                            }
                        }
                    }
                }
            }
            this.container1.children = MapGen.mergeSort(this.container1.children);
            this.container1.position.x = Graphics.width/2;
            this.container1.position.y = Graphics.height/2;
            this.container2.children = MapGen.mergeSort(this.container2.children);
            this.container2.position.x = Graphics.width/2;
            this.container2.position.y = Graphics.height/2;
            Graphics.worldPrimitives.position.x = Graphics.width/2;
            Graphics.worldPrimitives.position.y = Graphics.height/2;
        },
        updateSprites: function(arr, resetTint){
            if (typeof resetTint == 'undefined'){
                resetTint = false;
            }
            //updates sprite position in c.children arr after a rotation/zoom ect.
            for (var i = 0; i < arr.length;i++){
                arr[i].scale.x = this.ZOOM_SETTINGS[this.currentZoomSetting];
                arr[i].scale.y = this.YSCALE_SETTINGS[this.currentYScaleSetting]*this.ZOOM_SETTINGS[this.currentZoomSetting];
                arr[i].position.x = arr[i].rotatedPositions[this.currentRotation][this.currentZoomSetting][this.currentYScaleSetting].x;
                arr[i].position.y = arr[i].rotatedPositions[this.currentRotation][this.currentZoomSetting][this.currentYScaleSetting].y;
                if (resetTint){
                    arr[i].tint = 0xFFFFFF;
                }
            }
            return MapGen.mergeSort(arr);
        },
        setupEvents: function(sprite){
            //setup drag and click events for sprite
            sprite.clicked = false;
            sprite.on('pointerdown', function onClick(e){
                if (e.data.button != 2){
                    MapGen.dragStart = {x:Acorn.Input.mouse.X,y:Acorn.Input.mouse.Y};
                }
            });
            sprite.on('pointerup', function onClick(e){
                MapGen.dragStart = null;
                try{
                    if (MapGen.losToolData.losShown){
                        for (var i = 0; i < MapGen.losToolData.spritesAltered.length;i++){
                            MapGen.losToolData.spritesAltered[i].tint = 0xFFFFFF;
                        }
                        MapGen.losToolData.spritesAltered = [];
                        MapGen.losToolData.losShown = false;
                    }
                }catch(e){}
            });
            sprite.on('pointerupoutside', function onClick(e){
                MapGen.dragStart = null;
                var cubeNode = MapGen.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                var arr = MapGen.cubeSpiral(cubeNode,MapGen.toolSize-1);
                for (var i = 0;i < arr.length;i++){
                    var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                    var a = MapGen.getAxial(c);
                    var t = 1;
                    if (!(MapGen.currentRotation%2)){t = 2}
                    var s = a['sprite' + t];
                    s.tint = 0xFFFFFF;
                }
                try{
                    if (MapGen.losToolData.losShown){
                        for (var i = 0; i < MapGen.losToolData.spritesAltered.length;i++){
                            MapGen.losToolData.spritesAltered[i].tint = 0xFFFFFF;
                        }
                        MapGen.losToolData.spritesAltered = [];
                        MapGen.losToolData.losShown = false;
                    }
                }catch(e){}
            });
            sprite.on('pointerover', function onMove(e){
                if (!MapGen.dragStart || MapGen.currentTool == 'noise' || MapGen.currentTool == 'tiles'){
                    MapGen.setNewSelectedNode = sprite;
                }
                MapGen.currentlyMousedOver = sprite;
            }); 
            sprite.on('pointerout', function onMove(e){
                if (!MapGen.dragStart || MapGen.currentTool == 'noise' || MapGen.currentTool == 'tiles'){
                    var cubeNode = MapGen.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                    var arr = MapGen.cubeSpiral(cubeNode,MapGen.toolSize-1);
                    for (var i = 0;i < arr.length;i++){
                        var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                        var a = MapGen.getAxial(c);
                        var t = 1;
                        if (!(MapGen.currentRotation%2)){t = 2}
                        var s = a['sprite' + t];
                        s.tint = 0xFFFFFF;
                    }
                }
            });
        },
        getNewSpriteHeight: function(sprite,height){
            //create new texture
            var c = new PIXI.Container();
            var startingLoc = 32 + height*MapGen.TILE_HEIGHT;
            for (var i = 0; i <= height;i++){
                var s = Graphics.getSprite(sprite);
                s.anchor.x = 0.0;
                s.anchor.y = 0.5;
                s.position.x = 0;
                s.position.y = startingLoc + i*-MapGen.TILE_HEIGHT;
                c.addChild(s)
            }
            c._calculateBounds();
            var texture = new PIXI.RenderTexture.create(c.width,c.height);
            Graphics.app.renderer.render(c,texture);
            return texture;
        },
        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('blue', 'white');

        },
        move: function(x,y){
            this.container1.position.x = Math.max(0,Math.min(this.container1.position.x+x,Graphics.width));
            this.container2.position.x = this.container1.position.x;
            this.container1.position.y = Math.max(0,Math.min(this.container1.position.y+y,Graphics.height));
            this.container2.position.y = this.container1.position.y;
            Graphics.worldPrimitives.position.x = this.container1.position.x;
            Graphics.worldPrimitives.position.y = this.container1.position.y;
        },
        update: function(deltaTime){
            if (this.removeDescText <= 0){
                this.toolDescriptionText.visible = false;
            }else{
                this.removeDescText -= deltaTime;
            }
            Graphics.uiPrimitives2.clear();
            Graphics.worldPrimitives.clear();
            this.sizeText.text = 'Tool Size: ' + this.toolSize;
            this.sensitivityText.text = 'Sensitivity: ' + this.sensitivity;
            Graphics.drawBoxAround(this.landscapeTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.heightTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.noiseTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.tilesTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.addTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.deleteTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.pathTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.losTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.6);
            Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.6);
            Graphics.uiPrimitives2.drawRect(
                this[MapGen.currentTool + 'Tool'].position.x - this[MapGen.currentTool + 'Tool'].width/2,
                this[MapGen.currentTool + 'Tool'].position.y - this[MapGen.currentTool + 'Tool'].height/2,
                this[MapGen.currentTool + 'Tool'].width,
                this[MapGen.currentTool + 'Tool'].height
            );
            if (MapGen.currentTool != 'path'){
                this.jumpHeight.visible = false;
                this.jumpHeightNum.visible = false;
                this.jumpHeightPlus.visible = false;
                this.jumpHeightMinus.visible = false;
            }else{
                this.jumpHeightNum.text = '' + this.pathToolData.jumpHeight;
            }
            if (MapGen.currentTool != 'los'){
                this.losDistance.visible = false;
                this.losDistanceNum.visible = false;
                this.losDistancePlus.visible = false;
                this.losDistanceMinus.visible = false;
            }else{
                this.losDistanceNum.text = '' + this.currentLOS;
            }
            if (MapGen.currentTool == 'tiles'){
                Graphics.uiPrimitives2.drawRect(
                    this[this.currentTileType + 'Tile'].position.x - this[this.currentTileType + 'Tile'].width/2,
                    this[this.currentTileType + 'Tile'].position.y - this[this.currentTileType + 'Tile'].height/2,
                    this[this.currentTileType + 'Tile'].width,
                    this[this.currentTileType + 'Tile'].height
                );
            }else{
                this.sandTile.visible = false;
                this.baseTile.visible = false;
                this.grassTile.visible = false;
                this.iceTile.visible = false;
                this.snowTile.visible = false;
                this.dirtTile.visible = false;
            }
            Graphics.worldPrimitives.endFill();
            if (this.rotateData){
                //rotate the map if rotate data is given
                if (typeof this.rotateData.swapped == 'undefined'){
                    this.rotateData.swapped = false;
                }

                this.rotateData.t += deltaTime;
                if (!this.rotateData.swapped){
                    this.rotateData.extraRot = -this.rotateData.angle;
                    this.rotateData.swapped = true;
                    Graphics.worldContainer.removeChildren();
                    var t = 1;
                    if (!(this.currentRotation%2)){t = 2}
                    Graphics.worldContainer.addChild(this['container' + t]);
                    this['container' + t].children = this.updateSprites(this['container' + t].children,true);
                }
                this.container1.rotation = this.rotateData.extraRot + this.rotateData.angle * (this.rotateData.t/this.rotateData.time);
                this.container2.rotation = this.rotateData.extraRot + this.rotateData.angle * (this.rotateData.t/this.rotateData.time);
                if (this.rotateData.t >= this.rotateData.time){
                    this.container1.rotation = 0;
                    this.container2.rotation = 0;
                    this.rotateData = null;
                }

            }else{
                //set the new currently selected node after mouseover
                if (this.setNewSelectedNode){
                    this.selectedSprite = this.setNewSelectedNode;
                    var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                    var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                    for (var i = 0;i < arr.length;i++){
                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                        var a = this.getAxial(c);
                        var t = 1;
                        if (!(this.currentRotation%2)){t = 2}
                        var s = a['sprite' + t];
                        s.tint = 0x999999;
                    }
                    this.setNewSelectedNode = 0;
                }
                //drag initiated. change height based on current tool
                if (this.dragStart){
                    if (typeof this.dragStart.n == 'undefined'){
                        this.dragStart.n = 0;
                    }
                    //init time - for tools that work based off time held
                    if (typeof this.dragStart.time == 'undefined'){
                        this.dragStart.time = 0;
                    }
                    this.dragStart.time += deltaTime

                    var dragged = 0;
                    if (this.dragStart.y - Acorn.Input.mouse.Y > this.sensitivity){
                        dragged = 1;
                    }
                    if (this.dragStart.y - Acorn.Input.mouse.Y < -this.sensitivity){
                        dragged = -1;
                    }
                    switch(this.currentTool){
                        case 'height':
                            if (dragged === 1){
                                //increase all of the lowest sprite heights
                                var lowest = Infinity;
                                var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var a = this.getAxial(c);
                                    if (a.h < lowest){
                                        lowest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h == lowest && a.h < this.MAX_NODE_HEIGHT){
                                            //all the lowest nodes, increase height!
                                            a.sprite1.texture = this.tileTextures[a.tile][1][lowest+1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.tileTextures[a.tile][2][lowest+1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.h += 1;
                                        }
                                    }catch(e){}
                                }
                                
                            }
                            if (dragged === -1){
                                //decrease height
                                var highest = 0;
                                var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var a = this.getAxial(c);
                                    if (a.h > highest){
                                        highest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h == highest && a.h > 0){
                                            //all the highest nodes, decrease height
                                            a.sprite1.texture = this.tileTextures[a.tile][1][highest-1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.tileTextures[a.tile][2][highest-1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.h -= 1;
                                        }
                                    }catch(e){}
                                }

                            }
                            break;
                        case 'landscape':
                            if (dragged === 1){
                                //increase all of the lowest sprite heights
                                var lowest = Infinity;
                                var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var a = this.getAxial(c);
                                    if (a.h < lowest){
                                        lowest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h == lowest && a.h < this.MAX_NODE_HEIGHT){
                                            //all the lowest nodes, increase height!
                                            a.sprite1.texture = this.tileTextures[a.tile][1][lowest+1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.tileTextures[a.tile][2][lowest+1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.h += 1;
                                        }
                                    }catch(e){}
                                }
                                for (var j = 1; j <= this.dragStart.n;j++){
                                    var ringLowest = Infinity;
                                    var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                    var arr = this.cubeRing(cubeNode,this.toolSize-1 + j);
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                            var a = this.getAxial(c);
                                            if (a.h < ringLowest){
                                                ringLowest = a.h;
                                            }
                                        }catch(e){}
                                    }
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                            var a = this.getAxial(c);
                                            if (a.h == ringLowest && a.h < this.MAX_NODE_HEIGHT && ringLowest < lowest){
                                                //all the lowest nodes, increase height!
                                                a.sprite1.texture = this.tileTextures[a.tile][1][ringLowest+1];
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                                a.sprite2.texture = this.tileTextures[a.tile][2][ringLowest+1];
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                                a.h += 1;
                                            }
                                        }catch(e){}
                                    }
                                }
                                if (this.dragStart.n < 0){
                                    this.dragStart.n = 0;
                                }
                                this.dragStart.n += 1;
                            }
                            if (dragged === -1){
                                //decrease height
                                var highest = 0;
                                var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var a = this.getAxial(c);
                                    if (a.h > highest){
                                        highest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h == highest && a.h > 0){
                                            //all the highest nodes, decrease height
                                            a.sprite1.texture = this.tileTextures[a.tile][1][highest-1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.tileTextures[a.tile][2][highest-1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                            a.h -= 1;
                                        }
                                    }catch(e){}
                                }
                                for (var j = -1; j >= this.dragStart.n;j--){
                                    var ringHighest = 0;
                                    var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                    var arr = this.cubeRing(cubeNode,this.toolSize-1 + (j*-1));
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                            var a = this.getAxial(c);
                                            if (a.h > ringHighest){
                                                ringHighest = a.h;
                                            }
                                        }catch(e){}
                                    }
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                            var a = this.getAxial(c);
                                            if (a.h == ringHighest && a.h > 0 && ringHighest > highest){
                                                //all the lowest nodes, decrease height!
                                                a.sprite1.texture = this.tileTextures[a.tile][1][ringHighest-1];
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                                a.sprite2.texture = this.tileTextures[a.tile][2][ringHighest-1];
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                                a.h -= 1;
                                            }
                                        }catch(e){}
                                    }
                                }
                                if (this.dragStart.n > 0){
                                    this.dragStart.n = 0;
                                }
                                this.dragStart.n -= 1;
                            }

                            break;
                        case 'noise':
                            if (this.dragStart.time >= this.sensitivity/10){
                                this.dragStart.time -= (this.sensitivity/10);
                                //increase all of the lowest sprite heights
                                var lowest = Infinity;
                                var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var a = this.getAxial(c);
                                    var n = 1;
                                    if (Math.round(Math.random())){n = -1}
                                    var newHeight = Math.min(this.MAX_NODE_HEIGHT,Math.max(a.h+n,0));
                                    if (newHeight){
                                        a.h = newHeight;
                                        a.sprite1.texture = this.tileTextures[a.tile][1][newHeight];
                                        a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                        a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                        a.sprite2.texture = this.tileTextures[a.tile][2][newHeight];
                                        a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                        a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                                    }
                                }
                                
                            }
                            break;
                        case 'tiles':

                            //change sprite tile
                            var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                            var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                            for (var i = 0;i < arr.length;i++){
                                var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                var a = this.getAxial(c);
                                if (a.tile != this.currentTileType){
                                    a.sprite1.texture = this.tileTextures[this.currentTileType][1][a.h];
                                    a.sprite2.texture = this.tileTextures[this.currentTileType][2][a.h];
                                    a.tile = this.currentTileType;
                                }
                            }
                            break;
                        case 'delete':
                            var node = this.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r];
                            this.dragStart = null;
                            //remove sprite
                            //for each neighbor, make sure there is a path to the other another neighbors
                            var isAPath = true;
                            for (var i = 0; i < 6;i++){
                                var cube = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var neighbor = this.getCubeNeighbor(cube,i);
                                for (var j = 0; j < 6;j++){
                                    var neighbor2 = this.getCubeNeighbor(cube,j);
                                    if (neighbor && neighbor2){
                                        if (!neighbor.deleted && !neighbor2.deleted){
                                            var arr = this.findPath(neighbor,neighbor2,cube);
                                            if (arr.length == 0){
                                                isAPath = false;
                                                console.log(neighbor);
                                                console.log(neighbor2);
                                            }
                                        }
                                    }
                                }
                            }
                            if (isAPath){
                                this.container1.removeChild(node.sprite1);
                                this.container2.removeChild(node.sprite2);
                                this.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r].deleted = true;
                                this.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r].h = 0;
                                this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z].deleted = true;
                                this.selectedSprite = null;
                            }
                            break;
                        case 'add':
                            var node = this.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r];
                            this.dragStart = null;
                            //for each neighbor, make sure there is a path to the other another neighbors
                            var isAPath = true;
                            for (var i = 0; i < 6;i++){
                                var cube = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var neighbor = this.getCubeNeighbor(cube,i);
                                if (neighbor){
                                    if (neighbor.deleted){
                                        var axial = this.getAxial(neighbor);
                                        this.container1.addChild(axial.sprite1);
                                        this.container2.addChild(axial.sprite2);
                                        axial.deleted = true;
                                        neighbor.deleted = true;
                                    }
                                }
                            }
                            break;
                        case 'path':
                            this.pathToolData.startNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                            if (this.pathToolData.endNode != this.cubeMap[this.currentlyMousedOver.cubeCoords.x][this.currentlyMousedOver.cubeCoords.y][this.currentlyMousedOver.cubeCoords.z]){
                                this.pathToolData.endNode = this.cubeMap[this.currentlyMousedOver.cubeCoords.x][this.currentlyMousedOver.cubeCoords.y][this.currentlyMousedOver.cubeCoords.z];
                                //get a new path
                                this.pathToolData.currentPath = this.findPath(this.pathToolData.startNode,this.pathToolData.endNode,null,this.pathToolData.jumpHeight);
                            }
                            if (this.pathToolData.currentPath){
                                if (this.pathToolData.currentPath.length > 0){  
                                    Graphics.worldPrimitives.lineStyle(3,0xFFFF00,1);
                                    var t = 1;
                                    if (!(this.currentRotation%2)){t = 2}
                                    var sp = 'sprite' + t;
                                    var a = this.getAxial(this.pathToolData.currentPath[0]);
                                    Graphics.worldPrimitives.moveTo(a[sp].position.x,a[sp].position.y-this.TILE_HEIGHT*(a.h+1));
                                    for (var i = 1; i < this.pathToolData.currentPath.length;i++){
                                        var a = this.getAxial(this.pathToolData.currentPath[i]);
                                        Graphics.worldPrimitives.lineTo(a[sp].position.x,a[sp].position.y-this.TILE_HEIGHT*(a.h+1));
                                    }
                                }
                            }
                            break;
                        case 'los':
                            /*var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                            var aNode = MapGen.getAxial(cubeNode);
                            var arr = this.cubeSpiral(cubeNode,this.maxSize);
                            for (var i = 0;i < arr.length;i++){
                                var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                var cPos = {
                                    x: c.x + 1e-6,
                                    y: c.y + 1e-6,
                                    z: c.z + -2e-6,
                                }
                                var r1 = this.cubeLineDraw(cubeNode,cPos);
                                var a = MapGen.getAxial(r1[r1.length-1]);
                                var t = 1;
                                    if (!(this.currentRotation%2)){t = 2}
                                    var sp = 'sprite' + t;
                                Graphics.worldPrimitives.lineStyle(3,0xFFFF00,1);
                                Graphics.worldPrimitives.moveTo(aNode[sp].position.x,aNode[sp].position.y-this.TILE_HEIGHT*(aNode.h+1));
                                Graphics.worldPrimitives.lineTo(a[sp].position.x,a[sp].position.y-this.TILE_HEIGHT*(a.h+1));
                            }*/
                            if (this.dragStart && this.losToolData.losShown == false){
                                var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var aNode = MapGen.getAxial(cubeNode);
                                var aH = aNode.h + this.CHAR_HEIGHT;
                                var arr = this.cubeSpiral(cubeNode,this.maxSize);
                                for (var i = 0;i < arr.length;i++){
                                    var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var cPos = {
                                        x: c.x + 1e-6,
                                        y: c.y + 1e-6,
                                        z: c.z + -2e-6,
                                    }
                                    var cNeg = {
                                        x: c.x + -1e-6,
                                        y: c.y + -1e-6,
                                        z: c.z + 2e-6,
                                    }
                                    var r1 = this.cubeLineDraw(cubeNode,cPos);
                                    var r2 = this.cubeLineDraw(cubeNode,cNeg);
                                    var blocked1 = false;
                                    var blocked2 = false;
                                    var highestAngle = 0;
                                    for (var j = 1; j < r1.length;j++){
                                        var a = MapGen.getAxial(r1[j]);
                                        var h = (j==(r1.length-1)) ? (a.h+this.CHAR_HEIGHT) : a.h;
                                        var angle = 0;
                                        if (h > aH){
                                            angle = 90 + (180/Math.PI)*Math.atan((h-aH)/j);
                                        }else if (h < aH){
                                            angle = (180/Math.PI)*Math.atan(j/(aH-h));
                                        }else{
                                            angle = 90;
                                        }
                                        if (highestAngle < angle){
                                            highestAngle = angle;
                                            blocked1 = false;
                                        }else{
                                            if (angle < highestAngle){
                                                blocked1 = true;
                                            }else{
                                                blocked1 = false;
                                            }
                                        }
                                    }
                                    highestAngle = 0;
                                    for (var j = 1; j < r2.length;j++){
                                        var a = MapGen.getAxial(r2[j]);
                                        var h = (j==(r2.length-1)) ? (a.h+this.CHAR_HEIGHT): a.h;
                                        var angle = 0;
                                        if (h > aH){
                                            angle = 90 + (180/Math.PI)*Math.atan((h-aH)/j);
                                        }else if (h < aH){
                                            angle = (180/Math.PI)*Math.atan(j/(aH-h));
                                        }else{
                                            angle = 90;
                                        }
                                        if (highestAngle < angle){
                                            highestAngle = angle;
                                            blocked2 = false;
                                        }else{
                                            if (angle < highestAngle){
                                                blocked2 = true;
                                            }else{
                                                blocked2 = false;
                                            }
                                        }
                                    }
                                    var a = MapGen.getAxial(c);
                                    if (blocked1 && blocked2){
                                        var t = 1;
                                        if (!(MapGen.currentRotation%2)){t = 2}
                                        var s = a['sprite' + t];
                                        s.tint = 0xFF6666;
                                        this.losToolData.spritesAltered.push(s);
                                    }else if ((!blocked1 && !blocked2) == false){
                                        //partial cover
                                        var t = 1;
                                        if (!(MapGen.currentRotation%2)){t = 2}
                                        var s = a['sprite' + t];
                                        s.tint = 0xFFFF66;
                                        this.losToolData.spritesAltered.push(s);
                                    }else{
                                        //NO COVER
                                        var t = 1;
                                        if (!(MapGen.currentRotation%2)){t = 2}
                                        var s = a['sprite' + t];
                                        s.tint = 0x66FF66;
                                        this.losToolData.spritesAltered.push(s);
                                    }
                                }
                                this.losToolData.losShown = true;
                            }
                            this.setNewSelectedNode = 0;
                            break;
                    }
                    if (dragged){this.dragStart.y = Acorn.Input.mouse.Y;}

                    var t = 1;
                    if (!(MapGen.currentRotation%2)){t = 2}
                    MapGen['container' + t].children = MapGen.updateSprites(MapGen['container' + t].children);
                }
            }
        },

        getAxialNode: function(q,r){
            return {
                q:q,
                r:r,
                h:0,
                tile: 'base',
                ghost: false
            }
        }

    }
    window.MapGen = MapGen;
})(window);
