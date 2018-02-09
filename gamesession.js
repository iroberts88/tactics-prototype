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
    

};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    var session = this;

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
    var params = {
        TableName: 'tactics_maps',
        Key:{
            mapid: this.mapName
        }
    }
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            session.map = new HexMap(session);
            session.mapData = data.Item;
            session.map.init(data.Item);
        }
    });

    //set up units in the map
        //init unit health/etc
        //set position on the map
        //create turn order

    //send map init data to the client
};


GameSession.prototype.tick = function(deltaTime) {
    this.deltaTime = deltaTime;
    this.emit();
    this.clearQueue();
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
