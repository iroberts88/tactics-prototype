
(function(window) {
    MapGen = {
        TILE_SIZE: 17,
        TILE_HEIGHT: 11,
        MAX_TOOL_SIZE: 10,
        MIN_SENSITIVITY: 1,
        MAX_SENSITIVITY: 15,
        MAX_NODE_HEIGHT: 20,

        ZOOM_SETTINGS: [0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0],
        currentZoomSetting: 2,

        YSCALE_SETTINGS: [0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0],
        currentYScaleSetting: 7,

        type: null,
        size: null,

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

        init: function() {
            this.drawBG();
            //create all of the tile textures!
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
                }
            });
            this.heightTool.position.x = this.toolText.position.x;
            this.heightTool.position.y = this.toolText.position.y + 50 + this.toolText.height/2;
            Graphics.uiContainer.addChild(this.heightTool);

            this.landscapeTool = AcornSetup.makeButton({
                text: 'Landscape',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'landscape';
                }
            });
            this.landscapeTool.position.x = this.toolText.position.x;
            this.landscapeTool.position.y = this.heightTool.position.y + this.heightTool.height/2 + this.landscapeTool.height/2;
            Graphics.uiContainer.addChild(this.landscapeTool);

            this.noiseTool = AcornSetup.makeButton({
                text: 'Noise',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    MapGen.currentTool = 'noise';
                }
            });
            this.noiseTool.position.x = this.toolText.position.x;
            this.noiseTool.position.y = this.landscapeTool.position.y + this.landscapeTool.height/2 + this.noiseTool.height/2;
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
                }
            });
            this.tilesTool.position.x = this.toolText.position.x;
            this.tilesTool.position.y = this.noiseTool.position.y + this.noiseTool.height/2 + this.tilesTool.height/2;
            Graphics.uiContainer.addChild(this.tilesTool);

            //create tiles tool options
            this.toolOptionsText = AcornSetup.makeButton({
                text: 'Tool Options',
                style: style,
            });
            this.toolOptionsText.position.x = Graphics.width-25 - this.toolText.width/2;
            this.toolOptionsText.position.y = 25 + this.toolText.height/2;
            Graphics.uiContainer.addChild(this.toolOptionsText);
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
                    if (MapGen.toolSize < MapGen.MAX_TOOL_SIZE){
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
                    if (MapGen.toolSize > 1){
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
            return MapGen.cubeMap[axialNode.q][axialNode.r][-axialNode.q-axialNode.r];
        },
        //returns an axial node when given a cube node
        getAxial: function(cubeNode){
            return MapGen.axialMap[cubeNode.x][cubeNode.z];
        },
        //finds the neighbor of a cube node in <dir> direction
        getCubeNeighbor: function(cubeNode,direction){
            var d = this.cubeDirections[direction];
            return MapGen.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.x+d[2]];
        },
        //finds the diagonal neighbor of a cube node in <dir> direction
        getCubeDiagonalNeighbor: function(cubeNode,direction){
            var d = this.cubeDiagonals[direction];
            return MapGen.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.x+d[2]];
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
                    results.push(arr[i]);
                }
            }
            return results;
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
                }
            }
            var size = this.size[0]*2;
            if (this.size[1] > size){size = this.size[1]}
            for (var i = size*-1; i <=size;i++){
                var row1 = {};
                for (var j = size*-1; j <=size;j++){
                    var row2 = {};
                    for (var k = size*-1; k <=size;k++){
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
                this.cubeMap[i] = row1;
            }
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
                }
                this.axialMap[i] = row;
            }
            var s = this.size[0];
            if (this.size[1] > s){s = this.size[1];}
            s = s*2;
            for (var i = s*-1; i <=s;i++){
                var row1 = {};
                for (var j = s*-1; j <=s;j++){
                    var row2 = {};
                    for (var k = s*-1; k <=s;k++){
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
                this.cubeMap[i] = row1;
            }
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
                }
                for (var j = 0; j < this.size;j++){
                    if (Math.sqrt((i+j)*(i+j)) < this.size){
                        var node = this.getAxialNode(i,j);
                        this.axialMap[i][j] = node;
                    }
                }
            }
            var s = this.size
            for (var i = s*-1; i <=s;i++){
                var row1 = {};
                for (var j = s*-1; j <=s;j++){
                    var row2 = {};
                    for (var k = s*-1; k <=s;k++){
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
                this.cubeMap[i] = row1;
            }
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
                    }
                }
                this.axialMap[i] = row;
            }
            for (var i = this.size*-1; i <=this.size;i++){
                var row1 = {};
                for (var j = this.size*-1; j <=this.size;j++){
                    var row2 = {};
                    for (var k = this.size*-1; k <=this.size;k++){
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
                this.cubeMap[i] = row1;
            }
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
                    //get all of the rotated positions!!
                    node.sprite2.rotatedPositions = {};
                    node.sprite2.position.x = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting] * 1.5 * node.q;
                    node.sprite2.position.y = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting] * Math.sqrt(3) * (node.r+node.q/2);
                    node.sprite2.rotatedPositions[0] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite2.rotatedPositions[0][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite2.rotatedPositions[0][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * node.q,
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (node.r+node.q/2)
                            };
                            cAverages[0][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * node.q;
                            cAverages[0][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (node.r+node.q/2);
                        }
                    }
                    var cube = MapGen.getCube(node);
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
                    node.sprite1.position.y = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting] * 1.5 * node.r;
                    node.sprite1.position.x = MapGen.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting] * Math.sqrt(3) * (node.q+node.r/2);
                    node.sprite1.rotatedPositions[1] = {};
                    for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                        node.sprite1.rotatedPositions[1][i] = {};
                        for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                            node.sprite1.rotatedPositions[1][i][j] = {
                                x:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (node.q+node.r/2),
                                y:MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * node.r
                            };
                            cAverages[1][i][j].x += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (node.q+node.r/2);
                            cAverages[1][i][j].y += MapGen.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * node.r;
                        }
                    }
                    var cube = MapGen.getCube(node);
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
            sprite.on('mousedown', function onClick(e){
                MapGen.dragStart = {x:Acorn.Input.mouse.X,y:Acorn.Input.mouse.Y};
            });
            sprite.on('mouseup', function onClick(e){
                MapGen.dragStart = null;
            });
            sprite.on('mouseupoutside', function onClick(e){
                MapGen.dragStart = null;
                var cubeNode = MapGen.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                var arr = MapGen.cubeSpiral(cubeNode,MapGen.toolSize-1);
                for (var i = 0;i < arr.length;i++){
                    try{
                        var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                        var a = MapGen.getAxial(c);
                        var t = 1;
                        if (!(MapGen.currentRotation%2)){t = 2}
                        var s = a['sprite' + t];
                        s.tint = 0xFFFFFF;
                    }catch(e){}
                }
            });
            sprite.on('touchstart', function onClick(e){
            });
            sprite.on('touchend', function onClick(e){
            });
            sprite.on('touchendoutside', function onClick(e){
            });
            sprite.on('pointerover', function onMove(e){
                if (!MapGen.dragStart || MapGen.currentTool == 'noise' || MapGen.currentTool == 'tiles'){
                    MapGen.setNewSelectedNode = sprite;
                }
            }); 
            sprite.on('pointerout', function onMove(e){
                if (!MapGen.dragStart || MapGen.currentTool == 'noise' || MapGen.currentTool == 'tiles'){
                    var cubeNode = MapGen.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                    var arr = MapGen.cubeSpiral(cubeNode,MapGen.toolSize-1);
                    for (var i = 0;i < arr.length;i++){
                        try{
                            var c = MapGen.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                            var a = MapGen.getAxial(c);
                            var t = 1;
                            if (!(MapGen.currentRotation%2)){t = 2}
                            var s = a['sprite' + t];
                            s.tint = 0xFFFFFF;
                        }catch(e){}
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
        },
        update: function(deltaTime){
            Graphics.uiPrimitives2.clear();
            this.sizeText.text = 'Tool Size: ' + this.toolSize;
            this.sensitivityText.text = 'Sensitivity: ' + this.sensitivity;
            Graphics.drawBoxAround(this.landscapeTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.heightTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.noiseTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.drawBoxAround(this.tilesTool,Graphics.uiPrimitives2,'0xFFFFFF',2);
            Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.6);
            Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.6);
            if (MapGen.currentTool == 'height'){
                Graphics.uiPrimitives2.drawRect(
                    this.heightTool.position.x - this.heightTool.width/2,
                    this.heightTool.position.y - this.heightTool.height/2,
                    this.heightTool.width,
                    this.heightTool.height
                );
            }else if (MapGen.currentTool == 'landscape'){
                Graphics.uiPrimitives2.drawRect(
                    this.landscapeTool.position.x - this.landscapeTool.width/2,
                    this.landscapeTool.position.y - this.landscapeTool.height/2,
                    this.landscapeTool.width,
                    this.landscapeTool.height
                );
            }else if (MapGen.currentTool == 'noise'){
                Graphics.uiPrimitives2.drawRect(
                    this.noiseTool.position.x - this.noiseTool.width/2,
                    this.noiseTool.position.y - this.noiseTool.height/2,
                    this.noiseTool.width,
                    this.noiseTool.height
                );
            }
            if (MapGen.currentTool == 'tiles'){
                Graphics.uiPrimitives2.drawRect(
                    this.tilesTool.position.x - this.tilesTool.width/2,
                    this.tilesTool.position.y - this.tilesTool.height/2,
                    this.tilesTool.width,
                    this.tilesTool.height
                );
                Graphics.uiPrimitives2.drawRect(
                    this[this.currentTileType + 'Tile'].position.x - this[this.currentTileType + 'Tile'].width/2,
                    this[this.currentTileType + 'Tile'].position.y - this[this.currentTileType + 'Tile'].height/2,
                    this[this.currentTileType + 'Tile'].width,
                    this[this.currentTileType + 'Tile'].height
                );
                /*Graphics.drawBoxAround(this.baseTile,Graphics.uiPrimitives2,'0xFFFFFF',2);
                Graphics.drawBoxAround(this.dirtTile,Graphics.uiPrimitives2,'0xFFFFFF',2);
                Graphics.drawBoxAround(this.grassTile,Graphics.uiPrimitives2,'0xFFFFFF',2);
                Graphics.drawBoxAround(this.iceTile,Graphics.uiPrimitives2,'0xFFFFFF',2);
                Graphics.drawBoxAround(this.snowTile,Graphics.uiPrimitives2,'0xFFFFFF',2);
                Graphics.drawBoxAround(this.sandTile,Graphics.uiPrimitives2,'0xFFFFFF',2);*/
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
                        try{
                            var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                            var a = this.getAxial(c);
                            var t = 1;
                            if (!(this.currentRotation%2)){t = 2}
                            var s = a['sprite' + t];
                            s.tint = 0x999999;
                        }catch(e){}
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
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h < lowest){
                                            lowest = a.h;
                                        }
                                    }catch(e){}
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
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h > highest){
                                            highest = a.h;
                                        }
                                    }catch(e){}
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
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h < lowest){
                                            lowest = a.h;
                                        }
                                    }catch(e){}
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
                                    try{
                                        var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                        var a = this.getAxial(c);
                                        if (a.h > highest){
                                            highest = a.h;
                                        }
                                    }catch(e){}
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
                                    try{
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
                                    }catch(e){}
                                }
                                
                            }
                            break;
                        case 'tiles':

                            //change sprite tile
                            var cubeNode = this.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                            var arr = this.cubeSpiral(cubeNode,this.toolSize-1);
                            for (var i = 0;i < arr.length;i++){
                                try{
                                    var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                                    var a = this.getAxial(c);
                                    if (a.tile != this.currentTileType){
                                        a.sprite1.texture = this.tileTextures[this.currentTileType][1][a.h];
                                        a.sprite2.texture = this.tileTextures[this.currentTileType][2][a.h];
                                        a.tile = this.currentTileType;
                                    }
                                }catch(e){}
                            }
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
                tile: 'base'
            }
        }

    }
    window.MapGen = MapGen;
})(window);
