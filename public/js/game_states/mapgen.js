
(function(window) {
    MapGen = {
        MAX_TOOL_SIZE: 10,
        MIN_SENSITIVITY: 1,
        MAX_SENSITIVITY: 15,
        char_height: 2, //the height of LOS 'characters'

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
        losDrawn: false,

        mapNames: null,
        mapName: '',

        size: null,
        type: null,
        data: null,

        changesMade: null,

        currentSZone: 1,
        sZoneMaxSize: 30,

        losAngle: 1e-6,

        init: function() {
            this.drawBG();
            //initialize the map
            window.currentMapState = 'mapgen';
            this.map = new Map();
            window.currentGameMap = this.map;
            this.changesMade = false;
            if (!this.data){
                if (this.type == 't'){
                    this.map.maxSize = Math.round(this.size*1.5)
                }else if (this.type == 'h'){
                    this.map.maxSize = Math.round(this.size*2)
                }else {
                    this.map.maxSize = this.size[0] + this.size[1];
                }
                var data;
                switch(this.type){
                    case 'r':
                        data = this.initRectangle();
                        break;
                    case 'rh':
                        data = this.initRhombus();
                        break;
                    case 't':
                        data = this.initTriangle();
                        break;
                    case 'h':
                        data = this.initHexagon();
                        break;
                }
                this.map.init(data);
            }else{
                this.map.init(this.data);
            }

            //create tool buttons
            var style = AcornSetup.baseStyle;
            style.fontSize = 24;

            //Select Tool Text
            this.toolText = Graphics.makeUiElement({
                text: 'Tool Selector',
                style: style,
            });
            this.toolText.position.x = 25 + this.toolText.width/2;
            this.toolText.position.y = 25 + this.toolText.height/2;
            Graphics.uiContainer.addChild(this.toolText);

            
            this.heightTool = Graphics.makeUiElement({
                text: 'Height',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('height');
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

            this.landscapeTool = Graphics.makeUiElement({
                text: 'Landscape',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('landscape');
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
            this.landscapeTool.position.x =  this.heightTool.position.x + this.heightTool.width/2 + this.landscapeTool.width/2 + 2;
            this.landscapeTool.position.y = this.heightTool.position.y;
            Graphics.uiContainer.addChild(this.landscapeTool);

            this.noiseTool = Graphics.makeUiElement({
                text: 'Noise',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('noise');
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
            this.noiseTool.position.x = this.landscapeTool.position.x + this.landscapeTool.width/2 + this.noiseTool.width/2 + 2;
            this.noiseTool.position.y = this.heightTool.position.y;
            Graphics.uiContainer.addChild(this.noiseTool);

            this.tilesTool = Graphics.makeUiElement({
                text: 'Tiles',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('tiles');
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
            this.tilesTool.position.x = 25 + this.tilesTool.width/2;
            this.tilesTool.position.y = this.landscapeTool.position.y + this.landscapeTool.height/2 + this.noiseTool.height/2 + 2;
            Graphics.uiContainer.addChild(this.tilesTool);

            this.pathTool = Graphics.makeUiElement({
                text: 'Path',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('path');
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
            this.pathTool.position.x = this.tilesTool.position.x + this.tilesTool.width/2 + this.pathTool.width/2 + 2;
            this.pathTool.position.y = this.tilesTool.position.y;
            Graphics.uiContainer.addChild(this.pathTool);

            this.deleteTool = Graphics.makeUiElement({
                text: 'Delete',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('delete');
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
            this.deleteTool.position.x = this.pathTool.position.x + this.pathTool.width/2 + this.deleteTool.width/2 + 2;
            this.deleteTool.position.y = this.tilesTool.position.y;
            Graphics.uiContainer.addChild(this.deleteTool);

            this.addTool = Graphics.makeUiElement({
                text: 'Add',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('add');
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
            this.addTool.position.x = this.deleteTool.position.x + this.deleteTool.width/2 + this.addTool.width/2 + 2;
            this.addTool.position.y = this.tilesTool.position.y;
            Graphics.uiContainer.addChild(this.addTool);

            this.losTool = Graphics.makeUiElement({
                text: 'LOS',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('los');
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
            this.losTool.position.x = 25 + this.losTool.width/2;
            this.losTool.position.y = this.tilesTool.position.y + this.tilesTool.height/2 + this.tilesTool.height/2 + 2;
            Graphics.uiContainer.addChild(this.losTool);

            this.sZoneTool = Graphics.makeUiElement({
                text: 'Start Zone',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    MapGen.changeCurrentTool('sZone');
                },
                mOverFunc: function onMOver(){
                    MapGen.toolDescriptionText.visible = true;
                    MapGen.toolDescriptionText.text = 'Add starting zones. Zones must be between 5-20 hexes. There must be 2 zones to create the map';
                    MapGen.removeDescText = Infinity;
                },
                mOutFunc: function onMOut(){
                    MapGen.removeDescText = 0.05;
                }
            });
            this.sZoneTool.position.x = this.losTool.position.x + this.losTool.width/2 + this.sZoneTool.width/2 + 2;
            this.sZoneTool.position.y = this.losTool.position.y;
            Graphics.uiContainer.addChild(this.sZoneTool);

            //Select Tool Text
            this.toolDescriptionText = Graphics.makeUiElement({
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

            //back button
            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    console.log(MapGen.changesMade)
                    if (MapGen.changesMade){
                        if (confirm('Exit and lose unsaved data?') == true) {
                            MapGen.data = null;
                            MapGen.mapName = null;
                            Acorn.changeState('mainMenu');
                        }
                    }else{
                        MapGen.data = null;
                        MapGen.mapName = null;
                        Acorn.changeState('mainMenu');
                    }
                }
            });
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            //create tiles tool options
            this.toolOptionsText = Graphics.makeUiElement({
                text: 'Tool Options',
                style: style
            });
            this.toolOptionsText.position.x = Graphics.width-25 - this.toolText.width/2;
            this.toolOptionsText.position.y = this.exitButton.position.y +  this.exitButton.height/2 + 25 + this.toolText.height/2;
            Graphics.uiContainer.addChild(this.toolOptionsText);

            this.sZone1 = Graphics.makeUiElement({
                text: 'Zone 1',
                style: style,
                interactive: true,
                buttonMode: true,
                buttonGlow: true,
                clickFunc: function onClick(){
                    if (MapGen.currentSZone != 1){
                        MapGen.currentSZone = 1;
                    }
                    MapGen.resetColors();
                    MapGen.sZone1.defaultFill = 'gray';
                    for (var i = 0; i < MapGen.map.startZone2.length;i++){
                        MapGen.map.startZone2[i].sprite1.alpha = 0.2;
                        MapGen.map.startZone2[i].sprite2.alpha = 0.2;
                    }
                }
            });
            this.sZone1.style.fill = 'gray';
            this.sZone1.style.fontSize = 24;
            this.sZone1.position.x = this.toolOptionsText.position.x;
            this.sZone1.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.sZone1);
            this.sZone2 = Graphics.makeUiElement({
                text: 'Zone 2',
                style: style,
                interactive: true,
                buttonMode: true,
                buttonGlow: true,
                clickFunc: function onClick(){
                    if (MapGen.currentSZone != 2){
                        MapGen.currentSZone = 2;
                    }
                    MapGen.resetColors();
                    MapGen.sZone2.defaultFill = 'gray';
                    for (var i = 0; i < MapGen.map.startZone1.length;i++){
                        MapGen.map.startZone1[i].sprite1.alpha = 0.2;
                        MapGen.map.startZone1[i].sprite2.alpha = 0.2;
                    }
                }
            });
            this.sZone2.style.fontSize = 24;
            this.sZone2.position.x = this.toolOptionsText.position.x;
            this.sZone2.position.y = this.sZone1.position.y + this.sZone1.height/2 + 5 + this.sZone2.height/2;
            Graphics.uiContainer.addChild(this.sZone2);

            this.losDistance = Graphics.makeUiElement({
                text: 'Unit Height: '
            });
            this.losDistance.style.fontSize = 24;
            this.losDistance.position.x = this.toolOptionsText.position.x - this.losDistance.width/2;
            this.losDistance.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.losDistance);
            this.losDistancePlus = Graphics.makeUiElement({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.char_height < 10){
                        MapGen.char_height += 1;
                    }
                }
            });
            this.losDistancePlus.style.fontSize = 40;
            this.losDistancePlus.position.x = this.losDistance.position.x + this.losDistance.width/2 + 50;
            this.losDistancePlus.position.y = this.losDistance.position.y - this.losDistancePlus.height/2;
            Graphics.uiContainer.addChild(this.losDistancePlus);
            this.losDistanceMinus = Graphics.makeUiElement({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.char_height > 1){
                        MapGen.char_height -= 1;
                    }
                }
            });
            this.losDistanceMinus.style.fontSize = 40;
            this.losDistanceMinus.position.x = this.losDistance.position.x + this.losDistance.width/2 + 50;
            this.losDistanceMinus.position.y = this.losDistance.position.y + this.losDistanceMinus.height/2;
            Graphics.uiContainer.addChild(this.losDistanceMinus);

            this.losDistanceNum = Graphics.makeUiElement({
                text: '0'
            });
            this.losDistanceNum.style.fontSize = 24;
            this.losDistanceNum.position.x = this.losDistance.position.x;
            this.losDistanceNum.position.y = this.losDistance.position.y + this.losDistance.height/2 + this.losDistanceNum.height/2;
            Graphics.uiContainer.addChild(this.losDistanceNum);

            this.jumpHeight = Graphics.makeUiElement({
                text: 'Max Jump Height: '
            });
            this.jumpHeight.style.fontSize = 24;
            this.jumpHeight.position.x = this.toolOptionsText.position.x - this.jumpHeight.width/2;
            this.jumpHeight.position.y = this.toolOptionsText.position.y + this.toolOptionsText.height/2 + 50;
            Graphics.uiContainer.addChild(this.jumpHeight);
            this.jumpHeightPlus = Graphics.makeUiElement({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
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
            this.jumpHeightMinus = Graphics.makeUiElement({
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

            this.jumpHeightNum = Graphics.makeUiElement({
                text: '0'
            });
            this.jumpHeightNum.style.fontSize = 24;
            this.jumpHeightNum.position.x = this.jumpHeight.position.x;
            this.jumpHeightNum.position.y = this.jumpHeight.position.y + this.jumpHeight.height/2 + this.jumpHeightNum.height/2;
            Graphics.uiContainer.addChild(this.jumpHeightNum);

            this.baseTile = Graphics.makeUiElement({
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
            this.dirtTile = Graphics.makeUiElement({
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
            this.grassTile = Graphics.makeUiElement({
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
            this.snowTile = Graphics.makeUiElement({
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
            this.iceTile = Graphics.makeUiElement({
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
            this.sandTile = Graphics.makeUiElement({
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
            this.sizeText = Graphics.makeUiElement({
                text: 'Tool Size: 1',
                style: style,
            });
            this.sizeText.style.fontSize = 32;
            this.sizeText.position.x = 25 + this.sizeText.width/2;
            this.sizeText.position.y = Graphics.height - 200 - this.sizeText.height/2;
            Graphics.uiContainer.addChild(this.sizeText);

            this.sizePlus = Graphics.makeUiElement({
                text: '▲',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.toolSize < MapGen.MAX_TOOL_SIZE && MapGen.currentTool != 'add' && MapGen.currentTool != 'delete' && MapGen.currentTool != 'path' && MapGen.currentTool != 'los' && MapGen.currentTool != 'sZone'){
                        MapGen.toolSize += 1;
                    }
                }
            });
            this.sizePlus.style.fontSize = 40;
            this.sizePlus.position.x = this.sizeText.position.x + this.sizeText.width/2 + 50;
            this.sizePlus.position.y = this.sizeText.position.y - this.sizePlus.height/2;
            Graphics.uiContainer.addChild(this.sizePlus);
            this.sizeMinus = Graphics.makeUiElement({
                text: '▼',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    if (MapGen.toolSize > 1 && MapGen.currentTool != 'add' && MapGen.currentTool != 'delete' && MapGen.currentTool != 'path' && MapGen.currentTool != 'los' && MapGen.currentTool != 'sZone'){
                        MapGen.toolSize -= 1;
                    }
                }
            });
            this.sizeMinus.style.fontSize = 40;
            this.sizeMinus.position.x = this.sizeText.position.x + this.sizeText.width/2 + 50;
            this.sizeMinus.position.y = this.sizeText.position.y + this.sizeMinus.height/2;
            Graphics.uiContainer.addChild(this.sizeMinus);

            this.rotateText = Graphics.makeUiElement({
                text: 'Rotate (A,D)',
                style: style,
            });
            this.rotateText.style.fontSize = 20;
            this.rotateText.position.x = Graphics.width/2;
            this.rotateText.position.y = this.rotateText.height/2;
            Graphics.uiContainer.addChild(this.rotateText);

            this.rotateLeft = Graphics.makeUiElement({
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
            this.rotateRight = Graphics.makeUiElement({
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

            this.yScaleText = Graphics.makeUiElement({
                text: 'Vert Shift (W,S)',
                style: style,
            });
            this.yScaleText.style.fontSize = 20;
            this.yScaleText.position.x = Graphics.width/3;
            this.yScaleText.position.y = this.yScaleText.height/2;
            Graphics.uiContainer.addChild(this.yScaleText);

            this.yScaleLeft = Graphics.makeUiElement({
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
            this.yScaleRight = Graphics.makeUiElement({
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

            this.zoomText = Graphics.makeUiElement({
                text: 'Zoom (mwheel)',
                style: style,
            });
            this.zoomText.style.fontSize = 20;
            this.zoomText.position.x = Graphics.width/1.5;
            this.zoomText.position.y = this.zoomText.height/2;
            Graphics.uiContainer.addChild(this.zoomText);

            this.zoomUp = Graphics.makeUiElement({
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
            this.zoomDown = Graphics.makeUiElement({
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

            this.sensitivityText = Graphics.makeUiElement({
                text: 'Sensitivity: 4',
                style: style,
            });
            this.sensitivityText.style.fontSize = 32;
            this.sensitivityText.position.x = 25 + this.sensitivityText.width/2;
            this.sensitivityText.position.y = Graphics.height - 75 - this.sensitivityText.height/2;
            Graphics.uiContainer.addChild(this.sensitivityText);

            this.sensitivityPlus = Graphics.makeUiElement({
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
            this.sensitivityMinus = Graphics.makeUiElement({
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

            this.saveButton = Graphics.makeUiElement({
                text: "Save",
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    var name = prompt("Please enter a name for the map", MapGen.mapName);
                    if (!name || name == ''){
                        alert('Map not saved.');
                    }else{
                        var mapData = {};
                        var sz1 = [];
                        var sz2 = [];
                        for (var i = 0; i < MapGen.map.startZone1.length;i++){
                            var node = {
                                q: MapGen.map.startZone1[i].q,
                                r: MapGen.map.startZone1[i].r,
                                h: MapGen.map.startZone1[i].h,
                                deleted: MapGen.map.startZone1[i].deleted,
                                tile: MapGen.map.startZone1[i].tile
                            }
                            sz1.push(node);
                        }
                        for (var i = 0; i < MapGen.map.startZone2.length;i++){
                            var node = {
                                q: MapGen.map.startZone2[i].q,
                                r: MapGen.map.startZone2[i].r,
                                h: MapGen.map.startZone2[i].h,
                                deleted: MapGen.map.startZone2[i].deleted,
                                tile: MapGen.map.startZone2[i].tile
                            }
                            sz2.push(node);
                        }
                        for (var i in MapGen.map.axialMap){
                            for (var j in MapGen.map.axialMap[i]){
                                if (typeof mapData[i] == 'undefined'){
                                    mapData[i] = {};
                                }
                                var node = {
                                    q: MapGen.map.axialMap[i][j].q,
                                    r: MapGen.map.axialMap[i][j].r,
                                    h: MapGen.map.axialMap[i][j].h,
                                    deleted: MapGen.map.axialMap[i][j].deleted,
                                    tile: MapGen.map.axialMap[i][j].tile
                                }
                                mapData[i][j] = node;
                            }
                        }
                        MapGen.changesMade = false;
                        Acorn.Net.socket_.emit('createMap',{name: name,mapData: mapData,sz1: sz1,sz2:sz2});
                    }
                }
            });
            this.saveButton.position.x = this.exitButton.position.x - this.exitButton.width/2 - 25- this.saveButton.width/2;
            this.saveButton.position.y = this.exitButton.position.y;
            Graphics.uiContainer.addChild(this.saveButton);

            this.deleteButton = Graphics.makeUiElement({
                text: "Delete",
                style: style,
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    if (confirm('Delete map "' + MapGen.mapName + '"?') == true) {
                        Acorn.Net.socket_.emit('deleteMap',{name:MapGen.mapName});
                        Acorn.changeState('mainMenu');
                    }
                }
            });
            this.deleteButton.position.x = this.saveButton.position.x - this.saveButton.width/2 - 25- this.deleteButton.width/2;
            this.deleteButton.position.y = this.exitButton.position.y;
            Graphics.uiContainer.addChild(this.deleteButton);

            
            this.changeCurrentTool('height');
            Graphics.showLoadingMessage(false);
        },

        initRectangle: function(){
            console.log('Generating a ' + this.size[0] + 'x' + this.size[1] + ' Rectangle Map');
            //Generate the cube and axial coordinate systems
            var m = {}
            for (var j = 0; j < this.size[1];j++){
                for (var i = 0+(Math.ceil(-j/2)); i < this.size[0]+(Math.ceil(-j/2));i++){
                    if (typeof m[i] == 'undefined'){
                        m[i] = {};
                    }
                    var node = this.getAxialNode(i,j);
                    m[i][j] = node;
                }
            }
            return {mapData: m};
        },
        initRhombus: function(){
            console.log('Generating a ' + this.size[0] + 'x' + this.size[1] + ' Rhombus Map');
            //Generate the cube and axial coordinate systems
            var m = {};
            for (var i = 0; i < this.size[0];i++){
                var row = {};
                for (var j = 0; j < this.size[1];j++){
                    var node = this.getAxialNode(i,j);
                    row[j] = node;
                }
                m[i] = row;
            }
            return {mapData: m};
        },
        initTriangle: function(){
            console.log('Generating a ' + this.size + ' unit Triangle Map');
            //Generate the cube and axial coordinate systems
            var m = {}
            for (var i = 0; i < this.size;i++){
                if (typeof m[i] == 'undefined'){
                    m[i] = {};
                }
                for (var j = 0; j < this.size;j++){
                    if (Math.sqrt((i+j)*(i+j)) < this.size){
                        var node = this.getAxialNode(i,j);
                        m[i][j] = node;
                    }
                }
            }
            return {mapData: m};
        },
        initHexagon: function(){
            console.log('Generating a ' + this.size + ' unit Hexagon Map');
            //Generate the cube and axial coordinate systems
            var m = {};
            for (var i = this.size*-1; i <=this.size;i++){
                var row = {};
                for (var j = this.size*-1; j <=this.size;j++){
                    if (Math.sqrt((i+j)*(i+j)) <= this.size){
                        var node = this.getAxialNode(i,j);
                        row[j] = node;
                        this.tileCount += 1;
                    }
                }
                m[i] = row;
            }
            return {mapData: m};
            
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
        changeCurrentTool: function(tool){
            MapGen.currentTool = tool;

            //set all options to not visible
            MapGen.sandTile.visible = false;
            MapGen.baseTile.visible = false;
            MapGen.grassTile.visible = false;
            MapGen.iceTile.visible = false;
            MapGen.snowTile.visible = false;
            MapGen.dirtTile.visible = false;
            MapGen.jumpHeight.visible = false;
            MapGen.jumpHeightNum.visible = false;
            MapGen.jumpHeightPlus.visible = false;
            MapGen.jumpHeightMinus.visible = false;
            MapGen.losDistance.visible = false;
            MapGen.losDistanceNum.visible = false;
            MapGen.losDistancePlus.visible = false;
            MapGen.losDistanceMinus.visible = false;
            MapGen.sZone1.visible = false;
            MapGen.sZone2.visible = false;
            for (var i in this.map.axialMap){
                for (j in this.map.axialMap[i]){
                    this.map.axialMap[i][j].sprite1.tint = 0xFFFFFF;
                    this.map.axialMap[i][j].sprite2.tint = 0xFFFFFF;
                    this.map.axialMap[i][j].sprite1.alpha = 1;
                    this.map.axialMap[i][j].sprite2.alpha = 1;
                }
            }
            //set current options to visible
            if (tool == 'tiles'){
                MapGen.sandTile.visible = true;
                MapGen.baseTile.visible = true;
                MapGen.grassTile.visible = true;
                MapGen.iceTile.visible = true;
                MapGen.snowTile.visible = true;
                MapGen.dirtTile.visible = true;
            }else if (tool == 'path'){
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
            }else if (tool == 'add' || tool == 'delete'){
                MapGen.toolSize = 1;
            }else if (tool =='los'){
                MapGen.losToolData = {
                    spritesAltered: [],
                    losShown: false
                };
                MapGen.losDistance.visible = true;
                MapGen.losDistanceNum.visible = true;
                MapGen.losDistancePlus.visible = true;
                MapGen.losDistanceMinus.visible = true;
                MapGen.toolSize = 1;
            }else if (tool == 'sZone'){
                MapGen.sZone1.visible = true;
                MapGen.sZone2.visible = true;
                MapGen.currentSZone = 1;
                MapGen.toolSize = 1;
                for (var i in this.map.axialMap){
                    for (j in this.map.axialMap[i]){
                        this.map.axialMap[i][j].sprite1.alpha = 0.2;
                        this.map.axialMap[i][j].sprite2.alpha = 0.2;
                    }
                }
            }
        },
        updatePrims: function(){

        },
        update: function(deltaTime){
            this.map.update(deltaTime);
            if (this.removeDescText <= 0){
                this.toolDescriptionText.visible = false;
            }else{
                this.removeDescText -= deltaTime;
            }
            Graphics.uiPrimitives2.clear();
            Graphics.worldPrimitives.clear();
            if (this.mapName){
                this.deleteButton.visible = true;
                Graphics.drawBoxAround(this.deleteButton,Graphics.uiPrimitives2,{});
            }else{this.deleteButton.visible = false}
            this.sizeText.text = 'Tool Size: ' + this.toolSize;
            this.sensitivityText.text = 'Sensitivity: ' + this.sensitivity;
            Graphics.drawBoxAround(this.landscapeTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.heightTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.noiseTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.tilesTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.addTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.deleteTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.pathTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.losTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.sZoneTool,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.saveButton,Graphics.uiPrimitives2,{});
            Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.6);
            Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.6);
            Graphics.uiPrimitives2.drawRect(
                this[MapGen.currentTool + 'Tool'].position.x - this[MapGen.currentTool + 'Tool'].width/2,
                this[MapGen.currentTool + 'Tool'].position.y - this[MapGen.currentTool + 'Tool'].height/2,
                this[MapGen.currentTool + 'Tool'].width,
                this[MapGen.currentTool + 'Tool'].height
            );
            Graphics.uiPrimitives2.endFill();
            if (MapGen.currentTool == 'path'){
                this.jumpHeightNum.text = '' + this.pathToolData.jumpHeight;
            }
            if (MapGen.currentTool == 'los'){
                this.losDistanceNum.text = '' + this.char_height;
            }
            if (MapGen.currentTool == 'tiles'){
                Graphics.uiPrimitives2.drawRect(
                    this[this.currentTileType + 'Tile'].position.x - this[this.currentTileType + 'Tile'].width/2,
                    this[this.currentTileType + 'Tile'].position.y - this[this.currentTileType + 'Tile'].height/2,
                    this[this.currentTileType + 'Tile'].width,
                    this[this.currentTileType + 'Tile'].height
                );
            }
            if (MapGen.currentTool == 'sZone'){
                if (this.currentSZone == 1){
                    for (var i = 0; i < this.map.startZone1.length;i++){
                        this.map.startZone1[i].sprite1.alpha = 1;
                        this.map.startZone1[i].sprite2.alpha = 1;
                    }
                }
                if (this.currentSZone == 2){
                    for (var i = 0; i < this.map.startZone2.length;i++){
                        this.map.startZone2[i].sprite1.alpha = 1;
                        this.map.startZone2[i].sprite2.alpha = 1;
                    }
                }
            }
            if (!this.map.rotateData){
                //set the new currently selected node after mouseover
                if (this.setNewSelectedNode){
                    this.selectedSprite = this.setNewSelectedNode;
                    var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                    var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                    for (var i = 0;i < arr.length;i++){
                        var c = arr[i];
                        var a = this.map.getAxial(c);
                        var t = 1;
                        if (!(this.map.currentRotation%2)){t = 2}
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
                                MapGen.changesMade = true;
                                var lowest = Infinity;
                                var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = arr[i];
                                    var a = this.map.getAxial(c);
                                    if (a.h < lowest){
                                        lowest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = arr[i];
                                        var a = this.map.getAxial(c);
                                        if (a.h == lowest && a.h < this.map.MAX_NODE_HEIGHT){
                                            //all the lowest nodes, increase height!
                                            a.sprite1.texture = this.map.tileTextures[a.tile][1][lowest+1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.map.tileTextures[a.tile][2][lowest+1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.h += 1;
                                        }
                                    }catch(e){}
                                }
                                
                            }
                            if (dragged === -1){
                                MapGen.changesMade = true;
                                //decrease height
                                var highest = 0;
                                var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = arr[i];
                                    var a = this.map.getAxial(c);
                                    if (a.h > highest){
                                        highest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = arr[i];
                                        var a = this.map.getAxial(c);
                                        if (a.h == highest && a.h > 0){
                                            //all the highest nodes, decrease height
                                            a.sprite1.texture = this.map.tileTextures[a.tile][1][highest-1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.map.tileTextures[a.tile][2][highest-1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.h -= 1;
                                        }
                                    }catch(e){}
                                }

                            }
                            break;
                        case 'landscape':
                            if (dragged === 1){
                                MapGen.changesMade = true;
                                //increase all of the lowest sprite heights
                                var lowest = Infinity;
                                var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = arr[i];
                                    var a = this.map.getAxial(c);
                                    if (a.h < lowest){
                                        lowest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = arr[i];
                                        var a = this.map.getAxial(c);
                                        if (a.h == lowest && a.h < this.map.MAX_NODE_HEIGHT){
                                            //all the lowest nodes, increase height!
                                            a.sprite1.texture = this.map.tileTextures[a.tile][1][lowest+1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.map.tileTextures[a.tile][2][lowest+1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.h += 1;
                                        }
                                    }catch(e){}
                                }
                                for (var j = 1; j <= this.dragStart.n;j++){
                                    var ringLowest = Infinity;
                                    var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                    var arr = this.map.cubeRing(cubeNode,this.toolSize-1 + j);
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = arr[i];
                                            var a = this.map.getAxial(c);
                                            if (a.h < ringLowest){
                                                ringLowest = a.h;
                                            }
                                        }catch(e){}
                                    }
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = arr[i];
                                            var a = this.map.getAxial(c);
                                            if (a.h == ringLowest && a.h < this.map.MAX_NODE_HEIGHT && ringLowest < lowest){
                                                //all the lowest nodes, increase height!
                                                a.sprite1.texture = this.map.tileTextures[a.tile][1][ringLowest+1];
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                                a.sprite2.texture = this.map.tileTextures[a.tile][2][ringLowest+1];
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
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
                                MapGen.changesMade = true;
                                //decrease height
                                var highest = 0;
                                var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = arr[i];
                                    var a = this.map.getAxial(c);
                                    if (a.h > highest){
                                        highest = a.h;
                                    }
                                }
                                for (var i = 0;i < arr.length;i++){
                                    try{
                                        var c = arr[i];
                                        var a = this.map.getAxial(c);
                                        if (a.h == highest && a.h > 0){
                                            //all the highest nodes, decrease height
                                            a.sprite1.texture = this.map.tileTextures[a.tile][1][highest-1];
                                            a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                            a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.sprite2.texture = this.map.tileTextures[a.tile][2][highest-1];
                                            a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                            a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                            a.h -= 1;
                                        }
                                    }catch(e){}
                                }
                                for (var j = -1; j >= this.dragStart.n;j--){
                                    var ringHighest = 0;
                                    var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                    var arr = this.map.cubeRing(cubeNode,this.toolSize-1 + (j*-1));
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = arr[i];
                                            var a = this.map.getAxial(c);
                                            if (a.h > ringHighest){
                                                ringHighest = a.h;
                                            }
                                        }catch(e){}
                                    }
                                    for (var i = 0;i < arr.length;i++){
                                        try{
                                            var c = arr[i];
                                            var a = this.map.getAxial(c);
                                            if (a.h == ringHighest && a.h > 0 && ringHighest > highest){
                                                //all the lowest nodes, decrease height!
                                                a.sprite1.texture = this.map.tileTextures[a.tile][1][ringHighest-1];
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                                a.sprite2.texture = this.map.tileTextures[a.tile][2][ringHighest-1];
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
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
                                MapGen.changesMade = true;
                                this.dragStart.time -= (this.sensitivity/10);
                                //increase all of the lowest sprite heights
                                var lowest = Infinity;
                                var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                                for (var i = 0;i < arr.length;i++){
                                    var c = arr[i];
                                    var a = this.map.getAxial(c);
                                    var n = 1;
                                    if (Math.round(Math.random())){n = -1}
                                    var newHeight = Math.min(this.map.MAX_NODE_HEIGHT,Math.max(a.h+n,0));
                                    if (newHeight){
                                        a.h = newHeight;
                                        a.sprite1.texture = this.map.tileTextures[a.tile][1][newHeight];
                                        a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                        a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                        a.sprite2.texture = this.map.tileTextures[a.tile][2][newHeight];
                                        a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                        a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.map.TILE_HEIGHT*(a.h+1),32,32+this.map.TILE_HEIGHT*(a.h+1));
                                    }
                                }
                                
                            }
                            break;
                        case 'tiles':

                            //change sprite tile
                            MapGen.changesMade = true;
                            var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                            var arr = this.map.cubeSpiral(cubeNode,this.toolSize-1);
                            for (var i = 0;i < arr.length;i++){
                                var c = arr[i];
                                var a = this.map.getAxial(c);
                                if (a.tile != this.currentTileType){
                                    a.sprite1.texture = this.map.tileTextures[this.currentTileType][1][a.h];
                                    a.sprite2.texture = this.map.tileTextures[this.currentTileType][2][a.h];
                                    a.tile = this.currentTileType;
                                }
                            }
                            break;
                        case 'delete':
                            try{
                                MapGen.changesMade = true;
                                var node = this.map.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r];
                                this.dragStart = null;
                                //remove sprite
                                //for each neighbor, make sure there is a path to the other another neighbors
                                var isAPath = true;
                                for (var i = 0; i < 6;i++){
                                    var cube = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                    var neighbor = this.map.getCubeNeighbor(cube,i);
                                    for (var j = 0; j < 6;j++){
                                        var neighbor2 = this.map.getCubeNeighbor(cube,j);
                                        if (neighbor && neighbor2){
                                            if (!neighbor.deleted && !neighbor2.deleted){
                                                var arr = this.map.findPath(neighbor,neighbor2,{skip:cube});
                                                if (arr.length == 0){
                                                    isAPath = false;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (isAPath){
                                    this.map.container1.removeChild(node.sprite1);
                                    this.map.container2.removeChild(node.sprite2);
                                    this.map.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r].deleted = true;
                                    this.map.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r].h = 0;
                                    this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z].deleted = true;
                                    this.selectedSprite = null;
                                }
                            }catch(e){
                                console.log('Error when deleting node');
                                console.log(e);
                            }
                            break;
                        case 'add':
                            var node = this.map.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r];
                            this.dragStart = null;
                            MapGen.changesMade = true;
                            //for each neighbor, make sure there is a path to the other another neighbors
                            var isAPath = true;
                            for (var i = 0; i < 6;i++){
                                var cube = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var neighbor = this.map.getCubeNeighbor(cube,i);
                                if (neighbor){
                                    if (neighbor.deleted){
                                        var axial = this.map.getAxial(neighbor);
                                        this.map.container1.addChild(axial.sprite1);
                                        this.map.container2.addChild(axial.sprite2);
                                        axial.deleted = false;
                                        neighbor.deleted = false;
                                    }
                                }
                            }
                            this.map.container1.children = this.map.updateSprites(this.map.container1.children);
                            this.map.container2.children = this.map.updateSprites(this.map.container2.children);
                            break;
                        case 'path':
                            this.pathToolData.startNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                            if (this.pathToolData.endNode != this.map.cubeMap[this.currentlyMousedOver.cubeCoords.x][this.currentlyMousedOver.cubeCoords.y][this.currentlyMousedOver.cubeCoords.z]){
                                this.pathToolData.endNode = this.map.cubeMap[this.currentlyMousedOver.cubeCoords.x][this.currentlyMousedOver.cubeCoords.y][this.currentlyMousedOver.cubeCoords.z];
                                //get a new path
                                this.pathToolData.currentPath = this.map.findPath(this.pathToolData.startNode,this.pathToolData.endNode,{maxJump:this.pathToolData.jumpHeight});
                            }
                            if (this.pathToolData.currentPath){
                                if (this.pathToolData.currentPath.length > 0){  
                                    Graphics.worldPrimitives.lineStyle(3,0xFFFF00,1);
                                    var t = 1;
                                    if (!(this.map.currentRotation%2)){t = 2}
                                    var sp = 'sprite' + t;
                                    var a = this.map.getAxial(this.pathToolData.currentPath[0]);
                                    Graphics.worldPrimitives.moveTo(a[sp].position.x,a[sp].position.y-this.map.TILE_HEIGHT*(a.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting]);
                                    for (var i = 1; i < this.pathToolData.currentPath.length;i++){
                                        var a = this.map.getAxial(this.pathToolData.currentPath[i]);
                                        Graphics.worldPrimitives.lineTo(a[sp].position.x,a[sp].position.y-this.map.TILE_HEIGHT*(a.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting]);
                                    }
                                }
                            }
                            break;
                        case 'sZone':
                            var node = this.map.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r];
                            var zoneArr = this.map['startZone' + this.currentSZone];
                            this.dragStart = null;
                            var otherZone = 1;
                            var cont = true;
                            if (this.currentSZone == 1){otherZone = 2;}
                            //make sure the node isnt part of another starting zone
                            if (this.nodeInArr(node,this.map['startZone' + otherZone])){
                                cont = false;
                            }
                            //add the node if the current sZone is empty
                            if (cont){
                                if (zoneArr.length == 0){
                                    zoneArr.push(node);
                                    MapGen.changesMade = true;
                                    cont = false;
                                }else if (zoneArr.length >= this.sZoneMaxSize){cont = false;}
                            }

                            //make sure the node is not already in the current sZone

                            if (cont && this.nodeInArr(node,zoneArr)){
                                //if it is, make sure it doesnt create 2 distict zones then remove it
                                var checked = 0; //number of nodes checked
                                var checkedArr = [node]; //nodes already checked
                                var checkingArr = []; //nodes currently being checked
                                if (zoneArr[0] != node){checkingArr.push(zoneArr[0])}else{checkingArr.push(zoneArr[1])}
                                while(checkingArr.length > 0){
                                    var checkNode = checkingArr[0];
                                    for (var j = 0; j < 6;j++){
                                        var neighbor = this.map.getAxialNeighbor(checkNode,j);
                                        if (neighbor){
                                            if (this.nodeInArr(neighbor,checkedArr)){
                                                continue;
                                            }else if (this.nodeInArr(neighbor,zoneArr)){
                                                checkingArr.push(neighbor);
                                                checkedArr.push(neighbor);
                                            }
                                        }
                                    }
                                    checked += 1;
                                    checkingArr.splice(0,1);
                                }
                                if (checked == zoneArr.length || zoneArr.length <=2){
                                    //checked all nodes, remove current node
                                    for (var i = 0;i < zoneArr.length;i++){
                                        if (zoneArr[i] == node){
                                            node.sprite1.alpha = 0.2;
                                            node.sprite2.alpha = 0.2;
                                            zoneArr.splice(i,1);
                                        }
                                    }
                                }
                                MapGen.changesMade = true;
                                cont = false;
                                break;
                            }

                            //make sure the node is adjacent to at least 1 of the nodes in the current sZone then add
                            if (cont){
                                var adj = false;
                                for (var i = 0; i < 6;i++){
                                    var neighbor = this.map.getAxialNeighbor(node,i);
                                    if (neighbor){
                                        if (this.nodeInArr(neighbor,zoneArr)){
                                            //add the node;
                                            zoneArr.push(node);
                                            MapGen.changesMade = true;
                                            i = 6;
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                        case 'los':
                            if (this.dragStart && this.losToolData.losShown == false){
                                var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                                var aNode = this.map.getAxial(cubeNode);
                                var aH = aNode.h + this.char_height;
                                var arr = this.map.cubeSpiral(cubeNode,this.map.maxSize);
                                for (var i = 0;i < arr.length;i++){
                                    var c = arr[i];
                                    var cPos = {
                                        x: c.x + this.losAngle,
                                        y: c.y + this.losAngle,
                                        z: c.z + -this.losAngle*2,
                                    }
                                    var cNeg = {
                                        x: c.x + -this.losAngle,
                                        y: c.y + -this.losAngle,
                                        z: c.z + this.losAngle,
                                    }
                                    var r1 = this.map.cubeLineDraw(cubeNode,cPos);
                                    var r2 = this.map.cubeLineDraw(cubeNode,cNeg);
                                    var blocked1 = false;
                                    var blocked2 = false;
                                    var highestAngle = 0;
                                    for (var j = 1; j < r1.length;j++){
                                        var a = this.map.getAxial(r1[j]);
                                        var h = (j==(r1.length-1)) ? (a.h+this.char_height) : a.h;
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
                                        var a = this.map.getAxial(r2[j]);
                                        var h = (j==(r2.length-1)) ? (a.h+this.char_height): a.h;
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
                                    var a = this.map.getAxial(c);
                                    if (blocked1 && blocked2){
                                        //Full cover / no LoS
                                        var t = 1;
                                        if (!(this.map.currentRotation%2)){t = 2}
                                        var s = a['sprite' + t];
                                        s.tint = this.map.noLosTint;
                                        this.losToolData.spritesAltered.push(s);
                                    }else if ((!blocked1 && !blocked2) == false){
                                        //partial cover / partial los
                                        var t = 1;
                                        if (!(this.map.currentRotation%2)){t = 2}
                                        var s = a['sprite' + t];
                                        s.tint = this.map.partialTint;
                                        this.losToolData.spritesAltered.push(s);
                                    }else{
                                        //NO COVER / Full los
                                        var t = 1;
                                        if (!(this.map.currentRotation%2)){t = 2}
                                        var s = a['sprite' + t];
                                        s.tint = 0xffffff;
                                        this.losToolData.spritesAltered.push(s);
                                    }
                                }
                                this.losToolData.losShown = true;
                            }
                            this.setNewSelectedNode = 0;
                            break;
                    }
                    try{
                        if (dragged){this.dragStart.y = Acorn.Input.mouse.Y;}

                        var t = 1;
                        if (!(this.map.currentRotation%2)){t = 2}
                        this.map['container' + t].children = MapGen.updateSprites(this.map['container' + t].children);
                    }catch(e){}
                }
            }
        },

        getAxialNode: function(q,r){
            return {
                q:q,
                r:r,
                h:0,
                tile: 'base',
                deleted: false
            }
        },

        nodeInArr: function(node,arr){
            for (var j = 0; j < arr.length;j++){
                if (arr[j] == node){
                    return true;
                }
            }
            return false;
        },

        resetColors: function(){
            MapGen.sZone1.defaultFill = Graphics.pallette.color1;
            MapGen.sZone2.defaultFill = Graphics.pallette.color1;
            MapGen.sZone1.style.fill = Graphics.pallette.color1;
            MapGen.sZone2.style.fill = Graphics.pallette.color1;
        }
    }
    window.MapGen = MapGen;
})(window);
