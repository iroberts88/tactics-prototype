//----------------------------------------------------------------
//gamesession.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    HexMap = require('./hexmap.js').HexMap;

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var GameSession = function (engine) {
    this.gameEngine = engine;
    this.players = {};
    this.playerCount = 0;
    this.id = null;
    this.mapName = 'bunker01';
    this.map = null;
    this.mapData = null;

    this.allUnits = {};
    this.turnOrder = [];
    this.chargeMax = 1000000;
    this.allUnitIds = [];
    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";

    this.currentState = 'preGame';
    this.gameStates = {
        PreGame: 'preGame',
        InGame: 'inGame',
        PostGame: 'postGame'
    }

    this.currentInGameState = 'betweenTurns';
    this.inGameStates = {
        WaitingForTurnInfo: 'waitingForTurnInfo',
        WaitingForReactionInfo: 'waitingForReactionInfo',
        BetweenTurns: 'betweenTurns'
    }

    this.gameHasStarted = false;

    this.ticker = 0;
    this.timePerTurn = 75; //1 minute turns?
    this.timeInBetweenTurns = 1.5;

    this.reactionTicker = 0;
    this.timePerReaction = 30;
};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    this.map = new HexMap(this);
    var names = [];
    for (var i in this.gameEngine.maps){
        names.push(i);
    }
    var name = 'testMap';//names[Math.floor(Math.random()*names.length)];
    //name = this.mapName;
    this.mapData = this.gameEngine.maps[name];
    this.map.init(this.gameEngine.maps[name]);
};


GameSession.prototype.tick = function(deltaTime) {
    this.deltaTime = deltaTime;

    switch(this.currentState){
        case this.gameStates.PreGame:
            this.tickPreGame(deltaTime);
            break;
        case this.gameStates.InGame:
            this.tickInGame(deltaTime);
            break;
        case this.gameStates.PostGame:
            this.tickPostGame(deltaTime);
            break;
    }

    this.emit();
    this.clearQueue();
}

GameSession.prototype.tickPreGame = function(deltaTime) {

    //check if both players are ready then change state
    var playersReady = 0
    for (var player in this.players){
        if (this.players[player].ready){
            playersReady += 1;
        }
    }

    if (playersReady == this.playerCount){
        console.log('Players ready - initializing game');
        for (var i = 0; i < this.allUnitIds.length;i++){
            var unit = this.allUnits[this.allUnitIds[i]];
            unit.reset();
        }
        this.getTurnOrder();

        //send down unit info
        for (var p in this.players){
            var player = this.players[p];
            var myUnits = [];
            var otherUnits = [];
            var turnList = [];
            var turnPercent = [];
            for (var i = 0; i < this.allUnitIds.length;i++){
                var unit = this.allUnits[this.allUnitIds[i]];
                if (player.myUnits[unit.id]){
                    myUnits.push(unit.getClientData());
                }else{
                    var data = unit.getLessClientData();
                    otherUnits.push(data);
                }
            }
            for (var i = 0; i < this.turnOrder.length;i++){
                turnList.push(this.turnOrder[i].id);
                turnPercent.push(this.allUnits[this.turnOrder[i].id].charge/this.chargeMax);
            }
            this.queuePlayer(player,'unitInfo',{myUnits: myUnits,otherUnits: otherUnits,turnList: turnList,turnPercent:turnPercent});
        }
        this.ticker = 0;
        this.currentState = this.gameStates.InGame;
    }
}

GameSession.prototype.tickInGame = function(deltaTime) {
    if (!this.gameHasStarted){
        this.queueData('startGame',{delay: this.timeInBetweenTurns,timePerTurn: this.timePerTurn,timePerReaction: this.timePerReaction});
        this.gameHasStarted = true;
        return;
    }
    switch(this.currentInGameState){
        case this.inGameStates.WaitingForTurnInfo:
            this.ticker += deltaTime;
            if (this.ticker >= this.timePerTurn){
                this.ticker = 0;
                //process turn and get new Turn order
                this.currentInGameState = this.inGameStates.BetweenTurns;
                //first unit has completed the turn??
                //TODO this should be done in the actual turn parsing
                this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax;
                this.getTurnOrder();
                var turnList = [];
                var turnPercent = [];
                for (var i = 0; i < this.turnOrder.length;i++){
                    turnList.push(this.turnOrder[i].id);
                    turnPercent.push(this.allUnits[this.turnOrder[i].id].charge/this.chargeMax);
                }
                this.queueData('newTurnOrder',{turnList:turnList,turnPercent:turnPercent});
            }
            break;
        case this.inGameStates.WaitingForReactionInfo:
            break;
        case this.inGameStates.BetweenTurns:
            this.ticker += deltaTime;
            if (this.ticker >= this.timeInBetweenTurns){
                this.ticker = 0;
                this.currentInGameState = this.inGameStates.WaitingForTurnInfo;
            }
            break;


    }
}

