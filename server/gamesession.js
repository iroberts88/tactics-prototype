//----------------------------------------------------------------
//gamesession.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    mongo = require('mongodb').MongoClient,
    HexMap = require('./hexmap.js').HexMap;

var GameSession = function (engine) {
    this.gameEngine = engine;
    this.players = {};
    this.playerCount = 0;
    this.id = null;
    this.mapName = 'test1';
    this.map = null;
    this.mapData = null;
};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    //get map
    var url = 'mongodb://127.0.0.1/lithiumAve';
    var session = this;
    mongo.connect(url, function(err, db) {
        // ---- Attempt to find existing map ----
        var query = { name: session.mapName };
        db.collection('tactics_maps').find(query).toArray(function(err, arr) {
            if (err) throw err;
            if (arr.length == 1 ){
                session.map = new HexMap(session);
                session.mapData = arr[0];
                session.map.init(arr[0]);
            }else{
                console.log('No map named ' + session.mapName);
            }
        });
        db.close();
    });
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
