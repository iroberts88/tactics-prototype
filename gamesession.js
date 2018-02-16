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
    this.mapName = 'test1';
    this.map = null;
    this.mapData = null;

    this.allUnits = {};
    this.turnOrder = [];
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
};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    this.map = new HexMap(this);
    this.mapData = this.gameEngine.maps[this.mapName];
    this.map.init(this.gameEngine.maps[this.mapName]);
};


GameSession.prototype.tick = function(deltaTime) {
    this.deltaTime = deltaTime;

    switch(this.currentState){
        case this.gameStates.PreGame:
            this.tickPreGame();
            break;
        case this.gameStates.InGame:
            this.tickInGame();
            break;
        case this.gameStates.PostGame:
            this.tickPostGame();
            break;
    }

    this.emit();
    this.clearQueue();
}

GameSession.prototype.tickPreGame = function() {

    //check if both players are ready then change state
    var playersReady = 0
    for (var player in this.players){
        if (this.players[player].ready){
            playersReady += 1;
        }
    }

    if (playersReady == this.playerCount){
        console.log('Players ready - initializing game');
        this.getTurnOrder();

        //send down unit info
        this.currentState = this.gameStates.InGame;
    }
}

GameSession.prototype.tickInGame = function() {
    
}

GameSession.prototype.tickPostGame = function() {
    
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
        this.queuePlayer(player,"mapInfo", {mapData: this.mapData});
        for (var i = 0; i < 5;i++){
            var uid = player.user.characters[i].id;
            this.allUnitIds.push(uid);
            this.allUnits[uid] = player.user.characters[i];
            //init unit health/etc
            this.allUnits[uid].reset();
            //set position on the map
            var haveNode = false;
            var node;
            while(!haveNode){
                node = this.map['startZone' + sz][Math.floor(Math.random()*this.map['startZone' + sz].length)];
                if (!used[node.nodeid]){
                    used[node.nodeid] = 1;
                    haveNode = true;
                }
            }
        }
        sz += 1;
    }
    
}

GameSession.prototype.getTurnOrder = function(){

}

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