GameSession.prototype.tickPostGame = function(deltaTime) {
    
}

GameSession.prototype.getId = function() {
    var id = this.idIterator + 'x';
    for(var i=0; i<3; i++){
        id += this.possibleIDChars.charAt(Math.floor(Math.random() * this.possibleIDChars.length));
    }
    this.idIterator += 1;
    return id;
}

GameSession.prototype.addPlayer = function(p) {
    this.players[p.id] = p;
    p.setGameSession(this);
    this.playerCount += 1;
}

GameSession.prototype.removePlayer = function(p) {
    p.setGameSession(null);
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameSession.prototype.gameStart = function(){
    console.log("Game " + this.id + ' started');
    //set up units in the map

    //for now just randomize the units and positions
    var sz = 1;
    var used = {};
    for (var p in this.players){
        var player = this.players[p];
        player.identifiedUnits = {};
        player.myUnits = {};
        this.queuePlayer(player,"mapInfo", {mapData: this.mapData});
        for (var i = 0; i < 5;i++){
            var uid = player.user.characters[i].id;
            this.allUnitIds.push(uid);
            this.allUnits[uid] = player.user.characters[i];
            player.myUnits[uid] = uid;
            //init unit health/etc
            this.allUnits[uid].reset();
            //set position on the map
            var haveNode = false;
            var node;
            while(!haveNode){
                node = this.map['startZone' + sz][Math.floor(Math.random()*this.map['startZone' + sz].length)];
                if (!used[node.nodeid]){
                    used[node.nodeid] = 1;
                    node.unit = this.allUnits[uid];
                    this.allUnits[uid].currentNode = node;
                    haveNode = true;
                }
            }
            this.allUnits[uid].direction = this.map.cardinalDirections[Math.floor(Math.random()*this.map.cardinalDirections.length)];
        }
        sz += 1;
    }
    
}

GameSession.prototype.turnSort = function(arr){
    if (arr.length <=1){
        return arr;
    }
    var smaller = [];
    var larger = [];
    var pivotArr = [arr[0]];
    var pivot = arr[0].val;
    for (var x = 1;x < arr.length;x++){
        if (arr[x].val < pivot){
            smaller.push(arr[x]);
        }else if (arr[x].val > pivot){
            larger.push(arr[x]);
        }else{
            //values are equal, randomize turn position in pivot array (TODO -- or go by some other metric?)
            if (Math.round(Math.random())){
                pivotArr.push(arr[x]);
                this.allUnits[arr[x].id].charge -= (x*0.001);
            }else{
                pivotArr.splice(0,0,arr[x]);
                this.allUnits[arr[x].id].charge += (x*0.001);
            }
        }
    }
    smaller = this.turnSort(smaller);
    larger = this.turnSort(larger);
    smaller = smaller.concat(pivotArr);
    
    return smaller.concat(larger);
}
GameSession.prototype.getTurnOrder = function(){
    //new turn
    if (this.turnOrder.length){
        this.allUnits[this.turnOrder[0].id].setMoveLeft(this.allUnits[this.turnOrder[0].id].move.value);
    }
    this.turnOrder = [];
    for (var i = 0; i < this.allUnitIds.length;i++){
        var unit = this.allUnits[this.allUnitIds[i]];
        this.turnOrder.push({val: (this.chargeMax-unit.charge)/unit.speed.value, id: unit.id});
    }
    this.turnOrder = this.turnSort(this.turnOrder);

    for (var i = 0; i < this.allUnitIds.length;i++){
        var unit = this.allUnits[this.allUnitIds[i]];
        unit.charge += this.turnOrder[0].val*unit.speed.value;
    }
}

////////////////////////////////////////////////////////////////
//                  Unit Turn Functions
////////////////////////////////////////////////////////////////
GameSession.prototype.unitMove = function(data){
    var unit = this.allUnits[this.turnOrder[0].id];
    var player = unit.owner.id;
    var enemyPlayer;
    for (var playerid in this.players){
        if (playerid != player){
            enemyPlayer = playerid;
        }
    }
    var actionData = [];
    var enemyPlayerData = [];
    var endingNode = this.map.getCube(data);
    var path = this.map.findPath(this.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:unit.jump.value})
    console.log("path length: " + path.length);
    var stopped = false;
    console.log(unit.moveLeft);
    for (var i = 1; i < path.length;i++){
        if (unit.moveLeft <= 0){
            //the unit is out of moves
            unit.newNode(this.map.getAxial(path[i-1]));
            stopped = true;
            break;
        }
        var nextNode = path[i];
        //TODO check reactions for each moved node

        //set the new node for the unit
        var dir = this.map.getNewDirectionCube(path[i-1],path[i]);
        if (dir){
            unit.direction = this.map.cardinalDirections[dir];
        }
        actionData.push({
            action: 'move',
            unitID: unit.id,
            x: path[i].x,
            y: path[i].y,
            z: path[i].z,
        });
        unit.moveLeft -= 1;
    }
    if (!stopped){
        unit.newNode(this.map.getAxial(path[path.length-1]));
    }

    //send down the action info to all players in the battle
    this.queueData('action',{actionData:actionData});
}
                        
