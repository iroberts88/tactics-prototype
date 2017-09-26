
(function(window) {
    MapGen = {
        TILE_SIZE: 17,
        TILE_HEIGHT: 11,

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

        currentTool: 'heightMod',
        toolSize: 1,

        init: function() {
            this.drawBG();
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
        //sort a list of sprites to be added to a container
        mergeSort: function(arr){
            if (arr.length == 1){
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
            
            var c = this.getHexContainer('2',function(sprite,node){
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
            Graphics.worldContainer.addChild(this.container);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.rotatedPositions = {};
                sprite.position.y = MapGen.TILE_SIZE * 1.5 * node.r;
                sprite.position.x = MapGen.TILE_SIZE * Math.sqrt(3) * (node.q+node.r/2);
                sprite.rotatedPositions[1] = [MapGen.TILE_SIZE * 1.5 * node.q,MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2)];
                //60 degree rotation at position 3
                var cube = MapGen.getCube(node);
                var newCube = [-cube.z,-cube.x,-cube.y];
                sprite.rotatedPositions[3] = [MapGen.TILE_SIZE * 1.5 * newCube[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube[1]+newCube[0]/2)];
                //120 degree rotation at position 5
                var newCube2 = [-newCube[2],-newCube[0],-newCube[1]];
                sprite.rotatedPositions[5] = [MapGen.TILE_SIZE * 1.5 * newCube2[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube2[1]+newCube2[0]/2)];
                //180 degree rotation at position 7
                var newCube3 = [-newCube2[2],-newCube2[0],-newCube2[1]];
                sprite.rotatedPositions[7] = [MapGen.TILE_SIZE * 1.5 * newCube3[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube3[1]+newCube3[0]/2)];
                //240 degree rotation at position 9
                var newCube4 = [-newCube3[2],-newCube3[0],-newCube3[1]];
                sprite.rotatedPositions[9] = [MapGen.TILE_SIZE * 1.5 * newCube4[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube4[1]+newCube4[0]/2)];
                //300 degree rotation at position 11
                var newCube5 = [-newCube4[2],-newCube4[0],-newCube4[1]];
                sprite.rotatedPositions[11] = [MapGen.TILE_SIZE * 1.5 * newCube5[0],MapGen.TILE_SIZE * Math.sqrt(3) * (newCube5[1]+newCube5[0]/2)];
            });
            
        },
        getHexContainer: function(tile,posFunc){
            this.container = new PIXI.particles.ParticleContainer(10000, {
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                alpha: true
            });
            this.container2 = new PIXI.particles.ParticleContainer(10000, {
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                alpha: true
            });
            for (var x in this.axialMap){
                for (var y in this.axialMap[x]){
                    var node = this.axialMap[x][y];
                    var sprite = Graphics.getSprite('base_tile' + tile);
                    posFunc(sprite,node);
                    sprite.anchor.x = .5;
                    sprite.anchor.y = .5;
                    node.sprite = sprite;
                    sprite.loc = {x:x,y:y};
                    MapGen.setupEvents(sprite);
                    if (tile == '2'){
                        this.container.addChild(sprite);
                    }else{
                        this.container2.addChild(sprite);
                    }
                }
            }
            if (tile == '2'){
                this.container.children = MapGen.mergeSort(this.container.children);
                this.container.position.x = Graphics.width/2;
                this.container.position.y = Graphics.height/2;
                this.container.currentRotation = 0;
            }else{
                this.container2.children = MapGen.mergeSort(this.container2.children);
                this.container2.position.x = Graphics.width/2;
                this.container2.position.y = Graphics.height/2;
                this.container2.currentRotation = 1;
            }
        },
        setupEvents: function(sprite){
            //setup drag and click events for sprite
            sprite.clicked = false
            sprite.on('mousedown', function onClick(e){
                sprite.clicked = true;
            });
            sprite.on('mouseup', function onClick(e){
                sprite.clicked = false;
            });
            sprite.on('mouseupoutside', function onClick(e){
                sprite.clicked = false;
            });
            sprite.on('touchstart', function onClick(e){
            });
            sprite.on('touchend', function onClick(e){
            });
            sprite.on('touchendoutside', function onClick(e){
            });
            sprite.on('mousemove', function onMove(e){
            });
            sprite.on('touchmove', function onMove(e){
            });
        }
        changeSpriteHeight: function(sprite){
            //create new texture

            //set texture to sprite

            //change anchor to be the bottom tile
        }
        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('blue', 'white');

        },
        update: function(deltaTime){
            if (MapGen.rotateData){
                if (typeof MapGen.rotateData.swapped == 'undefined'){
                    MapGen.rotateData.swapped = false;
                }
            }
        }

    }
    window.MapGen = MapGen;
})(window);
