
(function(window) {
    MapGen = {
        TILE_SIZE: 17,
        TILE_HEIGHT: 11,

        type: null,
        size: null,

        // axial and cube maps
        axialMap: null,
        cubeMap: null,
        //container for every rotation of the map - containing all sprites
        allMaps: null,
        currentMap: 0,

        init: function() {
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
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            Graphics.worldContainer.addChild(c);
            this.allMaps.push(c);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.position.y = MapGen.TILE_SIZE * 1.5 * node.r;
                sprite.position.x = MapGen.TILE_SIZE * Math.sqrt(3) * (node.q+node.r/2);
            });
            //rotated 60 degrees!
            this.allMaps.push(c);
            var c = this.getHexContainer('2',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            this.allMaps.push(c);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            //rotated 120 degrees!
            this.allMaps.push(c);
            var c = this.getHexContainer('2',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            this.allMaps.push(c);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            //rotated 180 degrees
            this.allMaps.push(c);
            var c = this.getHexContainer('2',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            this.allMaps.push(c);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            //rotated 240 degrees
            this.allMaps.push(c);
            var c = this.getHexContainer('2',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            this.allMaps.push(c);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            //rotate 300 degrees
            this.allMaps.push(c);
            var c = this.getHexContainer('2',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            this.allMaps.push(c);
            var c = this.getHexContainer('1',function(sprite,node){
                sprite.position.x = MapGen.TILE_SIZE * 1.5 * node.q;
                sprite.position.y = MapGen.TILE_SIZE * Math.sqrt(3) * (node.r+node.q/2);
            });
            this.allMaps.push(c);
        },
        getHexContainer: function(tile,posFunc){
            var container = new PIXI.particles.ParticleContainer(10000, {
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                alpha: true
            });
            var list = [];
            for (var x in this.axialMap){
                for (var y in this.axialMap[x]){
                    var node = this.axialMap[x][y];
                    var sprite = Graphics.getSprite('base_tile' + tile);
                    posFunc(sprite,node);
                    sprite.anchor.x = .5;
                    sprite.anchor.y = .5;
                    list.push(sprite);
                }
            }
            list = MapGen.mergeSort(list);
            for (var i = 0; i < list.length;i++){
                container.addChild(list[i]);
            }
            container.position.x = Graphics.width/2;
            container.position.y = Graphics.height/2;
            
            return container;
        },
        update: function(deltaTime){

        }

    }
    window.MapGen = MapGen;
})(window);
