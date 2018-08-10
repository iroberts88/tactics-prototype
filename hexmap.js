//map
var HexMap = function(session){
    this.MAX_HEIGHT = 25;
    this.gameSession = session;
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
    this.startZone1 = [];
    this.startZone2 = [];

    this.losAngle = 1e-6;
}

HexMap.prototype.init = function(data){
	this.axialMap = {};
	this.cubeMap = {};


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

        for (var i = 0; i < data.sz1.length;i++){
            this.startZone1.push(this.axialMap[data.sz1[i].q][data.sz1[i].r]);
        }
        for (var i = 0; i < data.sz2.length;i++){
            this.startZone2.push(this.axialMap[data.sz2[i].q][data.sz2[i].r]);
        }
    }catch(e){
    	console.log(e);
        console.log('Unable to initialize map');
    }
}
HexMap.prototype.initCubeMap = function(){
    //Take an axial map and create its cube map counterpart
    for (var i in this.axialMap){
        for (var j in this.axialMap[i]){
            //get LOS first
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
                deleted: this.axialMap[i][j].deleted
            }
            this.cubeMap[node.x][node.y][node.z] = node;
        }
    }
}

//returns a cube node when given an axial node
HexMap.prototype.getCube = function(axialNode){
    return this.cubeMap[axialNode.q][-axialNode.q-axialNode.r][axialNode.r];
};

//returns an axial node when given a cube node
HexMap.prototype.getAxial = function(cubeNode){
    return this.axialMap[cubeNode.x][cubeNode.z];
};

//finds the neighbor of a cube node in <dir> direction
HexMap.prototype.getCubeNeighbor = function(cubeNode,direction){
    var d = this.cubeDirections[direction];
    try{
        return this.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.z+d[2]];
    }catch(e){
        console.log(e);
    }
    return null;
};

//finds the diagonal neighbor of a cube node in <dir> direction
HexMap.prototype.getCubeDiagonalNeighbor = function(cubeNode,direction){
    try{
        var d = this.cubeDiagonals[direction];
        return this.cubeMap[cubeNode.x+d[0]][cubeNode.y+d[1]][cubeNode.z+d[2]];
    }catch(e){
        return false;
    }
};

//finds the neighbor of an axial node in <dir> direction
HexMap.prototype.getAxialNeighbor = function(axialNode,direction){
    try{
        var d = this.axialDirections[direction];
        return this.axialMap[parseInt(axialNode.q)+d[0]][parseInt(axialNode.r)+d[1]];
    }catch(e){
        return false;
    }
};

//returns the direction when moving from one axial node to another
HexMap.prototype.getNewDirectionAxial = function(startNode,endNode){
    var qMove = startNode.q - endNode.q;
    var rMove = startNode.r - endNode.r;
    for (var i = 0; i < this.axialDirections.length;i++){
        if (qMove == this.axialDirections[i][0] && rMove == this.axialDirections[i][1]){
            return i;
        }
    }
    return null;
};

//returns the direction when moving from one cube node to another
HexMap.prototype.getNewDirectionCube = function(startNode,endNode){
    var xMove = startNode.x - endNode.x;
    var yMove = startNode.y - endNode.y;
    var zMove = startNode.z - endNode.z;
    for (var i = 0; i < this.cubeDirections.length;i++){
        if (xMove == this.cubeDirections[i][0] && yMove == this.cubeDirections[i][1] && zMove == this.cubeDirections[i][2]){
            return i;
        }
    }
    return null;
};

HexMap.prototype.cubeRing = function(center,radius){
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
};

HexMap.prototype.cubeSpiral = function(center,radius){
    var results = [];
    for (var k = 0; k <= radius;k++){
        var arr = this.cubeRing(center,k);
        for (var i = 0; i < arr.length;i++){
            try{
                var c = this.cubeMap[arr[i][0]][arr[i][1]][arr[i][2]];
                results.push(c);
            }catch(e){}
        }
    }
    return results;
};

HexMap.prototype.cubeDistance = function(a,b){
    return Math.round(Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z)));
};

HexMap.prototype.cubeRound = function(cube){
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

HexMap.prototype.cubeLineDraw = function(a,b){
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

HexMap.prototype.lerp = function(a,b,t){
    return a + (b-a) * t;
}
    
HexMap.prototype.cubeLerp = function(a,b,t){
    return {
        x: this.lerp(a.x,b.x,t),
        y: this.lerp(a.y,b.y,t),
        z: this.lerp(a.z,b.z,t)
    }
}

HexMap.prototype.findPath = function(startNode,endNode,options){
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
};

HexMap.prototype.removeGraphNode =  function(arr,node){
    //for use in findPath
    for (var i = 0;i < arr.length;i++){
        if (arr[i] == node){
            arr.splice(i,1);
        }
    }
}
HexMap.prototype.findGraphNode =  function(arr,node){
    //for use in findPath
    for (var i = 0;i < arr.length;i++){
        if (arr[i] == node){
            return true;
        }
    }
    return false;
}

//sort a list of sprites to be added to a container
HexMap.prototype.mergeSort = function(arr){
    if (arr.length <= 1){
        return arr;
    }
    var middle = parseInt(arr.length/2);
    var left = arr.slice(0,middle);
    var right = arr.slice(middle,arr.length);
    return this.merge(this.mergeSort(left),this.mergeSort(right));
}
HexMap.prototype.merge = function(left,right){
    var result = [];
    while (left.length && right.length) {
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

HexMap.prototype.getAxialNode = function(q,r){
    return {
        nodeid: this.gameSession.getId(),
        q:q, //q coord
        r:r, //r coord
        h:0, //height value
        tile: 'base', //tile type
        deleted: false, //the node is deleted from the map and not visible
        unit: null, //use when a player is on the node
    }
}

exports.HexMap = HexMap;
