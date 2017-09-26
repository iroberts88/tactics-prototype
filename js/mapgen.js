
(function(window) {
    MapGen = {
        TILE_SIZE: 17,
        TILE_HEIGHT: 11,
        MAX_TOOL_SIZE: 10,
        MIN_SENSITIVITY: 1,
        MAX_SENSITIVITY: 15,
        MAX_NODE_HEIGHT: 20,

        type: null,
        size: null,

        // axial and cube maps
        axialMap: null,
        cubeMap: null,

        currentMap: 0,
        totalRotations: null,

        container: null, //container for all sprites
        container2: null,

        rotateData: null,
        currentRotation: 0,

        currentTool: 'heightMod',
        toolSize: 1,
        sensitivity: 4,

        selectedSprite: null,
        setNewSelectedNode: 0,
        dragStart: null,

        init: function() {
            this.drawBG();
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
                    MapGen.currentTool = 'heightMod';
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

            this.sensitivityText = AcornSetup.makeButton({
                text: 'Sensitivity: 30',
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
                    this.initRectangle();
                    break;
                case 'rh':
                    this.initRhombus();
                    break;
                case 't':
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
                if (left[0].position.y <= right[0].position.y) {
                    result.push(left.shift());
                } else {
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
        },
        initRhombus: function(){
            console.log('Generating a ' + this.size[0] + 'x' + this.size[1] + ' Rhombus Map');
        },
        initTriangle: function(){
            console.log('Generating a ' + this.size + ' unit Triangle Map');
        },
        initHexagon: function(){
            console.log('Generating a ' + this.size + ' unit Hexagon Map');
            //Generate the cube and axial coordinate systems
            for (var i = this.size*-1; i <=this.size;i++){
                var row = {};
                for (var j = this.size*-1; j <=this.size;j++){
                    if (Math.sqrt((i+j)*(i+j)) <= this.size){
                        var node = {
                            q: i,
                            r: j,
                            h: 0,

                        }
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
            //Hex maps have 12 rotation points
            //set up the sprites for all 12 rotations
            
            this.getHexContainer('2',function(sprite,node){
                sprite.rotatedPositions = {};
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
                sprite.rotatedPositions[0] = [MapGen.TILE_SIZE * 1.5 * node.q,MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2)];
                //60 degree rotation at position 2
                var cube = MapGen.getCube(node);
                var newCube = [-cube.z,-cube.x,-cube.y];
                sprite.rotatedPositions[2] = [MapGen.TILE_SIZE * 1.5 * newCube[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube[1]+newCube[0]/2)];
                //120 degree rotation at position 4
                var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                sprite.rotatedPositions[4] = [MapGen.TILE_SIZE * 1.5 * newCube2[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube2[1]+newCube2[0]/2)];
                //180 degree rotation at position 6
                var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                sprite.rotatedPositions[6] = [MapGen.TILE_SIZE * 1.5 * newCube3[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube3[1]+newCube3[0]/2)];
                //240 degree rotation at position 8
                var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                sprite.rotatedPositions[8] = [MapGen.TILE_SIZE * 1.5 * newCube4[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube4[1]+newCube4[0]/2)];
                //300 degree rotation at position 10
                var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                sprite.rotatedPositions[10] = [MapGen.TILE_SIZE * 1.5 * newCube5[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube5[1]+newCube5[0]/2)];
            });
            Graphics.worldContainer.addChild(this.container2);
            this.getHexContainer('1',function(sprite,node){
                sprite.rotatedPositions = {};
                sprite.position.y = MapGen.TILE_SIZE * 1.5 * node.r;
                sprite.position.x = MapGen.TILE_SIZE * Math.sqrt(3) * (node.q+node.r/2);
                sprite.rotatedPositions[1] = [MapGen.TILE_SIZE * Math.sqrt(3) * (node.q+node.r/2),MapGen.TILE_SIZE * 1.5 * node.r];
                //60 degree rotation at position 3
                var cube = MapGen.getCube(node);
                var newCube = [-cube.z,-cube.x,-cube.y];
                sprite.rotatedPositions[3] = [MapGen.TILE_SIZE * Math.sqrt(3) * (newCube[0]+newCube[1]/2),MapGen.TILE_SIZE * 1.5 * newCube[1]];
                //120 degree rotation at position 5
                var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                sprite.rotatedPositions[5] = [MapGen.TILE_SIZE * Math.sqrt(3) * (newCube2[0]+newCube2[1]/2),MapGen.TILE_SIZE * 1.5 * newCube2[1]];
                //180 degree rotation at position 7
                var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                sprite.rotatedPositions[7] = [MapGen.TILE_SIZE * Math.sqrt(3) * (newCube3[0]+newCube3[1]/2),MapGen.TILE_SIZE * 1.5 * newCube3[1]];
                //240 degree rotation at position 9
                var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                sprite.rotatedPositions[9] = [MapGen.TILE_SIZE * Math.sqrt(3) * (newCube4[0]+newCube4[1]/2),MapGen.TILE_SIZE * 1.5 * newCube4[1]];
                //300 degree rotation at position 11
                var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                sprite.rotatedPositions[11] = [MapGen.TILE_SIZE * Math.sqrt(3) * (newCube5[0]+newCube5[1]/2),MapGen.TILE_SIZE * 1.5 * newCube5[1]];
            });
            
        },
        getHexContainer: function(tileset,posFunc){
            this['container' + tileset] = new PIXI.Container();
            this['container' + tileset].interactive = true;
            for (var x in this.axialMap){
                for (var y in this.axialMap[x]){
                    var node = this.axialMap[x][y];
                    node['sprite'+tileset]= Graphics.getSprite('base_tile' + tileset);
                    posFunc(node['sprite'+tileset],node);
                    node['sprite'+tileset].anchor.x = .5;
                    node['sprite'+tileset].anchor.y = .5;
                    node['sprite'+tileset].axialCoords = {q:x,r:y};
                    node['sprite'+tileset].cubeCoords = {x:x,y:-x-y,z:y};
                    node['sprite'+tileset].interactive = true;
                    node['sprite'+tileset].hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT,32,32+this.TILE_HEIGHT);
                    MapGen.setupEvents(node['sprite'+tileset]);
                    this['container' + tileset].addChild(node['sprite'+tileset]);
                }
            }
            this['container' + tileset].children = MapGen.mergeSort(this['container' + tileset].children);
            this['container' + tileset].position.x = Graphics.width/2;
            this['container' + tileset].position.y = Graphics.height/2;
        },
        updateSprites: function(arr){
            //updates sprite position in c.children arr after a rotation
            for (var i = 0; i < arr.length;i++){
                arr[i].position.x = arr[i].rotatedPositions[this.currentRotation][0];
                arr[i].position.y = arr[i].rotatedPositions[this.currentRotation][1];
                arr[i].tint = 0xFFFFFF;
            }
            return MapGen.mergeSort(arr);
        },
        setupEvents: function(sprite){
            //setup drag and click events for sprite
            console.log("setting up events");
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
                if (!MapGen.dragStart){
                    MapGen.setNewSelectedNode = sprite;
                }
            }); 
            sprite.on('pointerout', function onMove(e){
                if (!MapGen.dragStart){
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
            Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.6);
            Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.6);
            if (MapGen.currentTool == 'heightMod'){
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
            }
            Graphics.worldPrimitives.endFill();
            if (this.rotateData){
                //rotate the map if rotate data is given
                if (typeof this.rotateData.swapped == 'undefined'){
                    this.rotateData.swapped = false;
                }

                this.rotateData.t += deltaTime;
                this.container1.rotation = this.rotateData.extraRot + this.rotateData.angle * (this.rotateData.t/this.rotateData.time);
                this.container2.rotation = this.rotateData.extraRot + this.rotateData.angle * (this.rotateData.t/this.rotateData.time);
                if (this.rotateData.t >= this.rotateData.time/2 && !this.rotateData.swapped){
                    this.rotateData.extraRot = -this.rotateData.angle;
                    this.rotateData.swapped = true;
                    Graphics.worldContainer.removeChildren();
                    var t = 1;
                    if (!(this.currentRotation%2)){t = 2}
                    Graphics.worldContainer.addChild(this['container' + t]);
                    this['container' + t].children = this.updateSprites(this['container' + t].children);
                }else{
                    if (this.rotateData.t >= this.rotateData.time){
                        this.container1.rotation = 0;
                        this.container2.rotation = 0;
                        this.rotateData = null;
                    }
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
                    var dragged = 0;
                    if (this.dragStart.y - Acorn.Input.mouse.Y > this.sensitivity){
                        dragged = 1;
                    }
                    if (this.dragStart.y - Acorn.Input.mouse.Y < -this.sensitivity){
                        dragged = -1;
                    }
                    if (dragged){
                        switch(this.currentTool){
                            case 'heightMod':
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
                                                a.sprite1.texture = this.getNewSpriteHeight('base_tile1',lowest+1);
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
                                                a.sprite2.texture = this.getNewSpriteHeight('base_tile2',lowest+1);
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
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
                                                a.sprite1.texture = this.getNewSpriteHeight('base_tile1',highest-1);
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
                                                a.sprite2.texture = this.getNewSpriteHeight('base_tile2',highest-1);
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
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
                                                a.sprite1.texture = this.getNewSpriteHeight('base_tile1',lowest+1);
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
                                                a.sprite2.texture = this.getNewSpriteHeight('base_tile2',lowest+1);
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
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
                                                    a.sprite1.texture = this.getNewSpriteHeight('base_tile1',ringLowest+1);
                                                    a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                    a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
                                                    a.sprite2.texture = this.getNewSpriteHeight('base_tile2',ringLowest+1);
                                                    a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                    a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
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
                                                a.sprite1.texture = this.getNewSpriteHeight('base_tile1',highest-1);
                                                a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                a.sprite1.hitArea = new PIXI.Rectangle(-16,-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
                                                a.sprite2.texture = this.getNewSpriteHeight('base_tile2',highest-1);
                                                a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
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
                                                if (a.h == ringHighest && a.h >0 && ringHighest > highest){
                                                    //all the lowest nodes, increase height!
                                                    a.sprite1.texture = this.getNewSpriteHeight('base_tile1',ringHighest-1);
                                                    a.sprite1.anchor.y = (a.sprite1.texture.height-32)/a.sprite1.texture.height;
                                                    a.sprite1.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
                                                    a.sprite2.texture = this.getNewSpriteHeight('base_tile2',ringHighest-1);
                                                    a.sprite2.anchor.y = (a.sprite2.texture.height-32)/a.sprite2.texture.height;
                                                    a.sprite2.hitArea = new PIXI.Rectangle(-16,-16-this.TILE_HEIGHT*a.h,32,32+this.TILE_HEIGHT*a.h);
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
                        }
                        this.dragStart.y = Acorn.Input.mouse.Y;
                    }
                }
            }
        }

    }
    window.MapGen = MapGen;
})(window);
