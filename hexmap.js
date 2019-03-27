//map    
var ENUMS = require('./enums.js').Enums;

var HexMap = function(session){
    this.MAX_HEIGHT = 25;
    this.session = session;
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
    this.cardinalDirectionPositions = {
        'Northeast': 0,
        'Southeast': 1,
        'South': 2,
        'Southwest': 3,
        'Northwest': 4,
        'North': 5
    }
    this.dModEnums = {
        //damage multiplicators for directional attacks
        Behind: 1.5,
        BehindSide: 1.25,
        FrontSide: 1.0,
        Front: 0.75
    };
    this.startZone1 = [];
    this.startZone2 = [];

    this.losAngle = 1e-6;
}

HexMap.prototype.init = function(data){
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
                var node = this.getAxialNode(data.mapData[i][j]);
                this.axialMap[i][j] = node;
            }
        }
        
        this.initCubeMap();

        for (var i = 0; i < data['sz1'].length;i++){
            this.startZone1.push(this.axialMap[data['sz1'][i].q][data['sz1'][i].r]);
        }
        for (var i = 0; i < data['sz2'].length;i++){
            this.startZone2.push(this.axialMap[data['sz2'][i].q][data['sz2'][i].r]);
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
                q: parseInt(i),
                r: parseInt(j),
                deleted: this.axialMap[i][j].deleted,
                h: this.axialMap[i][j].h
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
        //console.log(e);
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
            results.push(this.getAxial(arr[i]));
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
        x: rx,
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
HexMap.prototype.getDMod = function(start,end){
    var dMod = 1.0; 
    var cPos = {
        x: end.x + this.losAngle,
        y: end.y + this.losAngle,
        z: end.z + -this.losAngle*2,
    }
    var cNeg = {
        x: end.x + -this.losAngle,
        y: end.y + -this.losAngle,
        z: end.z + this.losAngle,
    }
    var r1 = this.cubeLineDraw(start,cPos);
    var r2 = this.cubeLineDraw(start,cNeg);
    var d1 = this.getNewDirectionCube(end,r1[r1.length-2]);
    var d2 = this.getNewDirectionCube(end,r2[r2.length-2]);
    if (end.unit){
        var dEnd = this.cardinalDirectionPositions[end.unit.direction];
        var dMod1 = this._getDMod(d1,dEnd);
        var dMod2 = this._getDMod(d2,dEnd);
        dMod *= ((dMod1+dMod2)/2)
    }
    var results = {
        dMod: dMod,
        newDir: null
    }
    if (typeof this.cardinalDirections[d1] != 'undefined'){
        results.newDir = this.cardinalDirections[d1];
    }

    return results;
}
HexMap.prototype._getDMod = function(dir1,dir2){
    
    var val = Math.abs(dir2-dir1);
    if (val > 3){
        val = 6-val;
    }
    if (val == 0){
        return this.dModEnums.Behind;
    }else if (val == 1){
        return this.dModEnums.BehindSide;
    }else if (val == 2){
        return this.dModEnums.FrontSide;
    }else if (val == 3){
        return this.dModEnums.Front;
    }
}
HexMap.prototype.getAngle = function(startHeight,endHeight,length){
    //get the angle between two nodes - for use in getLOS()
    if (endHeight > startHeight){
        return 90 + (180/Math.PI)*Math.atan((endHeight-startHeight)/length);
    }else if (endHeight < startHeight){
        return (180/Math.PI)*Math.atan(length/(startHeight-endHeight));
    }else{
        return 90;
    }
}
HexMap.prototype.getDAngle = function(sNode,eNode){
    //get the angle between two nodes - for use in getLOS()
    var dX = eNode.q-sNode.q;
    var dY = eNode.r-sNode.r;
    if (dX == 0 || dY == 0){
        return 0;
    }
    return Math.abs(Math.tan(dY/dX));
}
HexMap.prototype.getLOS = function(startNode,endNode,hitFirstUnit = null){
    var unit1 = startNode.unit;
    var aH = unit1.height + startNode.h;
    var unit2 = endNode.unit;

    var cPos = {
        x: endNode.x + this.losAngle,
        y: endNode.y + this.losAngle,
        z: endNode.z + -this.losAngle*2,
    }
    var cNeg = {
        x: endNode.x + -this.losAngle,
        y: endNode.y + -this.losAngle,
        z: endNode.z + this.losAngle,
    }
    var r1 = this.cubeLineDraw(startNode,cPos);
    var r2 = this.cubeLineDraw(startNode,cNeg);

    var blocked1 = false;
    var blocked2 = false;
    var highestAngle = 0;

    var r1Unit = null; // the first unit the projectile will hit on the path to the target
    var r2Unit = null;
    for (var j = 1; j < r1.length;j++){
        var a = this.getAxial(r1[j]);
        var h = (j==(r1.length-1)) ? (a.h+unit2.height) : a.h;
        var angle = this.getAngle(aH,h,j);
        if (a.unit && j!=r1.length-1){
            //not the target node, check if the unit is blocking
            console.log('Not unit?!')
            var angle1 = this.getAngle(aH,(a.h+a.unit.height),j);
            var angle2 = this.getAngle(aH,(a.h+unit2.height),(r1.length-1));
            if (angle1 == angle2){
                //unit is blocking
                var dAngle1 = this.getDAngle(startNode,endNode);
                var dAngle2 = this.getDAngle(startNode,a);
                if (dAngle1 == dAngle2){
                    return this.getLOS(startNode,a,a.unit.id);
                }
            }
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
        var a = this.getAxial(r2[j]);
        var h = (j==(r2.length-1)) ? (a.h+unit2.height): a.h;
        var angle = this.getAngle(aH,h,j);
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
    if (blocked1 && blocked2){
        //Full cover / no LoS
        return ['none',hitFirstUnit];
    }else if ((!blocked1 && !blocked2) == false){
        //partial cover / partial los
        return ['partial',hitFirstUnit];
    }else{
        //NO COVER / Full los
        return ['full',hitFirstUnit];
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
    startNode.heu = 0;
    startNode.parent = null;
    endNode.f = 0;
    endNode.g = 0;
    endNode.heu = 0;
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
                    if (axial.unit.owner != options.startingUnit.owner && !axial.unit.hidden){
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
                    node.heu = 0;
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
                    node.heu = Math.max(Math.abs(endNode.x-node.x),Math.abs(endNode.y-node.y),Math.abs(endNode.z-node.z)) + (Math.abs(axial.h - currentAxial.h)*0.001);
                    openList.push(node);
                }else if(gScore < node.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                }

                if(gScoreIsBest) {
                    // Found an optimal (so far) path to this node.  Store info on how we got here and how good it is
                    node.parent = currentNode;
                    node.g = gScore;
                    node.f = node.g + node.heu;
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

HexMap.prototype.getUnitsInRadius = function(center,radius){
    var nodes = this.cubeSpiral(center,radius);
    var results = [];
    for (var i = 0; i < nodes.length;i++){
        if (nodes[i].unit){
            if (nodes[i].unit.fainted || nodes[i].unit.dead){
                continue;
            }
            results.push(nodes[i]);
        }
    }
    return results;
}
HexMap.prototype.getAxialNode = function(data){
    var node = new AxialNode(this.session);
    node.init(data);
    return node;
}

HexMap.prototype.getClientData = function(){
    var cData = {};

    cData[ENUMS.STARTZONE1] = [];
    for (var i = 0; i < this.startZone1.length; i++){
        var node = {}
        node[ENUMS.Q] = this.startZone1[i].q;
        node[ENUMS.R] = this.startZone1[i].r;
        cData[ENUMS.STARTZONE1].push(node)
    }
    cData[ENUMS.STARTZONE2] = [];
    for (var i = 0; i < this.startZone2.length; i++){
        var node = {}
        node[ENUMS.Q] = this.startZone2[i].q;
        node[ENUMS.R] = this.startZone2[i].r;
        cData[ENUMS.STARTZONE2].push(node)
    }
    cData[ENUMS.MAPDATA] = {};
    for (var i in this.axialMap){
        if (typeof cData[ENUMS.MAPDATA][i] == 'undefined'){
            cData[ENUMS.MAPDATA][i] = {};
        }
        for (var j in this.axialMap[i]){
            cData[ENUMS.MAPDATA][i][j] = this.axialMap[i][j].getClientData();
        }
    }
    return cData;
}

exports.HexMap = HexMap;

var AxialNode = function(session){
    this.session = session;
}

AxialNode.prototype.init = function(data){
    this.nodeid = this.session.getId();
    this.q = parseInt(data['q']); //q coord
    this.r = parseInt(data['r']); //r coord
    this.x = parseInt(this.q);
    this.y = parseInt((this.q*-1)-this.r);
    this.z = parseInt(this.r);
    this.h = data['h']; //height value
    this.tile =  data['tile']; //tile type
    this.deleted =  data['deleted']; //the node is deleted from the map and not visible
    this.unit =  null; //use when a player is on the node
}

AxialNode.prototype.getClientData = function(){
    var cData = {};

    cData[ENUMS.NODEID] = this.nodeid;
    cData[ENUMS.Q] = this.q;
    cData[ENUMS.R] = this.r;
    cData[ENUMS.H] = this.h;
    cData[ENUMS.RESOURCE] = this.tile;
    cData[ENUMS.DELETED] = this.deleted;
    return cData;
}
AxialNode.prototype.print = function(){
    console.log('---------------');
    console.log('NODE ID: ' + this.nodeid);
    console.log('Q: ' + this.q);
    console.log('R: ' + this.r);
    console.log('X: ' + this.x);
    console.log('Y: ' + this.y);
    console.log('Z: ' + this.z);
    console.log('H: ' + this.h);
    var u = (this.unit == null) ? 'none' : this.unit.id;
    console.log('Unit?: ' + u);
    return cData;
}


exports.AxialNode = AxialNode;