GameSession.prototype.unitAttack = function(data){
    var unit = this.allUnits[this.turnOrder[0].id];
    var player = unit.owner.id;
    var node = this.map.axialMap[data.q][data.r];
    if (!node.unit){return;} //node doesnt have a unit? (some weapons might ignore this?)
    var weapon = unit.getWeapon();
    var validNodes = weapon.getWeaponNodes(this.map,unit.currentNode);
    var actionData = [];
    //check if the node is a valid node
    var valid = false;
    var losMod = 1.0;
    for (var i = 0; i < validNodes.length;i++){
        if (validNodes[i].q == node.q && validNodes[i].r == node.r){
            //check LOS
            var los = this.map.getLOS(unit.currentNode,node);
            console.log(los);
            if (los == 'full'){
                valid = true;
            }else if (los == 'partial'){
                valid = true;
                losMod = 0.5;
            }else if (los == 'none'){
                valid = false
                actionData.push({
                    action: 'noLos',
                    unitID: unit.id
                });
            }
        }
    }
    if (!valid){
        return;
    }
    //TODO check for pre-attack reactions

    //get directional mod
    var d = this.map.getDMod(unit.currentNode,node);
    var tMod = 1.0;
    if (weapon.type == 'gun'){
        tMod += unit.skill.value/100;
    }else if (weapon.type == 'weapon'){
        tMod += unit.power.value/100;
    }
    //execute attack
    node.unit.damage(weapon.eqData.damageType,Math.round((weapon.eqData.damage*tMod)*losMod*d.dMod));
    actionData.push({
        action: 'attack',
        unitID: unit.id,
        weapon: weapon.name,
        newDir: d.newDir,
        unitInfo: [
            {
                target: node.unit.id,
                newHealth: node.unit.currentHealth,
                newShields: node.unit.currentShields
            }
        ]
    });
    //TODO check for post-attack reactions

    //send down action data
    this.queueData('action',{actionData:actionData});
}
                      
GameSession.prototype.unitAbility = function(data){
    console.log(data);
}
                       
GameSession.prototype.unitItem = function(data){

}
                      
GameSession.prototype.unitEnd = function(data){
    var unit = this.allUnits[this.turnOrder[0].id];
    var player = unit.owner.id;
    var enemyPlayer;
    //check correct facing
    var valid = false;
    for(var i = 0; i < this.map.cardinalDirections.length;i++){
        if (this.map.cardinalDirections[i] == data.direction){
            valid = true;
            unit.direction = data.direction;
        }
    }
    if (!valid){return;}
    var actionData = [{
        action: 'face',
        unitID: unit.id,
        direction: data.direction
    }];
    if (this.currentInGameState == this.inGameStates.WaitingForTurnInfo){
        this.ticker = this.timePerTurn;
    }
    //send down the action info to all players in the battle
    this.queueData('action',{actionData:actionData});
}


////////////////////////////////////////////////////////////////
//                  Socket Functions
////////////////////////////////////////////////////////////////

GameSession.prototype.handleDisconnect = function(p,toEngine){
    //remove players and delete session
    console.log("Game " + this.id + ' has ended');
    for (var i in this.players){
        if (!(p.id == i && !toEngine)){
            this.gameEngine.leaveSession(this.id,this.players[i]);
        }
        //TODO send main menu command to every player
    }
    this.gameEngine.removeSession(this.id);
}
//Queue data to all players in the session
GameSession.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
        this.players[i].netQueue.push(data);
    }
}

//Queue data to a specific player
GameSession.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

GameSession.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

GameSession.prototype.emit = function() {
    try{
        for(var i in this.players) {
            if (this.players[i].netQueue.length > 0){
                this.players[i].socket.emit('serverUpdate', this.players[i].netQueue);
            }
        }
    }catch(e){
        try{
            console.log(this.players[i].netQueue);
        }catch(e){}
        console.log(e);
        console.log(i);
    }
}


exports.GameSession = GameSession;
