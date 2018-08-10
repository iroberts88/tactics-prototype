
(function(window) {

    var Map = function(){

        this.partialTint = 0x5b5b5b;
        this.noLosTint = 0x2b2b2b;
        this.TILE_SIZE = 17; //edge length?
        this.TILE_HEIGHT = 11;
        this.MAX_NODE_HEIGHT = 25;
        this.totalRotations = 12;

    	this.tileTextures = {};
    	this.tileTypes = ['base','grass','dirt','ice','snow','sand'];

    	this.ZOOM_SETTINGS = [0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0];
        this.currentZoomSetting = null;
        this.YSCALE_SETTINGS = [0.8];
        this.currentYScaleSetting = null;
        this.type = null;
        this.size = null;
        this.currentMap = 0;
        this.container1 = null; //container for all "pointy top" sprites
        this.container2 = null; //container for all "flat top" sprites
        this.cAverages = null; //the average of all sprite locations (used for correct rotations)
        this.rotateData = null;
        this.currentRotation = null;

        this.changedZoom = false;

        this.axialDirections = [
            [1,0],[1,-1],[0,-1],
            [-1,0],[-1,1],[0,1]
        ];
        this.cubeDirections = [
            [1,-1,0],[1,0,-1],[0,1,-1],
            [-1,1,0],[-1,0,1],[0,-1,1]
        ];
        this.cubeDiagonals = [
            [+2, -1, -1], [+1, +1, -2], [-1, +2, -1], 
            [-2, +1, +1], [-1, -1, +2], [+1, -2, +1]
        ];
        this.cardinalDirections = [
            'Northeast','Southeast','South',
            'Southwest','Northwest','North'
        ];
        this.cardinalDirectionsAbrv = [
            'NE','SE','S',
            'SW','NW','N'
        ];
        this.spriteStartingDirections = {
            'Southeast': 8,
            'Northeast': 10,
            'North': 0,
            'Northwest': 2,
            'Southwest': 4,
            'South': 6
        };
        this.dirArray = ['d','dl','dl','l','ul','ul','u','ul','ul','l','dl','dl'];
        this.maxSize = 0;
        this.startZone1 = [];
        this.startZone2 = [];

        this.outlineFilter = new PIXI.filters.OutlineFilter(2, 0xff9999);
    }

    Map.prototype.init = function(data){
    	this.axialMap = {};
    	this.cubeMap = {};
        this.currentRotation = 0;
        this.currentZoomSetting = 5;
        this.currentYScaleSetting = 0;

    	//create all of the tile textures for each height
        for (var i = 0; i < this.tileTypes.length;i++){
            var t = this.tileTypes[i];
            this.tileTextures[this.tileTypes[i]] = {1: [],2:[]};
            for (var h = 0;h <= this.MAX_NODE_HEIGHT;h++){
                //create new texture
                var c = new PIXI.Container();
                var startingLoc = 32 + h*this.TILE_HEIGHT;
                for (var j = 0; j <= h;j++){
                    var s = Graphics.getSprite(t + '_tile1');
                    s.anchor.x = 0.0;
                    s.anchor.y = 0.5;
                    s.position.x = 0;
                    s.position.y = startingLoc + j*-this.TILE_HEIGHT;
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
                    s.position.y = startingLoc + j*-this.TILE_HEIGHT;
                    c.addChild(s)
                }
                c._calculateBounds();
                var texture = new PIXI.RenderTexture.create(c.width,c.height);
                Graphics.app.renderer.render(c,texture);
                this.tileTextures[this.tileTypes[i]][2].push(texture);
            }
        }

        //generate the map using axial coordinates
        this.axialMap = {};
        //then set up the cube map
        this.cubeMap = {};

        try{
            for (var i in data.mapData){
                for (var j in data.mapData[i]){
                    if (typeof this.axialMap[i] == 'undefined'){
                        this.axialMap[i] = {};
                    }
                    var node = this.getAxialNode(i,j);
                    this.axialMap[i][j] = node;
                    this.axialMap[i][j].h = data.mapData[i][j].h;
                    this.axialMap[i][j].deleted = data.mapData[i][j].deleted;
                    this.axialMap[i][j].tile = data.mapData[i][j].tile;
                }
            }
            this.initCubeMap();
            this.getHexContainer();
            for (var i in this.axialMap){
                for (var j in this.axialMap[i]){
                    var a = this.axialMap[i][j]
                    a.sprite1.texture = this.tileTextures[a.tile][1][a.h];
                    a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                    a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                    a.sprite2.texture = this.tileTextures[a.tile][2][a.h];
                    a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                    a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*(a.h+1),32,32+this.TILE_HEIGHT*(a.h+1));
                    if (a.deleted){
                        this.container1.removeChild(a.sprite1);
                        this.container2.removeChild(a.sprite2);
                        var cube = this.getCube(a);
                        cube.deleted = true;
                    }
                    if (Math.abs(j) > this.maxSize){this.maxSize = Math.abs(j)}
                }
                if (Math.abs(i) > this.maxSize){this.maxSize = Math.abs(i)}
            }
            this.maxSize = this.maxSize*2;
            this.updateSprites(this.container2.children);
            Game.addOverlaySprites();
            Graphics.worldContainer.addChild(this.container2);
            if (data.sz1){
                for (var i = 0; i < data.sz1.length;i++){
                    this.startZone1.push(this.axialMap[data.sz1[i].q][data.sz1[i].r]);
                }
                for (var i = 0; i < data.sz2.length;i++){
                    this.startZone2.push(this.axialMap[data.sz2[i].q][data.sz2[i].r]);
                }
            }
        }catch(e){
        	console.log(e);
            console.log('Unable to initialize map');
            Graphics.showLoadingMessage(false);
            Acorn.changeState('mainMenu');
        }
    }
    Map.prototype.initCubeMap = function(){
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
                    deleted:false
                }
                this.cubeMap[node.x][node.y][node.z] = node;
            }
        }
    }
    Map.prototype.getHexContainer = function(){
        this.container1 = new PIXI.Container();
        this.container1.interactive = true;
        this.container2 = new PIXI.Container();
        this.container2.interactive = true;
        var cAverages ={}; //Center averages. this will calculate the average of all positions for tiles to determine the center rotation point

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
                var cube = this.getCube(node);
                //get all of the rotated positions!!
                node.sprite2.rotatedPositions = {};
                node.sprite2.position.x = this.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting] * 1.5 * cube.x;
                node.sprite2.position.y = this.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting] * Math.sqrt(3) * (cube.y+cube.x/2);
                node.sprite2.rotatedPositions[0] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite2.rotatedPositions[0][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite2.rotatedPositions[0][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * cube.x,
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (cube.y+cube.x/2)
                        };
                        cAverages[0][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * cube.x;
                        cAverages[0][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (cube.y+cube.x/2);
                    }
                }
                var newCube = [-cube.z,-cube.x,-cube.y];
                node.sprite2.rotatedPositions[2] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite2.rotatedPositions[2][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite2.rotatedPositions[2][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube[0],
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube[1]+newCube[0]/2)
                        };
                        cAverages[2][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube[0];
                        cAverages[2][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube[1]+newCube[0]/2);
                    }
                }
                var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                node.sprite2.rotatedPositions[4] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite2.rotatedPositions[4][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite2.rotatedPositions[4][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube2[0],
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube2[1]+newCube2[0]/2)
                        };
                        cAverages[4][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube2[0];
                        cAverages[4][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube2[1]+newCube2[0]/2);
                    }
                }
                var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                node.sprite2.rotatedPositions[6] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite2.rotatedPositions[6][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite2.rotatedPositions[6][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube3[0],
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube3[1]+newCube3[0]/2)
                        };
                        cAverages[6][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube3[0];
                        cAverages[6][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube3[1]+newCube3[0]/2);
                    }
                }
                var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                node.sprite2.rotatedPositions[8] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite2.rotatedPositions[8][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite2.rotatedPositions[8][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube4[0],
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube4[1]+newCube4[0]/2)
                        };
                        cAverages[8][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube4[0];
                        cAverages[8][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube4[1]+newCube4[0]/2);
                    }
                }
                var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                node.sprite2.rotatedPositions[10] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite2.rotatedPositions[10][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite2.rotatedPositions[10][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube5[0],
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube5[1]+newCube5[0]/2)
                        };
                        cAverages[10][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * 1.5 * newCube5[0];
                        cAverages[10][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * Math.sqrt(3) * (newCube5[1]+newCube5[0]/2);
                    }
                }
                node.sprite1.rotatedPositions = {};
                node.sprite1.position.y = this.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting]*this.YSCALE_SETTINGS[this.currentYScaleSetting] * 1.5 * cube.y;
                node.sprite1.position.x = this.TILE_SIZE*this.ZOOM_SETTINGS[this.currentZoomSetting] * Math.sqrt(3) * (cube.x+cube.y/2);
                node.sprite1.rotatedPositions[1] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite1.rotatedPositions[1][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite1.rotatedPositions[1][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (cube.x+(cube.y/2)),
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * this.YSCALE_SETTINGS[j] * 1.5 * cube.y
                        };
                        cAverages[1][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (cube.x+cube.y/2);
                        cAverages[1][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * cube.y;
                    }
                }
                var newCube = [-cube.z,-cube.x,-cube.y];
                node.sprite1.rotatedPositions[3] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite1.rotatedPositions[3][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite1.rotatedPositions[3][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube[0]+newCube[1]/2),
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube[1]
                        };
                        cAverages[3][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube[0]+newCube[1]/2);
                        cAverages[3][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube[1];
                    }
                }
                var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                node.sprite1.rotatedPositions[5] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite1.rotatedPositions[5][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite1.rotatedPositions[5][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube2[0]+newCube2[1]/2),
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube2[1]
                        };
                        cAverages[5][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube2[0]+newCube2[1]/2);
                        cAverages[5][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube2[1];
                    }
                }
                var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                node.sprite1.rotatedPositions[7]= {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite1.rotatedPositions[7][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite1.rotatedPositions[7][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube3[0]+newCube3[1]/2),
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube3[1]
                        };
                        cAverages[7][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube3[0]+newCube3[1]/2);
                        cAverages[7][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube3[1];
                    }
                }
                var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                node.sprite1.rotatedPositions[9] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite1.rotatedPositions[9][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite1.rotatedPositions[9][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube4[0]+newCube4[1]/2),
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube4[1]
                        };
                        cAverages[9][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube4[0]+newCube4[1]/2);
                        cAverages[9][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube4[1];
                    }
                }
                var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                node.sprite1.rotatedPositions[11] = {};
                for (var i = 0; i <this.ZOOM_SETTINGS.length;i++){
                    node.sprite1.rotatedPositions[11][i] = {};
                    for (var j = 0; j < this.YSCALE_SETTINGS.length;j++){
                        node.sprite1.rotatedPositions[11][i][j] = {
                            x:this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube5[0]+newCube5[1]/2),
                            y:this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube5[1]
                        };
                        cAverages[11][i][j].x += this.TILE_SIZE*this.ZOOM_SETTINGS[i] * Math.sqrt(3) * (newCube5[0]+newCube5[1]/2);
                        cAverages[11][i][j].y += this.TILE_SIZE*this.ZOOM_SETTINGS[i]*this.YSCALE_SETTINGS[j] * 1.5 * newCube5[1];
                    }
                }

                node.sprite1.anchor.x = .5;
                node.sprite1.anchor.y = .5;
                node.sprite1.axialCoords = {q:x,r:y};
                node.sprite1.cubeCoords = {x:x,y:-x-y,z:y};
                node.sprite1.interactive = true;
                this.setupEvents(node.sprite1);
                this.container1.addChild(node.sprite1);

                node.sprite2.anchor.x = .5;
                node.sprite2.anchor.y = .5;
                node.sprite2.axialCoords = {q:x,r:y};
                node.sprite2.cubeCoords = {x:x,y:-x-y,z:y};
                node.sprite2.interactive = true;
                this.setupEvents(node.sprite2);
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
        this.container1.children = this.mergeSort(this.container1.children);
        this.container1.position.x = Graphics.width/2;
        this.container1.position.y = Graphics.height/2;
        this.container2.children = this.mergeSort(this.container2.children);
        this.container2.position.x = Graphics.width/2;
        this.container2.position.y = Graphics.height/2;
        Graphics.worldPrimitives.position.x = Graphics.width/2;
        Graphics.worldPrimitives.position.y = Graphics.height/2;
    }
	Map.prototype.updateSprites = function(arr, resetTint){
        Game.removeOverlaySprites();
        if (typeof resetTint == 'undefined'){
            resetTint = false;
        }
        //updates sprite position in c.children arr after a rotation/zoom ect.
        try{
            for (var i = 0; i < arr.length;i++){
                if (arr[i].pSprite){
                    continue;
                }
                arr[i].scale.x = this.ZOOM_SETTINGS[this.currentZoomSetting];
                arr[i].scale.y = this.YSCALE_SETTINGS[this.currentYScaleSetting]*this.ZOOM_SETTINGS[this.currentZoomSetting];
                arr[i].position.x = arr[i].rotatedPositions[this.currentRotation][this.currentZoomSetting][this.currentYScaleSetting].x;
                arr[i].position.y = arr[i].rotatedPositions[this.currentRotation][this.currentZoomSetting][this.currentYScaleSetting].y;
                if (resetTint && window.currentMapState != 'game'){
                    arr[i].tint = 0xFFFFFF;
                }
            }
        }catch(e){
            console.log(e);
            console.log(i);
            console.log(arr);
        }
        return this.mergeSort(arr);
    }
    Map.prototype.setupEvents = function(sprite){
        //setup drag and click events for sprite
        if (window.currentMapState == 'mapgen'){    
            //Events for the mapGen state
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
                            MapGen.losToolData.spritesAltered[i].alpha = 1.0;
                        }
                        MapGen.losToolData.spritesAltered = [];
                        MapGen.losToolData.losShown = false;
                    }
                }catch(e){}
            });
            sprite.on('pointerupoutside', function onClick(e){
                MapGen.dragStart = null;
                var cubeNode = MapGen.map.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                var arr = MapGen.map.cubeSpiral(cubeNode,MapGen.toolSize-1);
                for (var i = 0;i < arr.length;i++){
                    var c = arr[i];
                    var a = MapGen.map.getAxial(c);
                    var t = 1;
                    if (!(MapGen.map.currentRotation%2)){t = 2}
                    var s = a['sprite' + t];
                    s.tint = 0xFFFFFF;
                }
                try{
                    if (MapGen.losToolData.losShown){
                        for (var i = 0; i < MapGen.losToolData.spritesAltered.length;i++){
                            MapGen.losToolData.spritesAltered[i].tint = 0xFFFFFF;
                            MapGen.losToolData.spritesAltered[i].alpha = 1.0;
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
                    var cubeNode = MapGen.map.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                    var arr = MapGen.map.cubeSpiral(cubeNode,MapGen.toolSize-1);
                    for (var i = 0;i < arr.length;i++){
                        var c = arr[i];
                        var a = MapGen.map.getAxial(c);
                        var t = 1;
                        if (!(MapGen.map.currentRotation%2)){t = 2}
                        var s = a['sprite' + t];
                        s.tint = 0xFFFFFF;
                    }
                }
            });
        }else if (window.currentMapState == 'game'){
            //events for the actual game state
            //var outlineFilterRed = new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5);
            var filtersOn = function () {
                this.filters = [outlineFilterRed]
            }

            var filtersOff = function() {
                this.filters = []
            }
            sprite.clicked = false;
            sprite.on('pointerdown', function onClick(e){
                if (Game.map.rotateData){return;}
                var node = Game.map.axialMap[sprite.axialCoords.q][sprite.axialCoords.r];
                if (Game.moveActive){
                    Game.tryToMove(node);
                    return;
                }
                if (Game.attackActive){
                    Game.tryToAttack(node);
                    return;
                }
                if (node.unit){
                    Game.selectUnit(node.unit);
                }
            });
            sprite.on('pointerup', function onClick(e){

            });
            sprite.on('pointerupoutside', function onClick(e){
            });
            sprite.on('pointerover', function onMove(e){
                if (Game.map.rotateData){return;}
                //movement is active...
                if (Game.moveActive){
                    Graphics.worldPrimitives.clear();
                    movePossible = false;
                    for (var i = 0; i < Game.moveNodesActive.length;i++){
                        if (sprite.axialCoords.q == Game.moveNodesActive[i].q && sprite.axialCoords.r == Game.moveNodesActive[i].r){
                            movePossible = true;
                        }
                    }
                    if (movePossible){
                        var unit = Game.units[Game.turnList[0]]; 
                        Graphics.worldPrimitives.lineStyle(3,0xFFFF00,1);
                        var t = 1;
                        if (!(Game.map.currentRotation%2)){t = 2}
                        var sp = 'sprite' + t;
                        var a = unit.currentNode;
                        var path = Game.map.findPath(Game.map.getCube(unit.currentNode),Game.map.getCube(Game.map.axialMap[sprite.axialCoords.q][sprite.axialCoords.r]),{maxJump: Game.units[Game.turnList[0]].jump,startingUnit:Game.units[Game.turnList[0]]});
                        Graphics.worldPrimitives.moveTo(a[sp].position.x,a[sp].position.y-Game.map.TILE_HEIGHT*(a.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]);
                        for (var i = 1; i < path.length;i++){
                            var a = Game.map.getAxial(path[i]);
                            Graphics.worldPrimitives.lineTo(a[sp].position.x,a[sp].position.y-Game.map.TILE_HEIGHT*(a.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]);
                        }
                    }
                }
                if (Game.selectedNode != null){return;}
                Game.resetTint();
                Game.setNewHoveredNode = Game.map.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                Game.currentlyMousedOver = sprite;
            }); 
            sprite.on('pointerout', function onMove(e){
                if (Game.selectedNode == null){
                    if (Game.map.rotateData){return;}
                    var cubeNode = Game.map.cubeMap[sprite.cubeCoords.x][sprite.cubeCoords.y][sprite.cubeCoords.z];
                    var a = Game.map.getAxial(cubeNode);
                    a.sprite1.filters = [];
                    a.sprite2.filters = [];
                    Game.nodeInfo.visible = false;
                    Game.nodeText.visible = false;
                }

            });
        }
    }
    //returns a cube node when given an axial node
    Map.prototype.getCube = function(axialNode){
        return this.cubeMap[axialNode.q][-axialNode.q-axialNode.r][axialNode.r];
    }
    //returns an axial node when given a cube node
    Map.prototype.getAxial = function(cubeNode){
        return this.axialMap[cubeNode.x][cubeNode.z];
    }
    //finds the neighbor of a cube node in <dir> direction
    Map.prototype.getCubeNeighbor = function(cubeNode,direction){
        var d = this.cubeDirections[direction];
        try{
            return this.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.z+d[2]];
        }catch(e){}
        return null;
    }
    //finds the diagonal neighbor of a cube node in <dir> direction
    Map.prototype.getCubeDiagonalNeighbor = function(cubeNode,direction){
        try{
            var d = this.cubeDiagonals[direction];
            return this.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.z+d[2]];
        }catch(e){
            return false;
        }
    },
    //finds the neighbor of an axial node in <dir> direction
    Map.prototype.getAxialNeighbor = function(axialNode,direction){
        try{
            var d = this.axialDirections[direction];
            return this.axialMap[parseInt(axialNode.q)+d[0]][parseInt(axialNode.r)+d[1]];
        }catch(e){
            return false;
        }
    }
    //returns the direction when moving from one axial node to another
    Map.prototype.getNewDirectionAxial = function(startNode,endNode){
        var qMove = startNode.q - endNode.q;
        var rMove = startNode.r - endNode.r;
        for (var i = 0; i < this.axialDirections.length;i++){
            if (qMove == this.axialDirections[i][0] && rMove == this.axialDirections[i][1]){
                return i;
            }
        }
        return null;
    };
    Map.prototype.cubeRing = function(center,radius){
        //return a list of all nodes in a ring around a center node
        if (!radius){return [center];}
        var results = [];
        var cubeNode = [center.x+this.cubeDirections[4][0]*radius,center.y+this.cubeDirections[4][1]*radius,center.z+this.cubeDirections[4][2]*radius];
        for (var i = 0; i < 6;i++){
            for (var j = 0; j < radius;j++){
                try{
                    var c = this.cubeMap[cubeNode[0]][cubeNode[1]][cubeNode[2]];
                    results.push(c);
                }catch(e){}
                var d = this.cubeDirections[i];
                cubeNode = [cubeNode[0]+d[0],cubeNode[1]+d[1],cubeNode[2]+d[2]];
            }
        }
        return results;
    }
    Map.prototype.cubeSpiral = function(center,radius){
        var results = [];
        for (var k = 0; k <= radius;k++){
            var arr = this.cubeRing(center,k);
            for (var i = 0; i < arr.length;i++){
                results.push(arr[i]);
            }
        }
        return results;
    }
    Map.prototype.cubeDistance = function(a,b){
        return Math.round(Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z)));
    }
    Map.prototype.cubeRound = function(cube){
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
    }

    Map.prototype.cubeLineDraw = function(a,b){
    	//return a list of cube nodes in a line from a-b using linear interpolation
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
    }

    Map.prototype.lerp = function(a,b,t){
        return a + (b-a) * t;
    }
        
    Map.prototype.cubeLerp = function(a,b,t){
        return {
            x: this.lerp(a.x,b.x,t),
            y: this.lerp(a.y,b.y,t),
            z: this.lerp(a.z,b.z,t)
        }
    }

    Map.prototype.findPath = function(startNode,endNode,options,skip,maxJump){

        //A* search
        //start = starting axial node;
        //end = ending axial node;
        //OPTIONS
        //skip - nodes to skip (for delete in map editor) TODO - the game version probably shouldnt have this
        //maxJump - the maximum height diff for a neighboring node to be viable
        //startingUnit

        //returns empty array if no path exists
        //returns path array if path exists [node,node,node,...]

        //Init the start node and the end node
        startNode.f = 0;
        startNode.g = 0;
        startNode.h = 0;
        startNode.parent = null;
        endNode.f = 0;
        endNode.g = 0;
        endNode.h = 0;
        endNode.parent = null;

        if (typeof options.maxJump == 'undefined'){
            options.maxJump = 99;
        }
        if (typeof options.skip == 'undefined'){
            options.skip = null;
        }
        if (typeof options.startingUnit == 'undefined'){
            options.startingUnit = null;
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
                //Found the optimal path. Add all node parents to the result array and return
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
            /*
            TODO -- eventually, this should also scan neighbors within jump distance 
            (eg. in decreasing height at a higher distance)
            */
            for (var i = 0;i < 6;i++){
                var node = this.getCubeNeighbor(currentNode,i);
                //first check if the node exists
                if (node){
                    var axial = this.getAxial(node);
                    //check units on this node
                    if (options.startingUnit && axial.unit){
                        if (axial.unit.owner != options.startingUnit.owner){
                            // not a valid node to process, skip to next neighbor
                            continue;
                        }
                    }
                    if(this.findGraphNode(closedList,node) || node == options.skip || node.deleted || axial.h - currentAxial.h > options.maxJump) {
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
                        //a small amount is added based on height diff 
                        //to avoid paths with too much height variation when possible
                        node.h = Math.max(Math.abs(endNode.x-node.x),Math.abs(endNode.y-node.y),Math.abs(endNode.z-node.z)) + (Math.abs(axial.h - currentAxial.h)*0.001);
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
    }
    Map.prototype.removeGraphNode =  function(arr,node){
        //for use in findPath
        for (var i = 0;i < arr.length;i++){
            if (arr[i] == node){
                arr.splice(i,1);
            }
        }
    }
    Map.prototype.findGraphNode =  function(arr,node){
        //for use in findPath
        for (var i = 0;i < arr.length;i++){
            if (arr[i] == node){
                return true;
            }
        }
        return false;
    }

    //sort a list of sprites to be added to a container
    Map.prototype.mergeSort = function(arr){
        if (arr.length <= 1){
            return arr;
        }
        var middle = parseInt(arr.length/2);
        var left = arr.slice(0,middle);
        var right = arr.slice(middle,arr.length);
        return this.merge(this.mergeSort(left),this.mergeSort(right));
    }
    Map.prototype.merge = function(left,right){
        var result = [];
        while (left.length && right.length) {
            //if not a map tile sprite, ignore pos
            if (left[0].pSprite){
                left.shift();
                continue;
            }
            if (right[0].pSprite){
                right.shift();
                continue;
            }
            if (left[0].position.y < right[0].position.y) {
                result.push(left.shift());
            } else if (left[0].position.y == right[0].position.y) {
                //if they are at the same y position, sort by z direction (height)
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
    }
    Map.prototype.move = function(x,y){

        Graphics.world.position.x = Math.max(-Graphics.width/2,Math.min(Graphics.world.position.x+x,Graphics.width/2));
        Graphics.world.position.y = Math.max(-Graphics.height/2,Math.min(Graphics.world.position.y+y,Graphics.height/2));

        //this.container1.position.x = Math.max(0,Math.min(this.container1.position.x+x,Graphics.width));
        //this.container2.position.x = this.container1.position.x;
        //this.container1.position.y = Math.max(0,Math.min(this.container1.position.y+y,Graphics.height));
        //this.container2.position.y = this.container1.position.y;
    }
    Map.prototype.update = function(deltaTime){
    	if (this.rotateData){
            //rotate the map if rotate data is given
            if (typeof this.rotateData.swapped == 'undefined'){
                this.rotateData.swapped = false;
            }

            this.rotateData.t += deltaTime;
            if (!this.rotateData.swapped && this.rotateData.t >= this.rotateData.time/2){
                this.rotateData.extraRot = -this.rotateData.angle;
                this.rotateData.swapped = true;
                Graphics.worldContainer.removeChildren();
                var t = 1;
                if (!(this.currentRotation%2)){t = 2}
                Graphics.worldContainer.addChild(this['container' + t]);
                this['container' + t].children = this.updateSprites(this['container' + t].children,true);
                Game.addOverlaySprites();
                Graphics.worldPrimitives.clear();
            }
            this.container1.rotation = this.rotateData.extraRot + this.rotateData.angle * (this.rotateData.t/this.rotateData.time);
            this.container2.rotation = this.rotateData.extraRot + this.rotateData.angle * (this.rotateData.t/this.rotateData.time);
            if (this.rotateData.t >= this.rotateData.time){
                this.container1.rotation = 0;
                this.container2.rotation = 0;
                this.rotateData = null;
                Game.updateCompass();
            }

        }
    }
    Map.prototype.getAxialNode = function(q,r){
        return {
            q:q,
            r:r,
            h:0,
            tile: 'base',
            deleted: false,
            unit: null,
            sprite1: null,
            sprite2: null,
            overlaySprite1: null,
            overlaySprite2: null
        }
    }

    window.Map = Map;
})(window);
