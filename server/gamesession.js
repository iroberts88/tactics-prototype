//----------------------------------------------------------------
//gamesession.js
//----------------------------------------------------------------

var Player = require('./player.js').Player

var GameSession = function (engine) {
    this.engine = engine;

    this.id = null;
};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    this.lastTime = Date.now();
};

GameSession.prototype.addPlayer = function(p) {
    
}

GameSession.prototype.removePlayer = function(p) {
    
}

//Queue data to all players in the session
GameSession.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    var i;
    for(i in this.players) {
        this.players[i].netQueue.push(data);
    }
}

GameSession.prototype.clearQueue = function() {
    //this.queue = [];
    var i;
    for(i in this.players) {
        this.players[i].netQueue = [];
    }
}

GameSession.prototype.tick = function(deltaTime) {
    this.deltaTime = deltaTime;
}

exports.GameSession = GameSession;
